import type { Review } from '@/types/book';
import { initialsOf, timeAgo } from '@/utils/format';
import { supabase } from '@/utils/supabase';

type ReviewRow = {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  body: string;
  created_at: string;
};

// reviews.user_id has no PostgREST relationship to profiles (both reference
// auth.users), so we can't embed the reviewer. Instead we fetch the reviewer
// profiles and the likes for the page of reviews in two follow-up queries and
// stitch everything together here.
async function hydrate(rows: ReviewRow[], currentUserId?: string): Promise<Review[]> {
  if (rows.length === 0) return [];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const reviewIds = rows.map((r) => r.id);

  const [{ data: profiles }, { data: likes }] = await Promise.all([
    supabase.from('profiles').select('id, full_name').in('id', userIds),
    supabase.from('review_likes').select('review_id, user_id').in('review_id', reviewIds),
  ]);

  const nameById = new Map<string, string | null>(
    (profiles ?? []).map((p: { id: string; full_name: string | null }) => [p.id, p.full_name]),
  );
  const likeCount = new Map<string, number>();
  const likedByMe = new Set<string>();
  (likes ?? []).forEach((l: { review_id: string; user_id: string }) => {
    likeCount.set(l.review_id, (likeCount.get(l.review_id) ?? 0) + 1);
    if (currentUserId && l.user_id === currentUserId) likedByMe.add(l.review_id);
  });

  return rows.map((r) => {
    const name = nameById.get(r.user_id) || 'Reader';
    return {
      id: r.id,
      bookId: r.book_id,
      userName: name,
      avatar: initialsOf(name),
      rating: r.rating,
      text: r.body,
      timeAgo: timeAgo(r.created_at),
      likes: likeCount.get(r.id) ?? 0,
      isLiked: likedByMe.has(r.id),
    };
  });
}

/** Reviews for a single book, newest first. */
export async function fetchReviews(bookId: string, currentUserId?: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, user_id, book_id, rating, body, created_at')
    .eq('book_id', bookId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return hydrate(data as ReviewRow[], currentUserId);
}

/** Most recent reviews across all books, for the community feed. */
export async function fetchRecentReviews(currentUserId?: string, limit = 20): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, user_id, book_id, rating, body, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return hydrate(data as ReviewRow[], currentUserId);
}

/** Create or update the current user's review for a book (one per user/book). */
export async function upsertReview(
  userId: string,
  input: { bookId: string; rating: number; body: string },
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .upsert(
      { user_id: userId, book_id: input.bookId, rating: input.rating, body: input.body },
      { onConflict: 'user_id,book_id' },
    );
  if (error) throw error;
}

/** Like or unlike a review as the current user. */
export async function setReviewLike(
  userId: string,
  reviewId: string,
  liked: boolean,
): Promise<void> {
  if (liked) {
    const { error } = await supabase
      .from('review_likes')
      .upsert({ review_id: reviewId, user_id: userId }, { onConflict: 'review_id,user_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('review_likes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId);
    if (error) throw error;
  }
}
