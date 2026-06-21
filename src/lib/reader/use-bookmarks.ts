import { useCallback, useEffect, useState } from 'react';

import { addBookmark, fetchBookmarks, removeBookmark } from '@/lib/api/bookmarks';
import { useAuth } from '@/lib/auth/auth-context';
import type { Bookmark } from '@/types/book';

/** Loads and mutates the signed-in user's bookmarks for one book. */
export function useBookmarks(bookId?: string) {
  const { user } = useAuth();
  const userId = user?.id;
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setBookmarks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setBookmarks(await fetchBookmarks(userId, bookId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookmarks.');
    } finally {
      setLoading(false);
    }
  }, [userId, bookId]);

  useEffect(() => {
    reload();
  }, [reload]);

  /** Add a bookmark for a page, or remove it if one already exists there. */
  const toggle = useCallback(
    async (page: number, label?: string) => {
      if (!userId || !bookId) return;
      const existing = bookmarks.find((b) => b.page === page);
      if (existing) {
        setBookmarks((prev) => prev.filter((b) => b.id !== existing.id)); // optimistic
        try {
          await removeBookmark(userId, existing.id);
        } catch {
          reload();
        }
        return false;
      }
      const created = await addBookmark(userId, { bookId, page, label });
      setBookmarks((prev) => [...prev, created].sort((a, b) => a.page - b.page));
      return true;
    },
    [userId, bookId, bookmarks, reload],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!userId) return;
      const prev = bookmarks;
      setBookmarks((b) => b.filter((x) => x.id !== id)); // optimistic
      try {
        await removeBookmark(userId, id);
      } catch {
        setBookmarks(prev);
      }
    },
    [userId, bookmarks],
  );

  return {
    bookmarks,
    loading,
    error,
    reload,
    toggle,
    remove,
    hasBookmark: (page: number) => bookmarks.some((b) => b.page === page),
  };
}
