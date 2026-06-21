import {
  gutendexById,
  gutendexByTopic,
  popularGutendex,
  searchGutendex,
} from '@/lib/api/gutendex';
import { openLibraryByWorkId, searchOpenLibrary } from '@/lib/api/openlibrary';
import type { Book } from '@/types/book';

// In-memory cache so a book discovered on one screen (search, a shelf) can be
// resolved by id on another (detail, reader, player) without refetching.
const cache = new Map<string, Book>();

function remember<T extends Book | Book[]>(value: T): T {
  const list = Array.isArray(value) ? value : [value];
  list.forEach((b) => cache.set(b.id, b));
  return value;
}

export function getCachedBook(id: string): Book | undefined {
  return cache.get(id);
}

export type HomeShelves = {
  featured: Book[];
  trending: Book[];
  recommended: Book[];
};

/** Curated home shelves, all readable (Project Gutenberg). */
export async function loadShelves(): Promise<HomeShelves> {
  const [trending, fiction, philosophy] = await Promise.all([
    popularGutendex(),
    gutendexByTopic('fiction'),
    gutendexByTopic('philosophy'),
  ]);
  remember(trending);
  remember(fiction);
  remember(philosophy);
  return {
    featured: trending.slice(0, 2),
    trending: trending.slice(2, 12),
    recommended: [...philosophy.slice(0, 6), ...fiction.slice(0, 6)],
  };
}

/** Search both catalogs; Gutenberg (readable) first, then Open Library breadth. */
export async function searchCatalog(query: string): Promise<Book[]> {
  const [gut, ol] = await Promise.allSettled([
    searchGutendex(query),
    searchOpenLibrary(query),
  ]);
  const results: Book[] = [];
  if (gut.status === 'fulfilled') results.push(...gut.value);
  if (ol.status === 'fulfilled') results.push(...ol.value);
  // De-dupe by title+author so the same classic from both sources collapses.
  const seen = new Set<string>();
  const deduped = results.filter((b) => {
    const key = `${b.title}|${b.author}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return remember(deduped);
}

/** Resolve a book by id, from cache or by fetching its source. */
export async function getCatalogBook(id: string): Promise<Book | undefined> {
  const cached = cache.get(id);
  if (cached) return cached;

  let book: Book | undefined;
  if (id.startsWith('gutendex:')) {
    book = await gutendexById(id.slice('gutendex:'.length));
  } else if (id.startsWith('openlibrary:')) {
    book = await openLibraryByWorkId(id.slice('openlibrary:'.length));
  }
  if (book) remember(book);
  return book;
}
