import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassPanel } from '@/components/shared/glass-panel';
import { useAppTheme } from '@/lib/theme/use-app-theme';
import { Book } from '@/types/book';

type BookCardProps = {
  book: Book;
  onPress?: () => void;
};

export function BookCard({ book, onPress }: BookCardProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <GlassPanel style={styles.panel}>
        <View style={[styles.coverWrap, { backgroundColor: book.accent }]}>
          <Image source={book.cover} style={styles.cover} resizeMode="contain" />
        </View>
        <View style={styles.content}>
          <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
            {book.title}
          </Text>
          <Text numberOfLines={1} style={[styles.author, { color: colors.mutedText }]}>
            {book.author}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.pill, { color: colors.primary }]}>{book.category}</Text>
            <Text style={[styles.rating, { color: colors.text }]}>★ {book.rating}</Text>
          </View>
        </View>
      </GlassPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 180,
    marginRight: 14,
  },
  panel: {
    padding: 12,
  },
  coverWrap: {
    height: 170,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cover: {
    width: 110,
    height: 110,
  },
  content: {
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  author: {
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pill: {
    fontSize: 12,
    fontWeight: '700',
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
  },
});
