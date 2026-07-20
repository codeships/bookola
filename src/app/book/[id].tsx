import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AnimatedFadeIn } from '@/components/shared/animated-fade-in';
import { AppButton } from '@/components/shared/app-button';
import { GlassPanel } from '@/components/shared/glass-panel';
import { IconButton } from '@/components/shared/icon-button';
import { ProgressBar } from '@/components/shared/progress-bar';
import { ReviewCard } from '@/components/shared/review-card';
import { ScreenShell } from '@/components/shared/screen-shell';
import { useAuth } from '@/lib/auth/auth-context';
import { upsertBook } from '@/lib/api/books';
import { downloadBook } from '@/lib/api/downloads';
import { useResolvedBook } from '@/lib/books/books-provider';
import { useLibrary } from '@/lib/library/use-library';
import { useAudiobook } from '@/lib/player/use-audiobook';
import { useReviews } from '@/lib/reviews/use-reviews';
import { useProfile } from '@/lib/profile/use-profile';
import { useAppTheme } from '@/lib/theme/use-app-theme';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { book, loading } = useResolvedBook(id);
  const { user } = useAuth();
  const { display } = useProfile();
  const { available: hasAudiobook, loading: audioChecking } = useAudiobook(book);
  const { getItem, toggleFavorite, toggleDownloaded } = useLibrary();
  const { reviews, submit: submitReview, toggleLike } = useReviews(book?.id);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [draftRating, setDraftRating] = useState(5);
  const [draftText, setDraftText] = useState('');
  const [postingReview, setPostingReview] = useState(false);

  async function handlePostReview() {
    if (!draftText.trim() || !book) return;
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to post a review.');
      return;
    }
    setPostingReview(true);
    try {
      // Cache the catalog book first so the review's book_id FK resolves
      // (external books aren't in public.books until a user interacts with them).
      await upsertBook(book);
      await submitReview({ rating: draftRating, body: draftText.trim() });
      setDraftText('');
      setDraftRating(5);
    } catch (e) {
      Alert.alert('Could not post review', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setPostingReview(false);
    }
  }

  async function handleDownload() {
    if (!book) return;
    setDownloading(true);
    try {
      await downloadBook(book);
      if (!getItem(book.id)?.isDownloaded) toggleDownloaded(book);
    } catch (e) {
      Alert.alert('Download failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <ScreenShell>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </ScreenShell>
    );
  }

  if (!book) {
    return (
      <ScreenShell>
        <View style={styles.headerRow}>
          <IconButton icon="←" onPress={() => router.back()} variant="glass" size={40} />
        </View>
        <GlassPanel style={styles.section}>
          <Text style={[styles.sectionText, { color: colors.mutedText }]}>
            This book could not be found.
          </Text>
        </GlassPanel>
      </ScreenShell>
    );
  }

  const libItem = getItem(book.id);
  const isFavorite = libItem?.isFavorite ?? false;
  const progress = libItem?.progress ?? 0;

  return (
    <ScreenShell>
      {/* Header */}
      <View style={styles.headerRow}>
        <IconButton icon="←" onPress={() => router.back()} variant="glass" size={40} />
        <IconButton
          icon={isFavorite ? '♥' : '♡'}
          onPress={() => toggleFavorite(book)}
          variant="glass"
          size={40}
          active={isFavorite}
        />
      </View>

      {/* Hero card */}
      <AnimatedFadeIn delay={100}>
      <GlassPanel style={styles.heroCard}>
        <View style={[styles.coverArea, { backgroundColor: book.accent }]}>
          <Image source={book.cover} style={styles.cover} resizeMode="cover" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
        <Text style={[styles.author, { color: colors.mutedText }]}>by {book.author}</Text>

        {/* Meta pills */}
        <View style={styles.metaRow}>
          <View style={[styles.metaPill, { backgroundColor: colors.primary + '18' }]}>
            <Text style={[styles.metaPillText, { color: colors.primary }]}>★ {book.rating}</Text>
          </View>
          <View style={[styles.metaPill, { backgroundColor: colors.accent + '22' }]}>
            <Text style={[styles.metaPillText, { color: colors.accent }]}>{book.category}</Text>
          </View>
          {book.duration && (
            <View style={[styles.metaPill, { backgroundColor: colors.secondary + '22' }]}>
              <Text style={[styles.metaPillText, { color: colors.secondary }]}>
                🎧 {book.duration}
              </Text>
            </View>
          )}
        </View>

        {/* Progress if exists */}
        {progress > 0 && (
          <View style={styles.progressSection}>
            <ProgressBar progress={progress} height={5} />
            <Text style={[styles.progressText, { color: colors.mutedText }]}>
              {progress}% complete
            </Text>
          </View>
        )}
      </GlassPanel>
      </AnimatedFadeIn>

      {/* CTA buttons */}
      <AnimatedFadeIn delay={250}>
      {book.readUrl || hasAudiobook ? (
        <View style={styles.ctaRow}>
          {book.readUrl && (
            <AppButton
              label="📖 Read"
              onPress={() =>
                book.source === 'upload'
                  ? Linking.openURL(book.readUrl!)
                  : router.push(`/reader/${book.id}`)
              }
              style={styles.ctaButton}
            />
          )}
          {hasAudiobook && (
            <AppButton
              label="🎧 Listen"
              variant="secondary"
              onPress={() => router.push(`/player/${book.id}`)}
              style={styles.ctaButton}
            />
          )}
        </View>
      ) : audioChecking ? (
        <GlassPanel style={styles.section}>
          <Text style={[styles.sectionText, { color: colors.mutedText }]}>
            Checking for an audiobook…
          </Text>
        </GlassPanel>
      ) : (
        <GlassPanel style={styles.section}>
          <Text style={[styles.sectionText, { color: colors.mutedText }]}>
            Preview only — full text isn’t available for this title.
          </Text>
        </GlassPanel>
      )}

      {book.downloadUrl && book.source !== 'upload' && (
        <AppButton
          label={downloading ? 'Downloading…' : '⬇ Download EPUB'}
          variant="secondary"
          onPress={downloading ? undefined : handleDownload}
          style={styles.downloadButton}
        />
      )}

      </AnimatedFadeIn>

      {/* Book details */}
      <AnimatedFadeIn delay={350}>
      <GlassPanel style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailValue, { color: colors.text }]}>{book.pages ?? '—'}</Text>
            <Text style={[styles.detailLabel, { color: colors.mutedText }]}>Pages</Text>
          </View>
          <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
          <View style={styles.detailItem}>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {book.language ?? 'English'}
            </Text>
            <Text style={[styles.detailLabel, { color: colors.mutedText }]}>Language</Text>
          </View>
          <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
          <View style={styles.detailItem}>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {book.publishedYear ?? '—'}
            </Text>
            <Text style={[styles.detailLabel, { color: colors.mutedText }]}>Published</Text>
          </View>
        </View>
      </GlassPanel>

      </AnimatedFadeIn>

      {/* Description */}
      <GlassPanel style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
        <Text
          style={[styles.sectionText, { color: colors.mutedText }]}
          numberOfLines={showFullDescription ? undefined : 3}>
          {book.description}
        </Text>
        <Pressable onPress={() => setShowFullDescription(!showFullDescription)}>
          <Text style={[styles.readMore, { color: colors.primary }]}>
            {showFullDescription ? 'Show less' : 'Read more'}
          </Text>
        </Pressable>
      </GlassPanel>

      {/* Reviews */}
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Reviews ({reviews.length})
          </Text>
        </View>

        {/* Composer */}
        {user && (
          <GlassPanel style={styles.composer}>
            <Text style={[styles.composerLabel, { color: colors.text }]}>Write a review</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setDraftRating(n)} hitSlop={6}>
                  <Text style={[styles.star, { color: colors.accent }]}>
                    {n <= draftRating ? '★' : '☆'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              placeholder="Share your thoughts about this book…"
              placeholderTextColor={colors.mutedText}
              value={draftText}
              onChangeText={setDraftText}
              multiline
              editable={!postingReview}
              style={[styles.composerInput, { color: colors.text, borderColor: colors.border }]}
            />
            <AppButton
              label={postingReview ? 'Posting…' : 'Post review'}
              onPress={postingReview || !draftText.trim() ? undefined : handlePostReview}
              style={!draftText.trim() ? { ...styles.composerButton, opacity: 0.5 } : styles.composerButton}
            />
          </GlassPanel>
        )}

        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onLike={() => toggleLike(review)} />
          ))
        ) : (
          <GlassPanel style={styles.section}>
            <Text style={[styles.sectionText, { color: colors.mutedText }]}>
              No reviews yet. Be the first to share your thoughts!
            </Text>
          </GlassPanel>
        )}
      </View>

      {/* AI recommendation */}
      <GlassPanel style={styles.aiSection}>
        <Text style={[styles.aiLabel, { color: colors.primary }]}>✦ AI RECOMMENDATION</Text>
        <Text style={[styles.sectionText, { color: colors.mutedText }]}>
          {display.favoriteGenres.length > 0
            ? `Based on your interest in ${display.favoriteGenres.slice(0, 2).join(' and ')}, this ${book.category} title is a strong match for your reading taste.`
            : `A standout ${book.category} pick — readers who enjoy focused, growth-oriented books rate this highly.`}
        </Text>
      </GlassPanel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: 80,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroCard: {
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
  },
  coverArea: {
    width: '100%',
    height: 300,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  cover: {
    width: 180,
    height: 250,
    borderRadius: 8,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  author: {
    fontSize: 16,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  metaPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressSection: {
    width: '100%',
    marginTop: 18,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  ctaButton: {
    flex: 1,
  },
  downloadButton: {
    width: '100%',
    marginBottom: 18,
  },
  detailsCard: {
    marginBottom: 18,
    padding: 18,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailDivider: {
    width: 1,
    height: 32,
  },
  section: {
    padding: 18,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  reviewsSection: {
    marginBottom: 4,
  },
  reviewsHeader: {
    marginBottom: 12,
  },
  composer: {
    padding: 18,
    marginBottom: 14,
  },
  composerLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  starRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  star: {
    fontSize: 26,
    letterSpacing: 2,
  },
  composerInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  composerButton: {
    width: '100%',
  },
  aiSection: {
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#5B8CFF',
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 10,
  },
});
