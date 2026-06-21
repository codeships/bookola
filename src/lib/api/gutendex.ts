import type { Book } from '@/types/book';

// Project Gutenberg catalog via the Gutendex API (https://gutendex.com).
// These books are public-domain and fully readable/downloadable.
const BASE = 'https://gutendex.com/books';

const ACCENTS = [
  '#DDEBFF', '#FFF0D6', '#E7F8EF', '#EBF2FF', '#F5EFFF',
  '#FFF4E6', '#E8F5E9', '#FFE8E8', '#FFF8E1',
];

type GutendexAuthor = { name: string; birth_year: number | null; death_year: number | null };
type GutendexBook = {
  id: number;
  title: string;
  authors: GutendexAuthor[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  formats: Record<string, string>;
  download_count: number;
};
type GutendexList = { count: number; next: string | null; results: GutendexBook[] };

export const gutendexId = (id: number) => `gutendex:${id}`;

function accentFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

function formatAuthor(name?: string): string {
  if (!name) return 'Unknown author';
  const parts = name.split(', ');
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : name;
}

function categoryFrom(book: GutendexBook): string {
  const raw = book.subjects?.[0] ?? book.bookshelves?.[0] ?? 'Classic';
  return raw.split(' -- ')[0].slice(0, 24);
}

function ratingFrom(downloads: number): number {
  return Math.round((3.8 + Math.min(1.2, Math.log10((downloads || 0) + 1) / 4)) * 10) / 10;
}

// Find a format URL whose key starts with the given mime prefix.
function pickFormat(formats: Record<string, string>, prefix: string): string | undefined {
  const key = Object.keys(formats).find(
    (k) => k.startsWith(prefix) && !k.endsWith('.zip'),
  );
  return key ? formats[key] : undefined;
}

export function mapGutendexBook(book: GutendexBook): Book {
  const author = formatAuthor(book.authors?.[0]?.name);
  const subjects = (book.subjects ?? []).slice(0, 3).join(' · ');
  const cover = pickFormat(book.formats, 'image/jpeg');
  return {
    id: gutendexId(book.id),
    title: book.title,
    author,
    category: categoryFrom(book),
    rating: ratingFrom(book.download_count),
    description: subjects
      ? `${subjects}. A Project Gutenberg classic by ${author}.`
      : `A Project Gutenberg classic by ${author}.`,
    cover: cover ? { uri: cover } : require('../../../assets/images/learn.png'),
    accent: accentFor(String(book.id)),
    source: 'gutendex',
    readUrl: pickFormat(book.formats, 'text/plain') ?? pickFormat(book.formats, 'text/html'),
    downloadUrl: book.formats['application/epub+zip'],
    language: book.languages?.[0]?.toUpperCase(),
    hasAudio: false,
  };
}

async function getList(qs: string): Promise<Book[]> {
  const res = await fetch(`${BASE}/?${qs}`);
  if (!res.ok) throw new Error(`Gutendex request failed (${res.status})`);
  const data = (await res.json()) as GutendexList;
  return data.results.map(mapGutendexBook);
}

export const popularGutendex = () => getList('languages=en');
export const gutendexByTopic = (topic: string) =>
  getList(`languages=en&topic=${encodeURIComponent(topic)}`);
export const searchGutendex = (query: string) =>
  getList(`languages=en&search=${encodeURIComponent(query)}`);

export async function gutendexById(numericId: string): Promise<Book | undefined> {
  const res = await fetch(`${BASE}/${numericId}`);
  if (!res.ok) return undefined;
  return mapGutendexBook((await res.json()) as GutendexBook);
}
