import { mapBook, type BookRow } from '@/lib/api/books';
import type { Book } from '@/types/book';
import { supabase } from '@/utils/supabase';

/** A catalog Book enriched with the current user's per-book reading state. */
export type LibraryBook = Book & {
  progress: number;
  isFavorite: boolean;
  isDownloaded: boolean;
};

type LibraryRow = {
  progress: number;
  is_favorite: boolean;
  is_downloaded: boolean;
  last_read_at: string | null;
  books: BookRow;
};

export async function fetchLibrary(userId: string): Promise<LibraryBook[]> {
  const { data, error } = await supabase
    .from('library_items')
    .select('progress, is_favorite, is_downloaded, last_read_at, books(*)')
    .eq('user_id', userId);
  if (error) throw error;

  return (data as unknown as LibraryRow[]).map((row) => ({
    ...mapBook(row.books),
    progress: row.progress,
    isFavorite: row.is_favorite,
    isDownloaded: row.is_downloaded,
  }));
}

type LibraryPatch = Partial<{
  progress: number;
  is_favorite: boolean;
  is_downloaded: boolean;
  last_read_at: string;
}>;

/** Insert or update the current user's library row for a book. */
export async function upsertLibraryItem(
  userId: string,
  bookId: string,
  patch: LibraryPatch,
): Promise<void> {
  const { error } = await supabase
    .from('library_items')
    .upsert(
      { user_id: userId, book_id: bookId, ...patch },
      { onConflict: 'user_id,book_id' },
    );
  if (error) throw error;
}

export async function removeLibraryItem(userId: string, bookId: string): Promise<void> {
  const { error } = await supabase
    .from('library_items')
    .delete()
    .eq('user_id', userId)
    .eq('book_id', bookId);
  if (error) throw error;
}
