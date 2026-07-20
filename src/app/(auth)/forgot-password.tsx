import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/shared/app-button';
import { AnimatedFadeIn } from '@/components/shared/animated-fade-in';
import { GlassPanel } from '@/components/shared/glass-panel';
import { IconButton } from '@/components/shared/icon-button';
import { ScreenShell } from '@/components/shared/screen-shell';
import { useAuth } from '@/lib/auth/auth-context';
import { useAppTheme } from '@/lib/theme/use-app-theme';

export default function ForgotPasswordScreen() {
  const { colors } = useAppTheme();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setSent(true);
  }

  return (
    <ScreenShell>
      <View style={styles.header}>
        <IconButton icon="←" onPress={() => router.back()} variant="glass" size={40} />
      </View>

      <AnimatedFadeIn delay={100}>
        <Text style={[styles.brand, { color: colors.primary }]}>BOOKOLA</Text>
        <Text style={[styles.title, { color: colors.text }]}>Reset your password</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Enter your email and we’ll send you a link to get back into your reading space.
        </Text>
      </AnimatedFadeIn>

      <AnimatedFadeIn delay={250}>
        {!sent ? (
          <GlassPanel style={styles.formCard}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Email address</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!loading}
              onSubmitEditing={handleSend}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            />
            {error ? (
              <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
            ) : null}
            <AppButton
              label={loading ? 'Sending…' : 'Send Reset Link'}
              onPress={handleSend}
              style={styles.fullWidth}
            />
          </GlassPanel>
        ) : (
          <GlassPanel style={styles.successCard}>
            <Text style={styles.successEmoji}>✉️</Text>
            <Text style={[styles.successTitle, { color: colors.text }]}>Check your inbox</Text>
            <Text style={[styles.successText, { color: colors.mutedText }]}>
              We sent a reset link to {email || 'your email'}. It may take a minute to arrive.
            </Text>
            <AppButton
              label="Back to Login"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.fullWidth}
            />
            <Pressable onPress={() => setSent(false)}>
              <Text style={[styles.resend, { color: colors.primary }]}>
                Didn’t receive it? Send again
              </Text>
            </Pressable>
          </GlassPanel>
        )}
      </AnimatedFadeIn>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
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
    maxWidth: 330,
    marginBottom: 28,
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
  },
  successCard: {
    padding: 28,
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  successText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  resend: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
  },
});
