import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { AnimatedFadeIn } from '@/components/shared/animated-fade-in';
import { AppButton } from '@/components/shared/app-button';
import { GlassPanel } from '@/components/shared/glass-panel';
import { ScreenShell } from '@/components/shared/screen-shell';
import { useAuth } from '@/lib/auth/auth-context';
import { useAppTheme } from '@/lib/theme/use-app-theme';
import { supabase } from '@/utils/supabase';

type RecoveryState = 'checking' | 'ready' | 'invalid' | 'complete';

function readParams(url: string) {
  const [base, hash = ''] = url.split('#');
  const query = base.split('?')[1] ?? '';
  const parse = (value: string) =>
    Object.fromEntries(
      value
        .split('&')
        .filter(Boolean)
        .map((pair) => {
          const [key, raw = ''] = pair.split('=');
          return [decodeURIComponent(key), decodeURIComponent(raw.replace(/\+/g, ' '))];
        }),
    ) as Record<string, string>;
  return { ...parse(query), ...parse(hash) };
}

export default function ResetPasswordScreen() {
  const { colors } = useAppTheme();
  const { session, updatePassword } = useAuth();
  const url = Linking.useURL();
  const [state, setState] = useState<RecoveryState>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function establishRecoverySession() {
      if (session) {
        setState('ready');
        return;
      }
      if (!url) return;

      const params = readParams(url);
      if (params.error || params.error_description) {
        setError(params.error_description || 'This reset link is no longer valid.');
        setState('invalid');
        return;
      }

      let authError: Error | null = null;
      if (params.code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
        authError = exchangeError;
      } else if (params.access_token && params.refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        authError = sessionError;
      } else {
        const { data } = await supabase.auth.getSession();
        if (!data.session) authError = new Error('This reset link is incomplete or has expired.');
      }

      if (!active) return;
      if (authError) {
        setError(authError.message);
        setState('invalid');
      } else {
        setState('ready');
      }
    }

    establishRecoverySession();
    return () => { active = false; };
  }, [session, url]);

  async function handleUpdate() {
    setError(null);
    if (password.length < 8) {
      setError('Use at least 8 characters for your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setSaving(true);
    const result = await updatePassword(password);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setState('complete');
  }

  return (
    <ScreenShell>
      <AnimatedFadeIn delay={80}>
        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.primary }]}>BOOKOLA</Text>
          <Text style={[styles.title, { color: colors.text }]}>Choose a new password</Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>Keep your reading space secure with a password you do not use elsewhere.</Text>
        </View>
      </AnimatedFadeIn>

      {state === 'checking' && <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />}

      {state === 'ready' && (
        <GlassPanel style={styles.card}>
          <Text style={[styles.label, { color: colors.text }]}>New password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            placeholderTextColor={colors.mutedText}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!saving}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          />
          <Text style={[styles.label, { color: colors.text }]}>Confirm password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat your new password"
            placeholderTextColor={colors.mutedText}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            editable={!saving}
            onSubmitEditing={handleUpdate}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          />
          {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
          <AppButton label={saving ? 'Saving…' : 'Update password'} onPress={saving ? undefined : handleUpdate} />
        </GlassPanel>
      )}

      {state === 'invalid' && (
        <GlassPanel style={styles.messageCard}>
          <Text style={[styles.messageTitle, { color: colors.text }]}>Reset link unavailable</Text>
          <Text style={[styles.message, { color: colors.mutedText }]}>{error}</Text>
          <AppButton label="Request another link" onPress={() => router.replace('/(auth)/forgot-password')} />
        </GlassPanel>
      )}

      {state === 'complete' && (
        <GlassPanel style={styles.messageCard}>
          <Text style={[styles.successMark, { color: colors.success }]}>✓</Text>
          <Text style={[styles.messageTitle, { color: colors.text }]}>Password updated</Text>
          <Text style={[styles.message, { color: colors.mutedText }]}>Your new password is ready to use.</Text>
          <AppButton label="Continue to Bookola" onPress={() => router.replace('/(tabs)/home')} />
        </GlassPanel>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 24, marginBottom: 28 },
  brand: { fontSize: 12, fontWeight: '700', letterSpacing: 2.2, marginBottom: 14 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.6, marginBottom: 10 },
  subtitle: { fontSize: 16, lineHeight: 25, maxWidth: 390 },
  loader: { marginTop: 48 },
  card: { padding: 20 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: { minHeight: 54, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 15, marginBottom: 17 },
  error: { fontSize: 13, lineHeight: 20, fontWeight: '600', marginBottom: 14 },
  messageCard: { padding: 28, alignItems: 'center' },
  successMark: { fontSize: 42, fontWeight: '700', marginBottom: 12 },
  messageTitle: { fontSize: 23, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  message: { fontSize: 15, lineHeight: 23, textAlign: 'center', marginBottom: 22 },
});
