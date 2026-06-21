import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassPanel } from '@/components/shared/glass-panel';
import { AppButton } from '@/components/shared/app-button';
import { useAppTheme } from '@/lib/theme/use-app-theme';
import { Book } from '@/types/book';

type FeaturedBookCardProps = {
  book: Book;
  onRead?: () => void;
};

export function FeaturedBookCard({ book, onRead }: FeaturedBookCardProps) {
  const { colors } = useAppTheme();

  return (
    <GlassPanel style={styles.panel}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: colors.primary }]}>Featured Pick</Text>
          <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
          <Text style={[styles.author, { color: colors.mutedText }]}>by {book.author}</Text>
          <Text style={[styles.description, { color: colors.mutedText }]}>{book.description}</Text>
          <View style={styles.stats}>
            <Text style={[styles.stat, { color: colors.text }]}>★ {book.rating}</Text>
            <Text style={[styles.stat, { color: colors.text }]}>{book.duration}</Text>
          </View>
          <AppButton label="Read Now" onPress={onRead} style={styles.button} />
        </View>
        <Pressable style={[styles.imageWrap, { backgroundColor: book.accent }]}>
          <Image source={book.cover} style={styles.image} resizeMode="contain" />
        </Pressable>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 18,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  copy: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  author: {
    fontSize: 14,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  stats: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  stat: {
    fontSize: 13,
    fontWeight: '700',
  },
  button: {
    alignSelf: 'flex-start',
    minWidth: 120,
  },
  imageWrap: {
    width: 132,
    height: 196,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 100,
  },
});
