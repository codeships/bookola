import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CategoryChip } from '@/components/cards/category-chip';
import { GlassPanel } from '@/components/shared/glass-panel';
import { IconButton } from '@/components/shared/icon-button';
import { ScreenShell } from '@/components/shared/screen-shell';
import { SectionHeader } from '@/components/shared/section-header';
import { categories } from '@/data/book-sections';
import { searchCatalog } from '@/lib/api/catalog';
import type { Book } from '@/types/book';
import { useAppTheme } from '@/lib/theme/use-app-theme';

const filters = ['Popular', 'Top Rated', 'Audiobooks', 'New Releases', 'Short Reads'];
const RATINGS = ['Any', '3.5+', '4.0+', '4.5+'] as const;
const FORMATS = ['All', 'eBook', 'Audiobook', 'Both'] as const;
const LENGTHS = ['Any', 'Under 200 pages', '200-400 pages', '400+ pages'] as const;
const SORTS = ['Relevance', 'Rating', 'Newest', 'Most Popular'] as const;

type Rating = (typeof RATINGS)[number];
type Format = (typeof FORMATS)[number];
type Length = (typeof LENGTHS)[number];
type Sort = (typeof SORTS)[number];

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const [activeFilter, setActiveFilter] = useState('Popular');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);

  // Advanced filters
  const [minRating, setMinRating] = useState<Rating>('Any');
  const [format, setFormat] = useState<Format>('All');
  const [length, setLength] = useState<Length>('Any');
  const [sortBy, setSortBy] = useState<Sort>('Relevance');

  // Seed the query when arriving from a category tap on Home.
  useEffect(() => {
    if (params.q) setQuery(params.q);
  }, [params.q]);

  // Debounced search across Project Gutenberg + Open Library.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const found = await searchCatalog(q);
        if (active) setResults(found);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Client-side scoping + sorting of the raw results from the quick filter,
  // the advanced filter sheet, and the chosen sort order.
  const displayed = useMemo(() => {
    let list = [...results];

    // Quick filter (the chips shown above the genre grid).
    if (activeFilter === 'Audiobooks') list = list.filter((b) => b.hasAudio);
    else if (activeFilter === 'Short Reads') list = list.filter((b) => (b.pages ?? 0) > 0 && (b.pages ?? 0) < 250);

    // Advanced: rating floor.
    const floor = minRating === 'Any' ? 0 : parseFloat(minRating);
    if (floor > 0) list = list.filter((b) => b.rating >= floor);

    // Advanced: format.
    if (format === 'eBook') list = list.filter((b) => !!b.readUrl);
    else if (format === 'Audiobook') list = list.filter((b) => b.hasAudio);
    else if (format === 'Both') list = list.filter((b) => !!b.readUrl && b.hasAudio);

    // Advanced: length by page count.
    if (length === 'Under 200 pages') list = list.filter((b) => (b.pages ?? 0) > 0 && (b.pages ?? 0) < 200);
    else if (length === '200-400 pages') list = list.filter((b) => (b.pages ?? 0) >= 200 && (b.pages ?? 0) <= 400);
    else if (length === '400+ pages') list = list.filter((b) => (b.pages ?? 0) > 400);

    // Sort (quick filter "Top Rated" / "New Releases" map onto the same orders).
    const sort = activeFilter === 'Top Rated' ? 'Rating'
      : activeFilter === 'New Releases' ? 'Newest'
      : sortBy;
    if (sort === 'Rating' || sort === 'Most Popular') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'Newest') {
      list.sort((a, b) => (b.publishedYear ?? 0) - (a.publishedYear ?? 0));
    }

    return list;
  }, [results, activeFilter, minRating, format, length, sortBy]);

  const activeFilterCount =
    (minRating !== 'Any' ? 1 : 0) +
    (format !== 'All' ? 1 : 0) +
    (length !== 'Any' ? 1 : 0) +
    (sortBy !== 'Relevance' ? 1 : 0);

  return (
    <ScreenShell>
      <Text style={[styles.title, { color: colors.text }]}>Search</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        Find books by genre, author, popularity, or rating.
      </Text>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surfaceStrong, borderColor: colors.border },
          ]}>
          <Text style={[styles.searchIcon, { color: colors.mutedText }]}>🔍</Text>
          <TextInput
            placeholder="Search books, authors, or topics"
            placeholderTextColor={colors.mutedText}
            value={query}
            onChangeText={setQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Text style={[styles.clearIcon, { color: colors.mutedText }]}>✕</Text>
            </Pressable>
          )}
        </View>
        <IconButton
          icon="⚙"
          onPress={() => setShowFilters(!showFilters)}
          variant="glass"
          size={52}
          active={showFilters}
        />
      </View>

      {/* Search results */}
      {query.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={[styles.resultsCount, { color: colors.mutedText }]}>
            {searching
              ? `Searching for "${query}"…`
              : `${displayed.length} result${displayed.length !== 1 ? 's' : ''} for "${query}"`}
          </Text>
          {searching && results.length === 0 && (
            <ActivityIndicator color={colors.primary} style={styles.searchLoader} />
          )}
          {displayed.map((book) => (
            <Pressable key={book.id} onPress={() => router.push(`/book/${book.id}`)}>
              <GlassPanel style={styles.resultCard}>
                <View style={[styles.resultCover, { backgroundColor: book.accent }]}>
                  <Image source={book.cover} style={styles.resultImage} resizeMode="contain" />
                </View>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultTitle, { color: colors.text }]}>{book.title}</Text>
                  <Text style={[styles.resultAuthor, { color: colors.mutedText }]}>
                    {book.author}
                  </Text>
                  <View style={styles.resultMeta}>
                    <Text style={[styles.resultRating, { color: colors.primary }]}>
                      ★ {book.rating}
                    </Text>
                    <Text style={[styles.resultCategory, { color: colors.mutedText }]}>
                      {book.category}
                    </Text>
                    {book.hasAudio && (
                      <Text style={[styles.audioBadge, { color: colors.secondary }]}>🎧</Text>
                    )}
                  </View>
                </View>
              </GlassPanel>
            </Pressable>
          ))}
          {!searching && displayed.length === 0 && (
            <GlassPanel style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                {results.length > 0
                  ? 'No books match these filters. Try loosening them.'
                  : 'No books found. Try a different search term.'}
              </Text>
            </GlassPanel>
          )}
        </View>
      )}

      {/* Filters & Browse (shown when not searching) */}
      {query.length === 0 && (
        <>
          <SectionHeader title="Quick Filters" />
          <View style={styles.chips}>
            {filters.map((filter) => (
              <CategoryChip
                key={filter}
                label={filter}
                selected={activeFilter === filter}
                onPress={() => setActiveFilter(filter)}
              />
            ))}
          </View>

          <SectionHeader title="Browse by Genre" />
          <View style={styles.genreGrid}>
            {categories.map((category) => {
              const genreIcons: Record<string, string> = {
                Fiction: '📖',
                Romance: '💕',
                Tech: '💻',
                Business: '📊',
                'Islamic Books': '🕌',
                'Self-Help': '🌱',
                Education: '🎓',
              };
              return (
                <Pressable
                  key={category}
                  style={styles.genreCardWrapper}
                  onPress={() => setQuery(category)}>
                  <GlassPanel style={styles.genreCard}>
                    <Text style={styles.genreIcon}>{genreIcons[category] ?? '📚'}</Text>
                    <Text style={[styles.genreLabel, { color: colors.text }]}>{category}</Text>
                  </GlassPanel>
                </Pressable>
              );
            })}
          </View>

          <GlassPanel style={styles.suggestedCard}>
            <Text style={[styles.suggestedTitle, { color: colors.text }]}>✦ Try searching</Text>
            <Text style={[styles.suggestedText, { color: colors.mutedText }]}>
              "focus", "habits", "romance", "Islamic personal growth", or "clean architecture"
            </Text>
          </GlassPanel>
        </>
      )}

      {/* Advanced filters modal */}
      {showFilters && (
        <View style={[styles.filterOverlay, { backgroundColor: colors.background + 'F5' }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>
              Advanced Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
            <IconButton icon="✕" onPress={() => setShowFilters(false)} variant="ghost" size={36} />
          </View>

          <Text style={[styles.filterLabel, { color: colors.primary }]}>RATING</Text>
          <View style={styles.chips}>
            {RATINGS.map((r) => (
              <CategoryChip key={r} label={r} selected={r === minRating} onPress={() => setMinRating(r)} />
            ))}
          </View>

          <Text style={[styles.filterLabel, { color: colors.primary }]}>FORMAT</Text>
          <View style={styles.chips}>
            {FORMATS.map((f) => (
              <CategoryChip key={f} label={f} selected={f === format} onPress={() => setFormat(f)} />
            ))}
          </View>

          <Text style={[styles.filterLabel, { color: colors.primary }]}>LENGTH</Text>
          <View style={styles.chips}>
            {LENGTHS.map((l) => (
              <CategoryChip key={l} label={l} selected={l === length} onPress={() => setLength(l)} />
            ))}
          </View>

          <Text style={[styles.filterLabel, { color: colors.primary }]}>SORT BY</Text>
          <View style={styles.chips}>
            {SORTS.map((s) => (
              <CategoryChip key={s} label={s} selected={s === sortBy} onPress={() => setSortBy(s)} />
            ))}
          </View>

          <Pressable
            onPress={() => {
              setMinRating('Any');
              setFormat('All');
              setLength('Any');
              setSortBy('Relevance');
            }}
            style={styles.resetRow}>
            <Text style={[styles.resetText, { color: colors.primary }]}>Reset filters</Text>
          </Pressable>
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    gap: 10,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 16,
    padding: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  genreCardWrapper: {
    width: '47%',
  },
  genreCard: {
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  genreIcon: {
    fontSize: 28,
  },
  genreLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestedCard: {
    padding: 18,
    marginTop: 4,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  suggestedText: {
    fontSize: 14,
    lineHeight: 22,
  },
  resultsSection: {
    marginBottom: 14,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14,
  },
  searchLoader: {
    marginTop: 20,
  },
  resultCard: {
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
  },
  resultCover: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
  },
  resultImage: {
    width: 48,
    height: 48,
  },
  resultInfo: {
    flex: 1,
    padding: 14,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  resultAuthor: {
    fontSize: 13,
    marginBottom: 6,
  },
  resultMeta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  resultRating: {
    fontSize: 13,
    fontWeight: '700',
  },
  resultCategory: {
    fontSize: 12,
  },
  audioBadge: {
    fontSize: 14,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 10,
    marginTop: 8,
  },
  resetRow: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
