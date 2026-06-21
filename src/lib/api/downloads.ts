import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { Book } from '@/types/book';

function safeName(title: string): string {
  return title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 50).toLowerCase() || 'book';
}

/**
 * Downloads a book's file (EPUB, or plain text as a fallback) to the app's
 * document directory and opens the OS share/save sheet. Returns the local URI.
 * Throws if the book has no downloadable source.
 */
export async function downloadBook(book: Book): Promise<string> {
  const url = book.downloadUrl ?? book.readUrl;
  if (!url) throw new Error('This book is not available for download.');

  const ext = book.downloadUrl ? 'epub' : 'txt';
  const dest = new File(Paths.document, `${safeName(book.title)}.${ext}`);
  if (dest.exists) dest.delete();

  const file = await File.downloadFileAsync(url, dest);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri);
  }
  return file.uri;
}

/** Deletes downloaded book files (.epub/.txt) from the document directory. */
export function clearDownloads(): { files: number; bytes: number } {
  let files = 0;
  let bytes = 0;
  try {
    const dir = new Directory(Paths.document);
    for (const entry of dir.list()) {
      if (entry instanceof File && /\.(epub|txt)$/i.test(entry.name)) {
        bytes += entry.size ?? 0;
        entry.delete();
        files += 1;
      }
    }
  } catch {
    /* best-effort cache clear */
  }
  return { files, bytes };
}

/** Human-readable byte size, e.g. "12.4 MB". */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${mb.toFixed(1)} MB`;
}
