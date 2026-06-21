import { coverFor } from '@/data/book-assets';
import type { Book, BookSource } from '@/types/book';
import { supabase } from '@/utils/supabase';

/** Shape of a row in the public.books table (now a cache of external books). */
export type BookRow = {
  id: string;
  title: string;
  author: string;
  category: string;
  rating: number | string;
  description: string | null;
  cover_url: string | null;
  accent: string | null;
  duration: string | null;
  pages: number | null;
  language: string | null;
  published_year: number | null;
  has_audio: boolean;
  source: string | null;
  read_url: string | null;
  download_url: string | null;
};

/** Extract a remote cover URL from a Book.cover ({ uri } for external books). */
export function coverUrlOf(cover: Book['cover']): string | null {
  if (cover && typeof cover === 'object' && 'uri' in cover && typeof cover.uri === 'string') {
    return cover.uri;
  }
  return null;
}

/** Map a cached catalog row to the app's Book type. */
export function mapBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    category: row.category,
    rating: Number(row.rating),
    description: row.description ?? '',
    cover: row.cover_url ? { uri: row.cover_url } : coverFor(row.id),
    accent: row.accent ?? '#EBF2FF',
    source: (row.source as BookSource) ?? 'local',
    readUrl: row.read_url ?? undefined,
    downloadUrl: row.download_url ?? undefined,
    duration: row.duration ?? undefined,
    pages: row.pages ?? undefined,
    language: row.language ?? undefined,
    publishedYear: row.published_year ?? undefined,
    hasAudio: row.has_audio,
  };
}

/**
 * Cache a catalog book into Supabase so library_items / highlights foreign keys
 * resolve. Called before persisting any user interaction with an external book.
 */
export async function upsertBook(book: Book): Promise<void> {
  const { error } = await supabase.from('books').upsert(
    {
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      rating: book.rating,
      description: book.description,
      cover_url: coverUrlOf(book.cover),
      accent: book.accent,
      duration: book.duration ?? null,
      pages: book.pages ?? null,
      language: book.language ?? null,
      published_year: book.publishedYear ?? null,
      has_audio: book.hasAudio ?? false,
      source: book.source ?? 'local',
      read_url: book.readUrl ?? null,
      download_url: book.downloadUrl ?? null,
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}
