import { useCallback, useEffect, useState } from 'react';

import {
  addHighlight,
  fetchHighlights,
  removeHighlight,
} from '@/lib/api/highlights';
import { useAuth } from '@/lib/auth/auth-context';
import type { Highlight } from '@/types/book';

/** Loads and mutates the signed-in user's highlights, optionally per-book. */
export function useHighlights(bookId?: string) {
  const { user } = useAuth();
  const userId = user?.id;
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setHighlights([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setHighlights(await fetchHighlights(userId, bookId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load highlights.');
    } finally {
      setLoading(false);
    }
  }, [userId, bookId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    async (input: { text: string; note?: string; color?: string; page?: number }) => {
      if (!userId || !bookId) return;
      const created = await addHighlight(userId, { bookId, ...input });
      setHighlights((prev) => [created, ...prev]);
      return created;
    },
    [userId, bookId],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!userId) return;
      const prev = highlights;
      setHighlights((h) => h.filter((x) => x.id !== id)); // optimistic
      try {
        await removeHighlight(userId, id);
      } catch {
        setHighlights(prev); // revert
      }
    },
    [userId, highlights],
  );

  return { highlights, loading, error, reload, add, remove };
}
