import { useEffect, useState } from 'react';

import { findAudiobookForBook, type Audiobook } from '@/lib/api/librivox';
import type { Book } from '@/types/book';

/** Looks up a LibriVox audiobook for a catalog book (cached per book id). */
export function useAudiobook(book: Book | undefined) {
  const [audiobook, setAudiobook] = useState<Audiobook | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!book) {
      setAudiobook(null);
      return;
    }
    let active = true;
    setLoading(true);
    findAudiobookForBook(book)
      .then((a) => active && setAudiobook(a))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [book]);

  return { audiobook, loading, available: !!audiobook };
}
