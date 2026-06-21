import type { ImageSourcePropType } from 'react-native';

export type BookSource = 'local' | 'gutendex' | 'openlibrary';

export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  rating: number;
  description: string;
  /** Local require() asset (number) or a remote cover ({ uri }). */
  cover: ImageSourcePropType;
  accent: string;
  source?: BookSource;
  /** Full text/HTML URL used by the in-app reader (Gutenberg). */
  readUrl?: string;
  /** Downloadable file URL (e.g. EPUB). */
  downloadUrl?: string;
  progress?: number;
  duration?: string;
  pages?: number;
  language?: string;
  publishedYear?: number;
  isFavorite?: boolean;
  isDownloaded?: boolean;
  hasAudio?: boolean;
};

export type Review = {
  id: string;
  bookId: string;
  userName: string;
  avatar: string;
  rating: number;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked?: boolean;
};

export type Highlight = {
  id: string;
  bookId: string;
  text: string;
  note?: string;
  color: string;
  page: number;
  createdAt: string;
};

export type Bookmark = {
  id: string;
  bookId: string;
  page: number;
  label?: string;
  createdAt: string;
};

export type Club = {
  id: string;
  name: string;
  description?: string;
  emoji: string;
  memberCount: number;
  isMember: boolean;
};

export type Challenge = {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  targetValue: number;
  targetUnit: 'pages' | 'books' | 'hours' | 'days';
  participantCount: number;
  endsAt: string;
  /** Whole days remaining until endsAt (min 0). */
  daysLeft: number;
  joined: boolean;
  progress: number;
  /** progress / targetValue as a 0–100 percentage. */
  percent: number;
  completed: boolean;
};

export type ReadingStats = {
  booksFinished: number;
  listeningHours: number;
  readingStreak: number;
  highlightsCount: number;
  notesCount: number;
  pagesRead: number;
  avgPagesPerDay: number;
  favoriteGenre: string;
};
