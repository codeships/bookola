import type { Book } from '@/types/book';

// Open Library (https://openlibrary.org). Rich metadata + covers for breadth.
// Most titles are NOT free full-text, so these are discovery-only: the reader
// and download are disabled for Open Library books (no readUrl/downloadUrl).
const SEARCH = 'https://openlibrary.org/search.json';
const WORKS = 'https://openlibrary.org';
const COVER = 'https://covers.openlibrary.org/b/id';

const ACCENTS = ['#EEF2FF', '#FDF2E9', '#ECFDF5', '#FEF2F2', '#F5F3FF', '#FFFBEB'];

type OLDoc = {
  key: string; // "/works/OL...W"
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
  language?: string[];
  ratings_average?: number;
};
type OLSearch = { docs: OLDoc[] };

const workIdOf = (key: string) => key.split('/').pop() ?? key;
export const openLibraryId = (workId: string) => `openlibrary:${workId}`;

function accentFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

function coverFor(coverId?: number): Book['cover'] {
  return coverId
    ? { uri: `${COVER}/${coverId}-L.jpg` }
    : require('../../../assets/images/edu.png');
}

function mapDoc(doc: OLDoc): Book {
  const workId = workIdOf(doc.key);
  const author = doc.author_name?.[0] ?? 'Unknown author';
  const subjects = (doc.subject ?? []).slice(0, 3).join(' · ');
  return {
    id: openLibraryId(workId),
    title: doc.title,
    author,
    category: doc.subject?.[0]?.slice(0, 24) ?? 'Open Library',
    rating: doc.ratings_average ? Math.round(doc.ratings_average * 10) / 10 : 4.0,
    description: subjects
      ? `${subjects}. From the Open Library catalog.`
      : `${doc.title} by ${author}. From the Open Library catalog.`,
    cover: coverFor(doc.cover_i),
    accent: accentFor(workId),
    source: 'openlibrary',
    publishedYear: doc.first_publish_year,
    language: doc.language?.[0]?.toUpperCase(),
    hasAudio: false,
  };
}

export async function searchOpenLibrary(query: string): Promise<Book[]> {
  const fields = 'key,title,author_name,first_publish_year,cover_i,subject,language,ratings_average';
  const url = `${SEARCH}?q=${encodeURIComponent(query)}&limit=20&fields=${fields}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open Library request failed (${res.status})`);
  const data = (await res.json()) as OLSearch;
  return (data.docs ?? []).filter((d) => d.title).map(mapDoc);
}

type OLWork = {
  title: string;
  description?: string | { value: string };
  subjects?: string[];
  covers?: number[];
};

export async function openLibraryByWorkId(workId: string): Promise<Book | undefined> {
  const res = await fetch(`${WORKS}/works/${workId}.json`);
  if (!res.ok) return undefined;
  const work = (await res.json()) as OLWork;
  const description =
    typeof work.description === 'string' ? work.description : work.description?.value;
  return {
    id: openLibraryId(workId),
    title: work.title,
    author: 'Unknown author',
    category: work.subjects?.[0]?.slice(0, 24) ?? 'Open Library',
    rating: 4.0,
    description: description ?? `${work.title}. From the Open Library catalog.`,
    cover: coverFor(work.covers?.[0]),
    accent: accentFor(workId),
    source: 'openlibrary',
    hasAudio: false,
  };
}
