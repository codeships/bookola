import { router } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BookCard } from '@/components/cards/book-card';
import { CategoryChip } from '@/components/cards/category-chip';
import { FeaturedBookCard } from '@/components/cards/featured-book-card';
import { AnimatedFadeIn } from '@/components/shared/animated-fade-in';
import { GlassPanel } from '@/components/shared/glass-panel';
import { ProgressBar } from '@/components/shared/progress-bar';
import { ScreenShell } from '@/components/shared/screen-shell';
import { SectionHeader } from '@/components/shared/section-header';
import { categories } from '@/data/book-sections';
import { useBooks } from '@/lib/books/books-provider';
import { useLibrary } from '@/lib/library/use-library';
import { useAppTheme } from '@/lib/theme/use-app-theme';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { shelves, loading } = useBooks();
  const { getItem } = useLibrary();

  const { featured, trending, recommended } = shelves;
  const heroBook = featured[0];
  const continueBook = featured[1];
  const continueProgress = continueBook ? getItem(continueBook.id)?.progress ?? 0 : 0;
  const quickPicks = [...featured, ...trending.slice(0, 1)];

  if (loading) {
    return (
      <ScreenShell>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      {/* Hero header */}
      <AnimatedFadeIn delay={50}>
        <View style={styles.heroHeader}>
          <View>
            <Text style={[styles.kicker, { color: colors.primary }]}>{getGreeting()}</Text>
            <Text style={[styles.title, { color: colors.text }]}>Your calm{'\n'}reading home</Text>
          </View>
          <Pressable onPress={() => router.push('/settings')}>
            <GlassPanel style={styles.avatarBadge}>
              <Text style={styles.avatarEmoji}>📚</Text>
              <Text style={[styles.avatarText, { color: colors.text }]}>14</Text>
              <Text style={[styles.avatarLabel, { color: colors.mutedText }]}>streak</Text>
            </GlassPanel>
          </Pressable>
        </View>
      </AnimatedFadeIn>

      {/* Featured book */}
      <AnimatedFadeIn delay={150}>
      {heroBook && (
        <FeaturedBookCard
          book={heroBook}
          onRead={() => router.push(`/book/${heroBook.id}`)}
        />
      )}

      {/* Continue reading */}
      {continueBook && (
        <Pressable onPress={() => router.push(`/reader/${continueBook.id}`)}>
          <GlassPanel style={styles.continueCard}>
            <View style={styles.continueRow}>
              <View style={[styles.continueCover, { backgroundColor: continueBook.accent }]}>
                <Image
                  source={continueBook.cover}
                  style={styles.continueCoverImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.continueInfo}>
                <Text style={[styles.continueLabel, { color: colors.primary }]}>
                  CONTINUE READING
                </Text>
                <Text style={[styles.continueTitle, { color: colors.text }]}>
                  {continueBook.title}
                </Text>
                <Text style={[styles.continueMeta, { color: colors.mutedText }]}>
                  {continueProgress > 0 ? 'Pick up where you left off' : 'Start reading'}
                </Text>
                <ProgressBar
                  progress={continueProgress}
                  height={4}
                  style={styles.continueProgress}
                />
                <Text style={[styles.continuePercent, { color: colors.mutedText }]}>
                  {continueProgress}% complete
                </Text>
              </View>
            </View>
          </GlassPanel>
        </Pressable>
      )}
      </AnimatedFadeIn>

      {/* Trending */}
      <AnimatedFadeIn delay={300}>
        <SectionHeader title="Trending Now" action="See all" onAction={() => router.push('/search')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.rowList}
          contentContainerStyle={styles.rowContent}>
          {trending.map((book) => (
            <BookCard key={book.id} book={book} onPress={() => router.push(`/book/${book.id}`)} />
          ))}
        </ScrollView>
      </AnimatedFadeIn>

      {/* Categories */}
      <AnimatedFadeIn delay={450}>
        <SectionHeader title="Browse Categories" action="Explore" onAction={() => router.push('/search')} />
        <View style={styles.categoryWrap}>
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              onPress={() => router.push(`/search?q=${encodeURIComponent(category)}`)}
            />
          ))}
        </View>
      </AnimatedFadeIn>

      {/* AI Recommendations */}
      <AnimatedFadeIn delay={550}>
        <SectionHeader title="Recommended For You" action="✦ AI tuned" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.rowList}
          contentContainerStyle={styles.rowContent}>
          {recommended.map((book) => (
            <BookCard key={book.id} book={book} onPress={() => router.push(`/book/${book.id}`)} />
          ))}
        </ScrollView>
      </AnimatedFadeIn>

      {/* Quick picks */}
      <AnimatedFadeIn delay={650}>
      <SectionHeader title="Quick Picks" />
      {quickPicks.map((book) => (
        <Pressable key={book.id} onPress={() => router.push(`/book/${book.id}`)}>
          <GlassPanel style={styles.quickPickRow}>
            <View style={[styles.quickPickCover, { backgroundColor: book.accent }]}>
              <Image source={book.cover} style={styles.quickPickImage} resizeMode="contain" />
            </View>
            <View style={styles.quickPickInfo}>
              <Text style={[styles.quickPickTitle, { color: colors.text }]}>{book.title}</Text>
              <Text style={[styles.quickPickAuthor, { color: colors.mutedText }]}>
                {book.author}
              </Text>
              <View style={styles.quickPickMeta}>
                <Text style={[styles.quickPickRating, { color: colors.primary }]}>
                  ★ {book.rating}
                </Text>
                <Text style={[styles.quickPickCategory, { color: colors.mutedText }]}>
                  {book.category}
                </Text>
              </View>
            </View>
          </GlassPanel>
        </Pressable>
      ))}
      </AnimatedFadeIn>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 80,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    maxWidth: 260,
  },
  avatarBadge: {
    minWidth: 70,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  continueCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  continueRow: {
    flexDirection: 'row',
  },
  continueCover: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
  },
  continueCoverImage: {
    width: 60,
    height: 60,
  },
  continueInfo: {
    flex: 1,
    padding: 18,
  },
  continueLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  continueTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  continueMeta: {
    fontSize: 13,
    marginBottom: 10,
  },
  continueProgress: {
    marginBottom: 4,
  },
  continuePercent: {
    fontSize: 11,
    fontWeight: '600',
  },
  rowList: {
    marginBottom: 24,
  },
  rowContent: {
    paddingRight: 20,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  quickPickRow: {
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
  },
  quickPickCover: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
  },
  quickPickImage: {
    width: 48,
    height: 48,
  },
  quickPickInfo: {
    flex: 1,
    padding: 16,
  },
  quickPickTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  quickPickAuthor: {
    fontSize: 13,
    marginBottom: 6,
  },
  quickPickMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  quickPickRating: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickPickCategory: {
    fontSize: 13,
  },
});
