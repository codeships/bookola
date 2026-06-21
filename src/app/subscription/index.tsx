import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/shared/app-button';
import { GlassPanel } from '@/components/shared/glass-panel';
import { IconButton } from '@/components/shared/icon-button';
import { ScreenShell } from '@/components/shared/screen-shell';
import { useProfile } from '@/lib/profile/use-profile';
import { useAppTheme } from '@/lib/theme/use-app-theme';

type Plan = 'monthly' | 'yearly';

const benefits = [
  { icon: '🎧', text: 'Unlimited audiobook listening' },
  { icon: '📥', text: 'Offline reading & downloads' },
  { icon: '✦', text: 'AI-powered recommendations' },
  { icon: '📚', text: 'Exclusive book collections' },
  { icon: '🚫', text: 'Ad-free experience' },
  { icon: '🔖', text: 'Unlimited highlights & notes' },
  { icon: '📊', text: 'Advanced reading analytics' },
  { icon: '🏆', text: 'Community challenges & badges' },
];

export default function SubscriptionScreen() {
  const { colors } = useAppTheme();
  const { display, save } = useProfile();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [processing, setProcessing] = useState(false);

  const isPremium = display.tier === 'premium';

  // Mock checkout: in a real build this hands off to RevenueCat/Stripe; here we
  // simulate a successful purchase by upgrading the profile's tier.
  async function handleStart() {
    if (isPremium) {
      Alert.alert(
        'Cancel Premium?',
        'You will return to the Free plan and lose premium features.',
        [
          { text: 'Keep Premium', style: 'cancel' },
          {
            text: 'Cancel Premium',
            style: 'destructive',
            onPress: async () => {
              await save({ subscriptionTier: 'free' });
            },
          },
        ],
      );
      return;
    }
    setProcessing(true);
    try {
      await save({ subscriptionTier: 'premium' });
      Alert.alert('Welcome to Premium ✨', 'Your 7-day free trial has started. Enjoy unlimited Bookola!', [
        { text: 'Start reading', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Checkout failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <ScreenShell>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="←" onPress={() => router.back()} variant="glass" size={40} />
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.heroEmoji}>✨</Text>
        <Text style={[styles.title, { color: colors.text }]}>Bookola Premium</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Unlock the full reading experience with unlimited access to everything.
        </Text>
      </View>

      {/* Plan cards */}
      <Pressable onPress={() => setSelectedPlan('yearly')}>
        <GlassPanel
          style={selectedPlan === 'yearly'
            ? { ...styles.planCard, borderColor: colors.primary, borderWidth: 2 }
            : styles.planCard
          }>
          {selectedPlan === 'yearly' && (
            <View style={[styles.bestValue, { backgroundColor: colors.primary }]}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
          )}
          <View style={styles.planHeader}>
            <View>
              <Text style={[styles.planName, { color: colors.text }]}>Yearly</Text>
              <Text style={[styles.planSave, { color: colors.success }]}>Save 26%</Text>
            </View>
            <View style={styles.planPricing}>
              <Text style={[styles.planPrice, { color: colors.text }]}>$79.99</Text>
              <Text style={[styles.planPer, { color: colors.mutedText }]}>/year</Text>
            </View>
          </View>
          <Text style={[styles.planMeta, { color: colors.mutedText }]}>
            $6.67/month • Best for deep readers
          </Text>
        </GlassPanel>
      </Pressable>

      <Pressable onPress={() => setSelectedPlan('monthly')}>
        <GlassPanel
          style={selectedPlan === 'monthly'
            ? { ...styles.planCard, borderColor: colors.primary, borderWidth: 2 }
            : styles.planCard
          }>
          <View style={styles.planHeader}>
            <Text style={[styles.planName, { color: colors.text }]}>Monthly</Text>
            <View style={styles.planPricing}>
              <Text style={[styles.planPrice, { color: colors.text }]}>$8.99</Text>
              <Text style={[styles.planPer, { color: colors.mutedText }]}>/month</Text>
            </View>
          </View>
          <Text style={[styles.planMeta, { color: colors.mutedText }]}>
            Flexible access • Cancel anytime
          </Text>
        </GlassPanel>
      </Pressable>

      {/* Benefits */}
      <GlassPanel style={styles.benefitsCard}>
        <Text style={[styles.benefitsTitle, { color: colors.text }]}>What's included</Text>
        {benefits.map((benefit, i) => (
          <View
            key={i}
            style={[
              styles.benefitRow,
              i < benefits.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
            ]}>
            <Text style={styles.benefitIcon}>{benefit.icon}</Text>
            <Text style={[styles.benefitText, { color: colors.text }]}>{benefit.text}</Text>
          </View>
        ))}
      </GlassPanel>

      {/* CTA */}
      <AppButton
        label={
          processing
            ? 'Processing…'
            : isPremium
              ? 'Manage Premium'
              : `Start Premium — ${selectedPlan === 'yearly' ? '$79.99/yr' : '$8.99/mo'}`
        }
        onPress={processing ? undefined : handleStart}
        rightSlot={processing ? <ActivityIndicator color="#FFFFFF" /> : undefined}
        style={styles.ctaButton}
      />

      <Text style={[styles.termsText, { color: colors.mutedText }]}>
        {isPremium
          ? 'You’re on Bookola Premium • Tap above to manage'
          : '7-day free trial • Cancel anytime • Terms apply'}
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
    maxWidth: 300,
  },
  planCard: {
    padding: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  bestValue: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
  },
  bestValueText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
  },
  planSave: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  planPrice: {
    fontSize: 30,
    fontWeight: '800',
  },
  planPer: {
    fontSize: 15,
  },
  planMeta: {
    fontSize: 14,
  },
  benefitsCard: {
    padding: 18,
    marginTop: 8,
    marginBottom: 18,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  benefitIcon: {
    fontSize: 22,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '500',
  },
  ctaButton: {
    marginBottom: 12,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
});
