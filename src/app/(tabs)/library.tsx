import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryChip } from '@/components/cards/category-chip';
import { GlassPanel } from '@/components/shared/glass-panel';
import { ProgressBar } from '@/components/shared/progress-bar';
import { ScreenShell } from '@/components/shared/screen-shell';
import { SectionHeader } from '@/components/shared/section-header';
import { useBooks } from '@/lib/books/books-provider';
import { useLibrary } from '@/lib/library/use-library';
import { useHighlights } from '@/lib/reader/use-highlights';
import { useAppTheme } from '@/lib/theme/use-app-theme';

type LibraryTab = 'reading' | 'favorites' | 'downloaded' | 'highlights';

export default function LibraryScreen() {
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState<LibraryTab>('reading');

  const { byId } = useBooks();
  const {
    items,
    inProgress: inProgressBooks,
    favorites: favoriteBooks,
    downloaded: downloadedBooks,
  } = useLibrary();
  const { highlights } = useHighlights();
  const uploadedBooks = items.filter((book) => book.source === 'upload');

  return (
    <ScreenShell>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text style={[styles.title, { color: colors.text }]}>Your Library</Text>
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>A quiet place for everything you read.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Upload a book"
          onPress={() => router.push('/upload' as never)}
          style={[styles.uploadButton, { backgroundColor: colors.text }]}>
          <Text style={styles.uploadIcon}>＋</Text>
          <Text style={styles.uploadText}>Upload</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['reading', 'favorites', 'downloaded', 'highlights'] as const).map((tab) => {
          const labels: Record<LibraryTab, string> = {
            reading: '📖 Reading',
            favorites: '♥ Favorites',
            downloaded: '📥 Offline',
            highlights: '✦ Highlights',
          };
          return (
            <CategoryChip
              key={tab}
              label={labels[tab]}
              selected={activeTab === tab}
              onPress={() => setActiveTab(tab)}
            />
          );
        })}
      </View>

      {/* Reading tab */}
      {activeTab === 'reading' && (
        <>
          <SectionHeader title="In Progress" />
          {inProgressBooks.length === 0 && (
            <GlassPanel style={styles.emptyCard}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Your next read starts here</Text>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>Upload a book or open one from the catalog to begin.</Text>
            </GlassPanel>
          )}
          {inProgressBooks.map((book) => (
            <Pressable key={book.id} onPress={() => router.push(`/reader/${book.id}`)}>
              <GlassPanel style={styles.bookRow}>
                <View style={[styles.bookCover, { backgroundColor: book.accent }]}>
                  <Image source={book.cover} style={styles.bookImage} resizeMode="contain" />
                </View>
                <View style={styles.bookInfo}>
                  <Text style={[styles.bookTitle, { color: colors.text }]}>{book.title}</Text>
                  <Text style={[styles.bookAuthor, { color: colors.mutedText }]}>
                    {book.author}
                  </Text>
                  <ProgressBar progress={book.progress ?? 0} height={4} style={styles.progress} />
                  <Text style={[styles.progressText, { color: colors.mutedText }]}>
                    {book.progress}% complete{book.duration ? ` • ${book.duration}` : ''}
                  </Text>
                </View>
              </GlassPanel>
            </Pressable>
          ))}

          {uploadedBooks.length > 0 && (
            <>
              <SectionHeader title="Your Uploads" />
              {uploadedBooks.map((book) => (
                <Pressable key={book.id} onPress={() => router.push(`/book/${book.id}`)}>
                  <GlassPanel style={styles.bookRow}>
                    <View style={[styles.bookCover, { backgroundColor: book.accent }]}>
                      <Image source={book.cover} style={styles.bookImage} resizeMode="cover" />
                    </View>
                    <View style={styles.bookInfo}>
                      <Text numberOfLines={1} style={[styles.bookTitle, { color: colors.text }]}>{book.title}</Text>
                      <Text style={[styles.bookAuthor, { color: colors.mutedText }]}>{book.author}</Text>
                      <Text style={[styles.metaText, { color: colors.primary }]}>Uploaded edition</Text>
                    </View>
                  </GlassPanel>
                </Pressable>
              ))}
            </>
          )}

          {/* Reading goal */}
          <GlassPanel style={styles.goalCard}>
            <Text style={[styles.goalTitle, { color: colors.text }]}>🎯 Daily Goal</Text>
            <Text style={[styles.goalMeta, { color: colors.mutedText }]}>18 of 30 min today</Text>
            <ProgressBar progress={60} height={6} color={colors.success} style={styles.progress} />
          </GlassPanel>
        </>
      )}

      {/* Favorites tab */}
      {activeTab === 'favorites' && (
        <>
          <SectionHeader title="Saved Books" />
          {favoriteBooks.length > 0 ? (
            favoriteBooks.map((book) => (
              <Pressable key={book.id} onPress={() => router.push(`/book/${book.id}`)}>
                <GlassPanel style={styles.bookRow}>
                  <View style={[styles.bookCover, { backgroundColor: book.accent }]}>
                    <Image source={book.cover} style={styles.bookImage} resizeMode="contain" />
                  </View>
                  <View style={styles.bookInfo}>
                    <Text style={[styles.bookTitle, { color: colors.text }]}>{book.title}</Text>
                    <Text style={[styles.bookAuthor, { color: colors.mutedText }]}>
                      {book.author}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaText, { color: colors.primary }]}>
                        ★ {book.rating}
                      </Text>
                      <Text style={[styles.metaText, { color: colors.mutedText }]}>
                        {book.category}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.heartIcon, { color: colors.danger }]}>♥</Text>
                </GlassPanel>
              </Pressable>
            ))
          ) : (
            <GlassPanel style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                No favorites yet. Tap ♥ on any book to save it here.
              </Text>
            </GlassPanel>
          )}
        </>
      )}

      {/* Downloaded tab */}
      {activeTab === 'downloaded' && (
        <>
          <SectionHeader title="Available Offline" />
          <GlassPanel style={styles.storageCard}>
            <Text style={[styles.storageTitle, { color: colors.text }]}>
              {downloadedBooks.length} books downloaded
            </Text>
            <Text style={[styles.storageMeta, { color: colors.mutedText }]}>340 MB used</Text>
            <ProgressBar progress={34} height={4} color={colors.secondary} style={styles.progress} />
          </GlassPanel>

          {downloadedBooks.map((book) => (
            <Pressable key={book.id} onPress={() => router.push(`/reader/${book.id}`)}>
              <GlassPanel style={styles.bookRow}>
                <View style={[styles.bookCover, { backgroundColor: book.accent }]}>
                  <Image source={book.cover} style={styles.bookImage} resizeMode="contain" />
                </View>
                <View style={styles.bookInfo}>
                  <Text style={[styles.bookTitle, { color: colors.text }]}>{book.title}</Text>
                  <Text style={[styles.bookAuthor, { color: colors.mutedText }]}>
                    {book.author}
                  </Text>
                  <Text style={[styles.metaText, { color: colors.success }]}>✓ Downloaded</Text>
                </View>
              </GlassPanel>
            </Pressable>
          ))}
        </>
      )}

      {/* Highlights tab */}
      {activeTab === 'highlights' && (
        <>
          <SectionHeader title="Your Highlights & Notes" />
          {highlights.length === 0 && (
            <GlassPanel style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                No highlights yet. Tap and hold any line while reading to save it here.
              </Text>
            </GlassPanel>
          )}
          {highlights.map((h) => {
            const book = items.find((b) => b.id === h.bookId) ?? byId(h.bookId);
            return (
              <GlassPanel key={h.id} style={styles.highlightCard}>
                <View style={[styles.highlightBar, { backgroundColor: h.color }]} />
                <View style={styles.highlightContent}>
                  <Text style={[styles.highlightQuote, { color: colors.text }]}>“{h.text}”</Text>
                  {h.note && (
                    <Text style={[styles.highlightNote, { color: colors.mutedText }]}>
                      📝 {h.note}
                    </Text>
                  )}
                  <Text style={[styles.highlightMeta, { color: colors.mutedText }]}>
                    {book?.title} • Page {h.page} • {h.createdAt}
                  </Text>
                </View>
              </GlassPanel>
            );
          })}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 22 },
  titleCopy: { flex: 1 },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  uploadButton: { minHeight: 44, borderRadius: 14, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 6 },
  uploadIcon: { color: '#FFFFFF', fontSize: 18, lineHeight: 20 },
  uploadText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  bookRow: {
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  bookCover: {
    width: 72,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
  },
  bookImage: {
    width: 48,
    height: 48,
  },
  bookInfo: {
    flex: 1,
    padding: 14,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  bookAuthor: {
    fontSize: 13,
    marginBottom: 6,
  },
  progress: {
    marginBottom: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  heartIcon: {
    fontSize: 20,
    paddingRight: 16,
  },
  goalCard: {
    padding: 18,
    marginBottom: 14,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  goalMeta: {
    fontSize: 14,
    marginBottom: 10,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  storageCard: {
    padding: 18,
    marginBottom: 14,
  },
  storageTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  storageMeta: {
    fontSize: 13,
    marginBottom: 10,
  },
  highlightCard: {
    flexDirection: 'row',
    marginBottom: 14,
    overflow: 'hidden',
  },
  highlightBar: {
    width: 4,
  },
  highlightContent: {
    flex: 1,
    padding: 16,
  },
  highlightQuote: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  highlightNote: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  highlightMeta: {
    fontSize: 11,
    fontWeight: '600',
  },
});
