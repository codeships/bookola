import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AnimatedFadeIn } from '@/components/shared/animated-fade-in';
import { AppButton } from '@/components/shared/app-button';
import { GlassPanel } from '@/components/shared/glass-panel';
import { ScreenShell } from '@/components/shared/screen-shell';
import { useAuth } from '@/lib/auth/auth-context';
import { useAppTheme } from '@/lib/theme/use-app-theme';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    // The root layout redirects to the tabs once the session is set.
    router.replace('/(tabs)/home');
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) setError(error);
  }

  return (
    <ScreenShell>
      <AnimatedFadeIn delay={100}>
        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.primary }]}>BOOKOLA</Text>
          <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>
            Read, listen, and pick up right where you left off.
          </Text>
        </View>
      </AnimatedFadeIn>

      <AnimatedFadeIn delay={250}>
        <GlassPanel style={styles.formCard}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor={colors.mutedText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            editable={!loading && !googleLoading}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          />
          <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
          <TextInput
            placeholder="Enter password"
            placeholderTextColor={colors.mutedText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            editable={!loading && !googleLoading}
            onSubmitEditing={handleLogin}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
          />

          {error ? (
            <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
          ) : null}

          <AppButton
            label={loading ? 'Logging in…' : 'Login'}
            onPress={handleLogin}
            style={styles.fullWidth}
          />

          {/* Google login */}
          <AppButton
            label={googleLoading ? 'Connecting…' : 'Continue with Google'}
            variant="secondary"
            onPress={handleGoogle}
            style={styles.fullWidth}
          />

          <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={[styles.forgot, { color: colors.primary }]}>Forgot password?</Text>
          </Pressable>
        </GlassPanel>
      </AnimatedFadeIn>

      <AnimatedFadeIn delay={400}>
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedText }]}>New here?</Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text style={[styles.footerLink, { color: colors.text }]}>Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </AnimatedFadeIn>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    marginBottom: 28,
  },
  brand: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginBottom: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 25,
    maxWidth: 320,
  },
  formCard: {
    padding: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 16,
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  fullWidth: {
    width: '100%',
    marginTop: 4,
    marginBottom: 12,
  },
  forgot: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
