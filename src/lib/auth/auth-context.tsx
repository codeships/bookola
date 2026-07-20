import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { supabase } from '@/utils/supabase';

WebBrowser.maybeCompleteAuthSession();

type AuthResult = { error: string | null };

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  /** True until the initial session has been restored from storage. */
  initializing: boolean;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const redirectTo = Linking.createURL('/(auth)/login');
const passwordResetRedirectTo = Linking.createURL('/reset-password');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      initializing,

      async signInWithEmail(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        return { error: error?.message ?? null };
      },

      async signUpWithEmail(email, password, fullName) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: fullName ? { data: { full_name: fullName.trim() } } : undefined,
        });
        return { error: error?.message ?? null };
      },

      async signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error) return { error: error.message };
        if (!data?.url) return { error: 'Could not start Google sign-in.' };

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type !== 'success' || !result.url) {
          return { error: 'Google sign-in was cancelled.' };
        }

        // The callback URL carries the result either as a PKCE `code` query param
        // or as tokens in the fragment (implicit flow) — handle both. Parse
        // manually: React Native's URLSearchParams is unreliable.
        const [base, fragment] = result.url.split('#');
        const query = base.split('?')[1] ?? '';
        const parse = (s: string) =>
          Object.fromEntries(
            s
              .split('&')
              .filter(Boolean)
              .map((pair) => pair.split('=').map(decodeURIComponent)),
          ) as Record<string, string>;
        const queryParams = parse(query);
        const fragmentParams = parse(fragment ?? '');

        if (queryParams.error || fragmentParams.error) {
          return {
            error:
              queryParams.error_description ??
              fragmentParams.error_description ??
              'Google sign-in failed.',
          };
        }

        // PKCE flow: exchange the authorization code for a session.
        if (queryParams.code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            queryParams.code,
          );
          return { error: exchangeError?.message ?? null };
        }

        // Implicit flow: tokens are in the fragment.
        const { access_token, refresh_token } = fragmentParams;
        if (!access_token || !refresh_token) {
          return { error: 'Google sign-in did not return a session.' };
        }
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        return { error: sessionError?.message ?? null };
      },

      async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: passwordResetRedirectTo,
        });
        return { error: error?.message ?? null };
      },

      async updatePassword(password) {
        const { error } = await supabase.auth.updateUser({ password });
        return { error: error?.message ?? null };
      },

      async signOut() {
        await supabase.auth.signOut();
      },
    }),
    [session, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>.');
  }
  return ctx;
}
