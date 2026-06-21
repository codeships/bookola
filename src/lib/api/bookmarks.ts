import type { Bookmark } from '@/types/book';
import { supabase } from '@/utils/supabase';

type BookmarkRow = {
  id: string;
  book_id: string;
  page: number;
  label: string | null;
  created_at: string;
};

function mapBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    bookId: row.book_id,
    page: row.page,
    label: row.label ?? undefined,
    createdAt: row.created_at,
  };
}

/** Fetch the user's bookmarks, optionally scoped to one book. */
export async function fetchBookmarks(userId: string, bookId?: string): Promise<Bookmark[]> {
  let query = supabase
    .from('bookmarks')
    .select('id, book_id, page, label, created_at')
    .eq('user_id', userId)
    .order('page', { ascending: true });
  if (bookId) query = query.eq('book_id', bookId);

  const { data, error } = await query;
  if (error) throw error;
  return (data as BookmarkRow[]).map(mapBookmark);
}

export async function addBookmark(
  userId: string,
  input: { bookId: string; page: number; label?: string },
): Promise<Bookmark> {
  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      user_id: userId,
      book_id: input.bookId,
      page: input.page,
      label: input.label ?? null,
    })
    .select('id, book_id, page, label, created_at')
    .single();
  if (error) throw error;
  return mapBookmark(data as BookmarkRow);
}

export async function removeBookmark(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);
  if (error) throw error;
}
