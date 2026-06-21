import type { Book } from '@/types/book';

// LibriVox free public-domain audiobooks (https://librivox.org/api/).
const BASE = 'https://librivox.org/api/feed/audiobooks';

export type Chapter = {
  index: number;
  title: string;
  url: string;
  durationSec: number;
};

export type Audiobook = {
  id: string;
  title: string;
  author: string;
  totalSec: number;
  zipUrl?: string;
  librivoxUrl?: string;
  chapters: Chapter[];
};

type LVSection = {
  section_number: string;
  title: string;
  listen_url: string;
  playtime: string;
};
type LVAuthor = { first_name?: string; last_name?: string };
type LVBook = {
  id: string;
  title: string;
  authors?: LVAuthor[];
  totaltimesecs?: number;
  url_zip_file?: string;
  url_librivox?: string;
  sections?: LVSection[];
};

// Cache by app book id: an Audiobook, or null when we've checked and found none.
const cache = new Map<string, Audiobook | null>();

function cleanTitle(title: string): string {
  // Drop subtitles / volume suffixes that hurt LibriVox title matching.
  return title.split(/[:;(]/)[0].replace(/\s+/g, ' ').trim();
}

function authorLastName(author: string): string {
  const parts = author.trim().split(/\s+/);
  return (parts[parts.length - 1] ?? '').toLowerCase();
}

function mapBook(lv: LVBook): Audiobook {
  const a = lv.authors?.[0];
  const author = [a?.first_name, a?.last_name].filter(Boolean).join(' ') || 'Unknown author';
  const chapters: Chapter[] = (lv.sections ?? [])
    .map((s, i) => ({
      index: Number(s.section_number) || i + 1,
      title: s.title?.trim() || `Section ${i + 1}`,
      url: s.listen_url,
      durationSec: Number(s.playtime) || 0,
    }))
    .filter((c) => c.url)
    .sort((x, y) => x.index - y.index);

  return {
    id: String(lv.id),
    title: lv.title,
    author,
    totalSec: lv.totaltimesecs ?? chapters.reduce((sum, c) => sum + c.durationSec, 0),
    zipUrl: lv.url_zip_file,
    librivoxUrl: lv.url_librivox,
    chapters,
  };
}

/**
 * Find a LibriVox audiobook matching a catalog book (by title, preferring an
 * author match). Returns null if none is available. Cached per book id.
 */
export async function findAudiobookForBook(book: Book): Promise<Audiobook | null> {
  if (cache.has(book.id)) return cache.get(book.id)!;

  let result: Audiobook | null = null;
  try {
    const url = `${BASE}?title=${encodeURIComponent(cleanTitle(book.title))}&format=json&extended=1&limit=5`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = (await res.json()) as { books?: LVBook[] };
      const books = (data.books ?? []).filter((b) => (b.sections ?? []).length > 0);
      if (books.length) {
        const wantAuthor = authorLastName(book.author);
        const byAuthor = books.find((b) =>
          b.authors?.some((a) => (a.last_name ?? '').toLowerCase() === wantAuthor),
        );
        result = mapBook(byAuthor ?? books[0]);
      }
    }
  } catch {
    result = null;
  }

  cache.set(book.id, result);
  return result;
}

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}
