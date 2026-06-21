import type { Highlight } from '@/types/book';
import { supabase } from '@/utils/supabase';

type HighlightRow = {
  id: string;
  book_id: string;
  body: string;
  note: string | null;
  color: string | null;
  page: number | null;
  created_at: string;
};

function mapHighlight(row: HighlightRow): Highlight {
  return {
    id: row.id,
    bookId: row.book_id,
    text: row.body,
    note: row.note ?? undefined,
    color: row.color ?? '#FFE08A',
    page: row.page ?? 0,
    createdAt: row.created_at,
  };
}

/** Fetch the user's highlights, optionally scoped to one book. */
export async function fetchHighlights(
  userId: string,
  bookId?: string,
): Promise<Highlight[]> {
  let query = supabase
    .from('highlights')
    .select('id, book_id, body, note, color, page, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (bookId) query = query.eq('book_id', bookId);

  const { data, error } = await query;
  if (error) throw error;
  return (data as HighlightRow[]).map(mapHighlight);
}

export async function addHighlight(
  userId: string,
  input: { bookId: string; text: string; note?: string; color?: string; page?: number },
): Promise<Highlight> {
  const { data, error } = await supabase
    .from('highlights')
    .insert({
      user_id: userId,
      book_id: input.bookId,
      body: input.text,
      note: input.note ?? null,
      color: input.color ?? null,
      page: input.page ?? null,
    })
    .select('id, book_id, body, note, color, page, created_at')
    .single();
  if (error) throw error;
  return mapHighlight(data as HighlightRow);
}

export async function removeHighlight(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('highlights')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);
  if (error) throw error;
}
