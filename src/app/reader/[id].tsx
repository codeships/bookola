import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';

import { GlassPanel } from '@/components/shared/glass-panel';
import { IconButton } from '@/components/shared/icon-button';
import { ProgressBar } from '@/components/shared/progress-bar';
import { upsertBook } from '@/lib/api/books';
import { useResolvedBook } from '@/lib/books/books-provider';
import { useLibrary } from '@/lib/library/use-library';
import { useBookmarks } from '@/lib/reader/use-bookmarks';
import { fetchBookText } from '@/lib/reader/book-text';
import { useHighlights } from '@/lib/reader/use-highlights';
import { useAppSettings } from '@/lib/settings/app-settings';
import { useAppTheme } from '@/lib/theme/use-app-theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HIGHLIGHT_COLORS = ['#FFE08A', '#B5E8D5', '#C4DBFF'];

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useAppTheme();
  const { book, loading } = useResolvedBook(id);
  const { highlights: bookHighlights, add: addHighlight } = useHighlights(book?.id);
  const { bookmarks, toggle: toggleBookmark, hasBookmark } = useBookmarks(book?.id);
  const { setProgress } = useLibrary();
  const { settings, update } = useAppSettings();

  const [pages, setPages] = useState<string[]>([]);
  const [textLoading, setTextLoading] = useState(true);
  const [textError, setTextError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showHighlights, setShowHighlights] = useState(false);

  const fontSize = settings.readerFontSize;
  const cycleFontSize = () => update({ readerFontSize: fontSize >= 22 ? 14 : fontSize + 2 });
  const pageBookmarked = hasBookmark(currentPage + 1);
  const listRef = useRef<FlatList<string>>(null);

  // Jump to a 1-based page number (used by the bookmarks list).
  const goToPage = useCallback((page: number) => {
    const index = Math.max(0, page - 1);
    listRef.current?.scrollToIndex({ index, animated: false });
    setShowHighlights(false);
  }, []);

  const totalPages = pages.length || 1;
  const progress = ((currentPage + 1) / totalPages) * 100;

  // Load the real book text and cache the book so highlight/progress FKs resolve.
  useEffect(() => {
    if (!book) return;
    upsertBook(book).catch(() => {});
    if (!book.readUrl) {
      setTextLoading(false);
      setTextError('This book is not available to read in the app.');
      return;
    }
    let active = true;
    setTextLoading(true);
    setTextError(null);
    fetchBookText(book.readUrl)
      .then((p) => active && setPages(p))
      .catch((e) => active && setTextError(e instanceof Error ? e.message : 'Failed to load text.'))
      .finally(() => active && setTextLoading(false));
    return () => {
      active = false;
    };
  }, [book]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        const index = viewableItems[0].index;
        setCurrentPage(index);
        if (book) {
          setProgress(book, Math.round(((index + 1) / totalPages) * 100));
        }
      }
    },
    [book, totalPages, setProgress],
  );

  // Long-press a page to save a highlight from its opening lines.
  const handleHighlightPage = useCallback(
    (item: string, index: number) => {
      const excerpt = item.replace(/\s+/g, ' ').trim().slice(0, 160);
      addHighlight({
        text: excerpt,
        page: index + 1,
        color: HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length],
      });
      setShowHighlights(true);
    },
    [addHighlight],
  );

  const bg = isDark ? '#0C1220' : '#FAFBFE';

  if (loading || !book || textLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingNote, { color: colors.mutedText }]}>
          {book ? `Loading “${book.title}”…` : 'Loading…'}
        </Text>
      </View>
    );
  }

  if (textError) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: bg }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{textError}</Text>
        <IconButton icon="←" onPress={() => router.back()} variant="glass" size={44} />
      </View>
    );
  }

  const renderPage = ({ item, index }: { item: string; index: number }) => (
    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
      <Pressable
        onPress={() => setShowControls(!showControls)}
        onLongPress={() => handleHighlightPage(item, index)}
        style={styles.pageContent}>
        <Text
          style={[
            styles.chapterLabel,
            { color: colors.primary },
          ]}>
          Chapter {index + 1}
        </Text>
        <Text
          style={[
            styles.pageText,
            {
              color: colors.text,
              fontSize,
              lineHeight: fontSize * settings.readerLineSpacing,
            },
          ]}>
          {item}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0C1220' : '#FAFBFE' }]}>
      {/* Top toolbar */}
      {showControls && (
        <View style={[styles.toolbar, { backgroundColor: colors.background + 'EE' }]}>
          <IconButton icon="←" onPress={() => router.back()} variant="glass" size={40} />
          <View style={styles.toolbarCenter}>
            <Text numberOfLines={1} style={[styles.toolbarTitle, { color: colors.text }]}>
              {book.title}
            </Text>
            <Text style={[styles.toolbarMeta, { color: colors.mutedText }]}>
              Page {currentPage + 1} of {totalPages}
            </Text>
          </View>
          <View style={styles.toolbarRight}>
            <IconButton
              icon="Aa"
              onPress={cycleFontSize}
              variant="glass"
              size={40}
            />
            <IconButton
              icon="✦"
              onPress={() => setShowHighlights(!showHighlights)}
              variant="glass"
              size={40}
              active={showHighlights}
            />
          </View>
        </View>
      )}

      {/* Page content */}
      <FlatList
        ref={listRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={(_, i) => `page-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Bottom bar */}
      {showControls && (
        <View style={[styles.bottomBar, { backgroundColor: colors.background + 'EE' }]}>
          <ProgressBar progress={progress} height={4} />
          <View style={styles.bottomRow}>
            <Text style={[styles.progressLabel, { color: colors.mutedText }]}>
              {Math.round(progress)}% complete
            </Text>
            <View style={styles.bottomActions}>
              <IconButton
                icon="🔖"
                variant="ghost"
                size={36}
                active={pageBookmarked}
                onPress={() => toggleBookmark(currentPage + 1, `Page ${currentPage + 1}`)}
              />
              <IconButton
                icon="📝"
                variant="ghost"
                size={36}
                active={showHighlights}
                onPress={() => setShowHighlights(true)}
              />
              <IconButton
                icon="🎧"
                variant="ghost"
                size={36}
                onPress={() => router.push(`/player/${book.id}`)}
              />
            </View>
          </View>
        </View>
      )}

      {/* Highlights panel */}
      {showHighlights && (
        <View style={[styles.highlightsOverlay, { backgroundColor: colors.background + 'F5' }]}>
          <View style={styles.highlightsHeader}>
            <Text style={[styles.highlightsTitle, { color: colors.text }]}>
              Notes & Highlights
            </Text>
            <IconButton
              icon="✕"
              onPress={() => setShowHighlights(false)}
              variant="ghost"
              size={36}
            />
          </View>

          {bookmarks.length > 0 && (
            <View style={styles.bookmarkRow}>
              {bookmarks.map((b) => (
                <Pressable
                  key={b.id}
                  onPress={() => goToPage(b.page)}
                  style={[styles.bookmarkChip, { borderColor: colors.primary }]}>
                  <Text style={[styles.bookmarkChipText, { color: colors.primary }]}>
                    🔖 {b.label ?? `Page ${b.page}`}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {bookHighlights.length > 0 ? (
            bookHighlights.map((h) => (
              <GlassPanel key={h.id} style={styles.highlightCard}>
                <View style={[styles.highlightBar, { backgroundColor: h.color }]} />
                <View style={styles.highlightContent}>
                  <Text style={[styles.highlightText, { color: colors.text }]}>"{h.text}"</Text>
                  {h.note && (
                    <Text style={[styles.highlightNote, { color: colors.mutedText }]}>
                      📝 {h.note}
                    </Text>
                  )}
                  <Text style={[styles.highlightMeta, { color: colors.mutedText }]}>
                    Page {h.page} • {h.createdAt}
                  </Text>
                </View>
              </GlassPanel>
            ))
          ) : (
            <GlassPanel style={styles.emptyHighlights}>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                No highlights yet. Long-press text while reading to create one.
              </Text>
            </GlassPanel>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  loadingNote: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  toolbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  toolbarCenter: {
    flex: 1,
  },
  toolbarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  toolbarMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  toolbarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  page: {
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
  },
  pageContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 120,
  },
  chapterLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  pageText: {
    fontWeight: '400',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 4,
  },
  highlightsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  highlightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  highlightsTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  bookmarkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  bookmarkChip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bookmarkChipText: {
    fontSize: 13,
    fontWeight: '700',
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
  highlightText: {
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
    fontSize: 12,
  },
  emptyHighlights: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});
