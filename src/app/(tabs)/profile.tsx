import { router } from 'expo-router';
import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/shared/app-button';
import { GlassPanel } from '@/components/shared/glass-panel';
import { ProgressBar } from '@/components/shared/progress-bar';
import { ScreenShell } from '@/components/shared/screen-shell';
import { SectionHeader } from '@/components/shared/section-header';
import { StatCard } from '@/components/shared/stat-card';
import { useLibrary } from '@/lib/library/use-library';
import { useProfile } from '@/lib/profile/use-profile';
import { useHighlights } from '@/lib/reader/use-highlights';
import { useAppTheme } from '@/lib/theme/use-app-theme';

const GENRE_COLORS = ['primary', 'secondary', 'accent', 'accentSoft', 'success'] as const;

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const { display } = useProfile();
  const { items, favorites } = useLibrary();
  const { highlights } = useHighlights();

  const booksFinished = items.filter((b) => b.progress >= 100).length;

  // Genre breakdown derived from the books in the user's library.
  const genreBreakdown = useMemo(() => {
    if (items.length === 0) return [];
    const counts = new Map<string, number>();
    items.forEach((b) => counts.set(b.category, (counts.get(b.category) ?? 0) + 1));
    return [...counts.entries()]
      .map(([genre, count]) => ({ genre, percent: Math.round((count / items.length) * 100) }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5);
  }, [items]);

  const favoriteGenre = display.favoriteGenres[0] ?? genreBreakdown[0]?.genre ?? '—';

  return (
    <ScreenShell>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        {display.avatarUrl ? (
          <Image source={{ uri: display.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.primary + '22' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {display.initials || '👤'}
            </Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: colors.text }]}>{display.name}</Text>
          <Text style={[styles.tagline, { color: colors.mutedText }]} numberOfLines={1}>
            {display.email}
          </Text>
        </View>
        <Pressable onPress={() => router.push('/settings')}>
          <GlassPanel style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </GlassPanel>
        </Pressable>
      </View>

      {/* Stats grid (computed from the user's library & highlights) */}
      <View style={styles.statsRow}>
        <StatCard value={String(booksFinished)} label="Books finished" icon="📚" />
        <StatCard value={String(items.length)} label="In library" icon="📖" />
      </View>
      <View style={styles.statsRow}>
        <StatCard value={String(highlights.length)} label="Highlights" icon="✦" />
        <StatCard value={String(favorites.length)} label="Favorites" icon="♥" />
      </View>

      {/* Reading insights */}
      <SectionHeader title="Reading Insights" />
      <GlassPanel style={styles.insightCard}>
        <Text style={[styles.insightTitle, { color: colors.text }]}>📊 Your Reading Profile</Text>
        <View style={styles.insightRow}>
          <Text style={[styles.insightLabel, { color: colors.mutedText }]}>Favorite genre</Text>
          <Text style={[styles.insightValue, { color: colors.text }]}>{favoriteGenre}</Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={[styles.insightLabel, { color: colors.mutedText }]}>Notes written</Text>
          <Text style={[styles.insightValue, { color: colors.text }]}>
            {highlights.filter((h) => h.note).length}
          </Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={[styles.insightLabel, { color: colors.mutedText }]}>Membership</Text>
          <Text style={[styles.insightValue, { color: colors.text }]}>
            {display.tier === 'premium' ? 'Premium' : 'Free'}
          </Text>
        </View>
      </GlassPanel>

      {/* Genre breakdown (from your library) */}
      {genreBreakdown.length > 0 && (
        <>
          <SectionHeader title="Genre Breakdown" />
          <GlassPanel style={styles.genreCard}>
            {genreBreakdown.map((item, i) => (
              <View key={item.genre} style={styles.genreRow}>
                <Text style={[styles.genreLabel, { color: colors.text }]}>{item.genre}</Text>
                <View style={styles.genreBarWrap}>
                  <ProgressBar
                    progress={item.percent}
                    height={6}
                    color={colors[GENRE_COLORS[i % GENRE_COLORS.length]]}
                  />
                </View>
                <Text style={[styles.genrePercent, { color: colors.mutedText }]}>
                  {item.percent}%
                </Text>
              </View>
            ))}
          </GlassPanel>
        </>
      )}

      {/* Subscription CTA */}
      <GlassPanel style={{ ...styles.premiumCard, borderColor: colors.primary, borderWidth: 1.5 }}>
        <Text style={styles.premiumEmoji}>✨</Text>
        <Text style={[styles.premiumTitle, { color: colors.text }]}>Upgrade to Premium</Text>
        <Text style={[styles.premiumText, { color: colors.mutedText }]}>
          Unlimited audio, offline downloads, exclusive collections, and smarter AI recommendations.
        </Text>
        <AppButton
          label="View Plans"
          onPress={() => router.push('/subscription')}
          style={styles.premiumButton}
        />
      </GlassPanel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
  },
  settingsButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  streakCard: {
    padding: 20,
    marginBottom: 18,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 18,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  streakLabel: {
    fontSize: 16,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekDay: {
    alignItems: 'center',
    gap: 8,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  insightCard: {
    padding: 18,
    marginBottom: 14,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  insightLabel: {
    fontSize: 14,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  insightText: {
    fontSize: 15,
    lineHeight: 24,
  },
  genreCard: {
    padding: 18,
    marginBottom: 18,
  },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  genreLabel: {
    fontSize: 13,
    fontWeight: '600',
    width: 95,
  },
  genreBarWrap: {
    flex: 1,
    marginHorizontal: 10,
  },
  genrePercent: {
    fontSize: 13,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },
  premiumCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  premiumEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  premiumText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  premiumButton: {
    width: '100%',
  },
});
