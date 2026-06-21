// Cover images stay bundled as local assets; the catalog (titles, authors, etc.)
// comes from Supabase. Map a book id to its bundled cover, with a fallback.

const learn = require('../../assets/images/learn.png');
const edu = require('../../assets/images/edu.png');
const road = require('../../assets/images/road.png');

export const bookCovers: Record<string, number> = {
  'atomic-habits': learn,
  'deep-work': edu,
  'the-alchemist': road,
  'clean-code': learn,
  'reclaim-your-heart': edu,
  'thinking-fast-slow': road,
  'sapiens': learn,
  'the-subtle-art': edu,
  'rich-dad-poor-dad': road,
};

export const defaultCover = learn;

export function coverFor(bookId: string): number {
  return bookCovers[bookId] ?? defaultCover;
}
