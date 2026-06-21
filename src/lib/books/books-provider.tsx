import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { getCachedBook, getCatalogBook, loadShelves, type HomeShelves } from '@/lib/api/catalog';
import type { Book } from '@/types/book';

const EMPTY_SHELVES: HomeShelves = { featured: [], trending: [], recommended: [] };

type BooksContextValue = {
  shelves: HomeShelves;
  /** Synchronous lookup from the in-memory catalog cache (may be undefined). */
  byId: (id: string) => Book | undefined;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const BooksContext = createContext<BooksContextValue | undefined>(undefined);

export function BooksProvider({ children }: { children: ReactNode }) {
  const [shelves, setShelves] = useState<HomeShelves>(EMPTY_SHELVES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setShelves(await loadShelves());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load books.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <BooksContext.Provider
      value={{ shelves, byId: getCachedBook, loading, error, refresh: load }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error('useBooks must be used within a <BooksProvider>.');
  return ctx;
}

/** Resolve a single book by id: cache first, then fetch from its source. */
export function useResolvedBook(id: string | undefined) {
  const [book, setBook] = useState<Book | undefined>(() => (id ? getCachedBook(id) : undefined));
  const [loading, setLoading] = useState(!book);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const cached = id ? getCachedBook(id) : undefined;
    if (cached) {
      setBook(cached);
      setLoading(false);
      return;
    }
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getCatalogBook(id)
      .then((b) => {
        if (!active) return;
        setBook(b);
        setError(b ? null : 'Book not found.');
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Failed to load book.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  return { book, loading, error };
}
