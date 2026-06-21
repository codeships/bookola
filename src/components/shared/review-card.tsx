import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassPanel } from '@/components/shared/glass-panel';
import { useAppTheme } from '@/lib/theme/use-app-theme';
import { Review } from '@/types/book';

type ReviewCardProps = {
  review: Review;
  onLike?: () => void;
};

export function ReviewCard({ review, onLike }: ReviewCardProps) {
  const { colors } = useAppTheme();
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

  return (
    <GlassPanel style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '22' }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{review.avatar}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{review.userName}</Text>
          <Text style={[styles.stars, { color: colors.accent }]}>{stars}</Text>
        </View>
        <Text style={[styles.timeAgo, { color: colors.mutedText }]}>{review.timeAgo}</Text>
      </View>
      <Text style={[styles.reviewText, { color: colors.text }]}>{review.text}</Text>
      <View style={styles.footer}>
        <Pressable onPress={onLike} style={styles.likeButton}>
          <Text style={{ color: review.isLiked ? colors.danger : colors.mutedText, fontSize: 16 }}>
            {review.isLiked ? '♥' : '♡'}
          </Text>
          <Text style={[styles.likeCount, { color: colors.mutedText }]}>{review.likes}</Text>
        </Pressable>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  stars: {
    fontSize: 13,
    letterSpacing: 2,
  },
  timeAgo: {
    fontSize: 12,
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeCount: {
    fontSize: 13,
    fontWeight: '600',
  },
});
