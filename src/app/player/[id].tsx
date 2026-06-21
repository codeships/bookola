import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/shared/app-button';
import { GlassPanel } from '@/components/shared/glass-panel';
import { IconButton } from '@/components/shared/icon-button';
import { ProgressBar } from '@/components/shared/progress-bar';
import { formatTime } from '@/lib/api/librivox';
import { useResolvedBook } from '@/lib/books/books-provider';
import { useLibrary } from '@/lib/library/use-library';
import { useAudiobook } from '@/lib/player/use-audiobook';
import { useAppSettings } from '@/lib/settings/app-settings';
import { useAppTheme } from '@/lib/theme/use-app-theme';

const SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];
const SLEEP_OPTIONS = [0, 15, 30, 45, 60]; // minutes; 0 = off

export default function AudioPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { book, loading } = useResolvedBook(id);
  const { audiobook, loading: audioLoading } = useAudiobook(book);
  const { getItem, toggleFavorite } = useLibrary();
  const { settings } = useAppSettings();

  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  const [chapterIndex, setChapterIndex] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [showChapters, setShowChapters] = useState(false);
  const [sleepIndex, setSleepIndex] = useState(0);
  const sleepMinutes = SLEEP_OPTIONS[sleepIndex];

  const chapters = audiobook?.chapters ?? [];
  const currentChapter = chapters[chapterIndex];
  const isFavorite = book ? getItem(book.id)?.isFavorite ?? false : false;
  const progress = status.duration ? (status.currentTime / status.duration) * 100 : 0;

  // Enable playback in silent mode and in the background (iOS bg mode is set in app.json).
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true }).catch(() => {});
  }, []);

  // Load the first chapter when an audiobook resolves.
  useEffect(() => {
    if (audiobook?.chapters[0]) {
      setChapterIndex(0);
      player.replace({ uri: audiobook.chapters[0].url });
    }
  }, [audiobook, player]);

  function changeChapter(index: number, autoplay = false) {
    const clamped = Math.max(0, Math.min(chapters.length - 1, index));
    const ch = chapters[clamped];
    if (!ch) return;
    setChapterIndex(clamped);
    player.replace({ uri: ch.url });
    if (autoplay) player.play();
  }

  // Auto-advance to the next chapter when one finishes.
  useEffect(() => {
    if (settings.autoPlayNext && status.didJustFinish && chapterIndex < chapters.length - 1) {
      changeChapter(chapterIndex + 1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.didJustFinish]);

  function togglePlay() {
    if (status.playing) player.pause();
    else player.play();
  }

  function cycleSpeed() {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    player.setPlaybackRate(SPEEDS[next]);
  }

  function cycleSleep() {
    setSleepIndex((i) => (i + 1) % SLEEP_OPTIONS.length);
  }

  // Pause playback when the sleep timer elapses; re-arm whenever it changes.
  useEffect(() => {
    if (sleepMinutes <= 0) return;
    const timer = setTimeout(() => {
      player.pause();
      setSleepIndex(0);
    }, sleepMinutes * 60 * 1000);
    return () => clearTimeout(timer);
  }, [sleepMinutes, player]);

  function skipBack() {
    if (status.currentTime > 3) player.seekTo(0);
    else changeChapter(chapterIndex - 1, status.playing);
  }

  if (loading || !book || (audioLoading && !audiobook)) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingNote, { color: colors.mutedText }]}>
          {book ? `Finding an audiobook for “${book.title}”…` : 'Loading…'}
        </Text>
      </View>
    );
  }

  if (!audiobook) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={styles.emptyEmoji}>🎧</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No audiobook available</Text>
        <Text style={[styles.loadingNote, { color: colors.mutedText }]}>
          LibriVox doesn’t have a recording for “{book.title}” yet.
        </Text>
        {book.readUrl && (
          <AppButton label="📖 Read instead" onPress={() => router.replace(`/reader/${book.id}`)} style={styles.emptyButton} />
        )}
        <AppButton label="Go back" variant="secondary" onPress={() => router.back()} style={styles.emptyButton} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background gradient orbs */}
      <View style={[styles.orb, styles.orbOne, { backgroundColor: book.accent + '44' }]} />
      <View style={[styles.orb, styles.orbTwo, { backgroundColor: colors.primary + '22' }]} />

      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="←" onPress={() => router.back()} variant="glass" size={40} />
        <Text style={[styles.headerTitle, { color: colors.mutedText }]}>NOW PLAYING</Text>
        <IconButton
          icon="⋮"
          variant="glass"
          size={40}
          onPress={() =>
            Alert.alert(book.title, `by ${book.author}`, [
              { text: 'View book details', onPress: () => router.push(`/book/${book.id}`) },
              { text: isFavorite ? 'Remove favorite' : 'Add to favorites', onPress: () => toggleFavorite(book) },
              ...(book.readUrl
                ? [{ text: 'Read instead', onPress: () => router.replace(`/reader/${book.id}`) }]
                : []),
              { text: 'Cancel', style: 'cancel' as const },
            ])
          }
        />
      </View>

      {/* Album art */}
      <View style={styles.artContainer}>
        <GlassPanel style={{ ...styles.artCard, backgroundColor: book.accent }}>
          <Image source={book.cover} style={styles.coverImage} resizeMode="contain" />
        </GlassPanel>
      </View>

      {/* Book info */}
      <View style={styles.infoSection}>
        <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>{book.title}</Text>
        <Text style={[styles.bookAuthor, { color: colors.mutedText }]}>by {book.author}</Text>
        <Text style={[styles.chapterInfo, { color: colors.primary }]} numberOfLines={1}>
          {chapterIndex + 1}. {currentChapter?.title ?? ''}
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <ProgressBar progress={progress} height={6} />
        <View style={styles.timeRow}>
          <Text style={[styles.time, { color: colors.mutedText }]}>
            {formatTime(status.currentTime)}
          </Text>
          <Text style={[styles.time, { color: colors.mutedText }]}>
            {formatTime(status.duration || currentChapter?.durationSec || 0)}
          </Text>
        </View>
      </View>

      {/* Playback controls */}
      <View style={styles.controls}>
        <Pressable onPress={cycleSpeed} style={styles.speedButton}>
          <Text style={[styles.speedText, { color: colors.text }]}>{SPEEDS[speedIndex]}x</Text>
        </Pressable>

        <IconButton icon="⏮" variant="ghost" size={52} onPress={skipBack} />

        <Pressable
          onPress={togglePlay}
          style={[styles.playButton, { backgroundColor: colors.text }]}>
          {status.isBuffering ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={[styles.playIcon, { color: colors.background }]}>
              {status.playing ? '⏸' : '▶'}
            </Text>
          )}
        </Pressable>

        <IconButton
          icon="⏭"
          variant="ghost"
          size={52}
          onPress={() => changeChapter(chapterIndex + 1, status.playing)}
        />

        <IconButton
          icon={isFavorite ? '♥' : '♡'}
          variant="ghost"
          size={44}
          active={isFavorite}
          onPress={() => toggleFavorite(book)}
        />
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        <Pressable onPress={() => setShowChapters(!showChapters)} style={styles.actionItem}>
          <Text style={[styles.actionIcon, { color: colors.mutedText }]}>☰</Text>
          <Text style={[styles.actionLabel, { color: colors.mutedText }]}>
            Chapters ({chapters.length})
          </Text>
        </Pressable>
        <Pressable onPress={cycleSleep} style={styles.actionItem}>
          <Text style={[styles.actionIcon, { color: sleepMinutes > 0 ? colors.primary : colors.mutedText }]}>
            ⏰
          </Text>
          <Text style={[styles.actionLabel, { color: sleepMinutes > 0 ? colors.primary : colors.mutedText }]}>
            {sleepMinutes > 0 ? `Sleep · ${sleepMinutes}m` : 'Sleep Timer'}
          </Text>
        </Pressable>
        {book.readUrl && (
          <Pressable onPress={() => router.push(`/reader/${book.id}`)} style={styles.actionItem}>
            <Text style={[styles.actionIcon, { color: colors.mutedText }]}>📖</Text>
            <Text style={[styles.actionLabel, { color: colors.mutedText }]}>Read</Text>
          </Pressable>
        )}
      </View>

      {/* Chapters panel */}
      {showChapters && (
        <View style={[styles.chaptersOverlay, { backgroundColor: colors.background + 'F8' }]}>
          <View style={styles.chaptersHeader}>
            <Text style={[styles.chaptersTitle, { color: colors.text }]}>Chapters</Text>
            <IconButton icon="✕" onPress={() => setShowChapters(false)} variant="ghost" size={36} />
          </View>
          <ScrollView style={styles.chapterScroll} showsVerticalScrollIndicator={false}>
            {chapters.map((ch, i) => {
              const active = i === chapterIndex;
              return (
                <Pressable
                  key={ch.url}
                  onPress={() => {
                    changeChapter(i, true);
                    setShowChapters(false);
                  }}
                  style={[
                    styles.chapterRow,
                    { borderBottomColor: colors.border },
                    active && { backgroundColor: colors.primary + '12' },
                  ]}>
                  <View style={styles.chapterInfo2}>
                    <Text
                      style={[styles.chapterNumber, { color: active ? colors.primary : colors.mutedText }]}>
                      {i + 1}
                    </Text>
                    <View style={styles.chapterText}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.chapterName,
                          { color: active ? colors.primary : colors.text },
                          active && { fontWeight: '700' },
                        ]}>
                        {ch.title}
                      </Text>
                      <Text style={[styles.chapterDuration, { color: colors.mutedText }]}>
                        {formatTime(ch.durationSec)}
                      </Text>
                    </View>
                  </View>
                  {active && <Text style={[styles.nowPlaying, { color: colors.primary }]}>▶</Text>}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 32,
  },
  loadingNote: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyButton: {
    width: '100%',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbOne: {
    width: 280,
    height: 280,
    top: -40,
    right: -60,
  },
  orbTwo: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.4,
  },
  artContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  artCard: {
    width: 260,
    height: 260,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: 180,
    height: 180,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  bookTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  bookAuthor: {
    fontSize: 16,
    marginBottom: 8,
  },
  chapterInfo: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 28,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  time: {
    fontSize: 13,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
  },
  speedButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontSize: 14,
    fontWeight: '700',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 28,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionItem: {
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  chaptersOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  chaptersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chaptersTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  chapterScroll: {
    flex: 1,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 12,
    marginBottom: 2,
  },
  chapterInfo2: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chapterNumber: {
    fontSize: 15,
    fontWeight: '700',
    width: 28,
  },
  chapterText: {
    flex: 1,
  },
  chapterName: {
    fontSize: 15,
    marginBottom: 3,
  },
  chapterDuration: {
    fontSize: 12,
  },
  nowPlaying: {
    fontSize: 14,
    fontWeight: '700',
  },
});
