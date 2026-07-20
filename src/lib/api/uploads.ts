import type { DocumentPickerAsset } from 'expo-document-picker';

import type { Book } from '@/types/book';
import { supabase } from '@/utils/supabase';
import { upsertLibraryItem } from '@/lib/api/library';

const BUCKET = 'book-uploads';

export type UploadBookInput = {
  title: string;
  author: string;
  category: string;
  description: string;
  language: string;
  pages?: number;
  bookFile: DocumentPickerAsset;
  coverFile?: DocumentPickerAsset;
};

function safeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-|-$/g, '');
}

async function uploadAsset(path: string, asset: DocumentPickerAsset) {
  const body = await fetch(asset.uri).then((response) => response.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: asset.mimeType ?? undefined,
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadBook(input: UploadBookInput, userId: string): Promise<Book> {
  const stamp = Date.now();
  const id = `upload-${userId}-${stamp}`;
  const folder = `${userId}/${stamp}`;
  const bookPath = `${folder}/${safeName(input.bookFile.name || 'book')}`;
  const uploadedPaths: string[] = [];

  try {
    const readUrl = await uploadAsset(bookPath, input.bookFile);
    uploadedPaths.push(bookPath);

    let coverUrl: string | null = null;
    if (input.coverFile) {
      const coverPath = `${folder}/cover-${safeName(input.coverFile.name || 'image.jpg')}`;
      coverUrl = await uploadAsset(coverPath, input.coverFile);
      uploadedPaths.push(coverPath);
    }

    const row = {
      id,
      title: input.title.trim(),
      author: input.author.trim(),
      category: input.category.trim() || 'Other',
      description: input.description.trim(),
      language: input.language.trim() || 'English',
      pages: input.pages ?? null,
      rating: 0,
      cover_url: coverUrl,
      accent: '#E9E4DA',
      source: 'upload',
      read_url: readUrl,
      download_url: readUrl,
      has_audio: false,
      uploaded_by: userId,
    };
    const { error } = await supabase.from('books').insert(row);
    if (error) throw error;
    await upsertLibraryItem(userId, id, { last_read_at: new Date().toISOString() });

    return {
      id,
      title: row.title,
      author: row.author,
      category: row.category,
      rating: 0,
      description: row.description,
      cover: coverUrl ? { uri: coverUrl } : require('../../../assets/images/icon.png'),
      accent: row.accent,
      source: 'upload',
      readUrl,
      downloadUrl: readUrl,
      pages: input.pages,
      language: row.language,
      hasAudio: false,
    };
  } catch (error) {
    if (uploadedPaths.length) await supabase.storage.from(BUCKET).remove(uploadedPaths);
    throw error;
  }
}
