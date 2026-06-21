import { useCallback, useEffect, useState } from 'react';

import {
  fetchRecentReviews,
  fetchReviews,
  setReviewLike,
  upsertReview,
} from '@/lib/api/reviews';
import { useAuth } from '@/lib/auth/auth-context';
import type { Review } from '@/types/book';

/**
 * Loads reviews for one book (when `bookId` is given) or the community feed
 * (when it isn't), and exposes submit + like mutations.
 */
export function useReviews(bookId?: string) {
  const { user } = useAuth();
  const userId = user?.id;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setReviews(bookId ? await fetchReviews(bookId, userId) : await fetchRecentReviews(userId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, [bookId, userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const submit = useCallback(
    async (input: { rating: number; body: string }) => {
      if (!userId) throw new Error('Please sign in to post a review.');
      if (!bookId) throw new Error('This book is unavailable right now.');
      await upsertReview(userId, { bookId, ...input });
      await reload();
    },
    [userId, bookId, reload],
  );

  const toggleLike = useCallback(
    async (review: Review) => {
      if (!userId) return;
      const liked = !review.isLiked;
      // Optimistic: flip the heart and adjust the count.
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id
            ? { ...r, isLiked: liked, likes: Math.max(0, r.likes + (liked ? 1 : -1)) }
            : r,
        ),
      );
      try {
        await setReviewLike(userId, review.id, liked);
      } catch {
        reload(); // reconcile on failure
      }
    },
    [userId, reload],
  );

  return { reviews, loading, error, reload, submit, toggleLike };
}
