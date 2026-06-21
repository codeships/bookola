import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/lib/auth/auth-context';
import { upsertBook } from '@/lib/api/books';
import {
  fetchLibrary,
  upsertLibraryItem,
  type LibraryBook,
} from '@/lib/api/library';
import type { Book } from '@/types/book';

/**
 * Loads the signed-in user's library and exposes derived groupings plus
 * mutations. Mutations update local state optimistically, then persist.
 */
export function useLibrary() {
  const { user } = useAuth();
  const userId = user?.id;
  const [items, setItems] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setItems(await fetchLibrary(userId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load library.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Update an existing row in place, or insert a new local row from the catalog
  // book so the UI reflects the change immediately (the book may not be in the
  // library yet when favoriting/downloading from a detail screen).
  const applyLocal = useCallback((book: Book, patch: Partial<LibraryBook>) => {
    setItems((prev) => {
      const existing = prev.find((b) => b.id === book.id);
      if (existing) return prev.map((b) => (b.id === book.id ? { ...b, ...patch } : b));
      return [...prev, { ...book, progress: 0, isFavorite: false, isDownloaded: false, ...patch }];
    });
  }, []);

  const toggleFavorite = useCallback(
    async (book: Book) => {
      if (!userId) return;
      const next = !(items.find((b) => b.id === book.id)?.isFavorite ?? false);
      applyLocal(book, { isFavorite: next });
      try {
        await upsertBook(book); // cache catalog book so the FK resolves
        await upsertLibraryItem(userId, book.id, { is_favorite: next });
      } catch {
        reload(); // reconcile on failure
      }
    },
    [userId, items, applyLocal, reload],
  );

  const toggleDownloaded = useCallback(
    async (book: Book) => {
      if (!userId) return;
      const next = !(items.find((b) => b.id === book.id)?.isDownloaded ?? false);
      applyLocal(book, { isDownloaded: next });
      try {
        await upsertBook(book);
        await upsertLibraryItem(userId, book.id, { is_downloaded: next });
      } catch {
        reload();
      }
    },
    [userId, items, applyLocal, reload],
  );

  const setProgress = useCallback(
    async (book: Book, progress: number) => {
      if (!userId) return;
      applyLocal(book, { progress });
      try {
        await upsertBook(book);
        await upsertLibraryItem(userId, book.id, {
          progress,
          last_read_at: new Date().toISOString(),
        });
      } catch {
        /* progress is best-effort; reload will reconcile */
      }
    },
    [userId, applyLocal],
  );

  const groups = useMemo(
    () => ({
      inProgress: items.filter((b) => b.progress > 0 && b.progress < 100),
      favorites: items.filter((b) => b.isFavorite),
      downloaded: items.filter((b) => b.isDownloaded),
    }),
    [items],
  );

  return {
    items,
    ...groups,
    loading,
    error,
    reload,
    toggleFavorite,
    toggleDownloaded,
    setProgress,
    isInLibrary: (bookId: string) => items.some((b) => b.id === bookId),
    getItem: (bookId: string) => items.find((b) => b.id === bookId),
  };
}
