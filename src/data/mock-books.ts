import { Book, Review, Highlight, ReadingStats } from '@/types/book';

export const featuredBooks: Book[] = [
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self-Help',
    rating: 4.9,
    description:
      'Small habits, repeated with clarity, create life-changing momentum over time. This groundbreaking guide reveals how tiny changes in behavior can lead to remarkable results.',
    cover: require('../../assets/images/learn.png'),
    accent: '#DDEBFF',
    progress: 62,
    duration: '5h 42m',
    pages: 320,
    language: 'English',
    publishedYear: 2018,
    isFavorite: true,
    isDownloaded: true,
    hasAudio: true,
  },
  {
    id: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'Business',
    rating: 4.8,
    description:
      'Train your mind for focused work and protect your attention in a distracted world. Learn strategies for achieving peak productivity through intense concentration.',
    cover: require('../../assets/images/edu.png'),
    accent: '#FFF0D6',
    progress: 18,
    duration: '6h 10m',
    pages: 296,
    language: 'English',
    publishedYear: 2016,
    isFavorite: false,
    isDownloaded: true,
    hasAudio: true,
  },
];

export const trendingBooks: Book[] = [
  {
    id: 'the-alchemist',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    category: 'Fiction',
    rating: 4.7,
    description:
      'A timeless story about destiny, faith, and the courage to pursue your path. Follow Santiago on his journey from Andalusian shepherd to Egyptian treasure hunter.',
    cover: require('../../assets/images/road.png'),
    accent: '#E7F8EF',
    duration: '4h 15m',
    pages: 208,
    language: 'English',
    publishedYear: 1988,
    hasAudio: true,
  },
  {
    id: 'clean-code',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Tech',
    rating: 4.8,
    description:
      'A classic guide to writing readable, maintainable software. Learn the principles and patterns that separate clean code from bad code.',
    cover: require('../../assets/images/learn.png'),
    accent: '#EBF2FF',
    duration: '8h 05m',
    pages: 464,
    language: 'English',
    publishedYear: 2008,
    hasAudio: true,
  },
  {
    id: 'reclaim-your-heart',
    title: 'Reclaim Your Heart',
    author: 'Yasmin Mogahed',
    category: 'Islamic Books',
    rating: 4.9,
    description:
      'A reflective guide to healing, faith, and emotional resilience. Discover how to free your heart from attachment to the temporary and find lasting peace.',
    cover: require('../../assets/images/edu.png'),
    accent: '#F5EFFF',
    duration: '7h 00m',
    pages: 256,
    language: 'English',
    publishedYear: 2012,
    isFavorite: true,
    hasAudio: true,
  },
];

export const recommendedBooks: Book[] = [
  {
    id: 'thinking-fast-slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Self-Help',
    rating: 4.6,
    description:
      'A tour of the mind that explains the two systems that drive the way we think and make choices.',
    cover: require('../../assets/images/road.png'),
    accent: '#FFF4E6',
    duration: '11h 30m',
    pages: 499,
    publishedYear: 2011,
    hasAudio: true,
  },
  {
    id: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    category: 'Education',
    rating: 4.7,
    description:
      'A brief history of humankind from the Stone Age to the Silicon Age, exploring how biology and history defined us.',
    cover: require('../../assets/images/learn.png'),
    accent: '#E8F5E9',
    duration: '15h 18m',
    pages: 512,
    publishedYear: 2014,
    hasAudio: true,
  },
  {
    id: 'the-subtle-art',
    title: 'The Subtle Art of Not Giving a F*ck',
    author: 'Mark Manson',
    category: 'Self-Help',
    rating: 4.5,
    description:
      'A counterintuitive approach to living a good life by learning to focus only on what truly matters.',
    cover: require('../../assets/images/edu.png'),
    accent: '#FFE8E8',
    duration: '5h 17m',
    pages: 224,
    publishedYear: 2016,
    hasAudio: true,
  },
  {
    id: 'rich-dad-poor-dad',
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    category: 'Business',
    rating: 4.6,
    description:
      'What the rich teach their kids about money that the poor and middle class do not.',
    cover: require('../../assets/images/road.png'),
    accent: '#FFF8E1',
    duration: '6h 09m',
    pages: 336,
    publishedYear: 1997,
    hasAudio: true,
  },
];

export const categories = [
  'Fiction',
  'Romance',
  'Tech',
  'Business',
  'Islamic Books',
  'Self-Help',
  'Education',
];

export const allBooks = [...featuredBooks, ...trendingBooks, ...recommendedBooks];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    bookId: 'atomic-habits',
    userName: 'Sarah K.',
    avatar: 'SK',
    rating: 5,
    text: 'This book completely changed how I approach my daily routines. The compound effect of tiny habits is real.',
    timeAgo: '2h ago',
    likes: 124,
    isLiked: true,
  },
  {
    id: 'r2',
    bookId: 'atomic-habits',
    userName: 'Ahmed R.',
    avatar: 'AR',
    rating: 5,
    text: 'Beautifully paced and deeply practical. The audiobook delivery is excellent too.',
    timeAgo: '5h ago',
    likes: 89,
  },
  {
    id: 'r3',
    bookId: 'atomic-habits',
    userName: 'Lina M.',
    avatar: 'LM',
    rating: 4,
    text: 'Great framework for building habits. Some concepts overlap with other self-help books, but the 1% better principle is powerful.',
    timeAgo: '1d ago',
    likes: 67,
  },
  {
    id: 'r4',
    bookId: 'deep-work',
    userName: 'Omar T.',
    avatar: 'OT',
    rating: 5,
    text: 'Essential reading for anyone in the knowledge economy. Cal Newport makes a compelling case for focused work.',
    timeAgo: '3h ago',
    likes: 201,
  },
  {
    id: 'r5',
    bookId: 'the-alchemist',
    userName: 'Fatima H.',
    avatar: 'FH',
    rating: 5,
    text: 'A life-changing read. Every time I revisit this book, I discover something new about myself.',
    timeAgo: '8h ago',
    likes: 156,
  },
  {
    id: 'r6',
    bookId: 'reclaim-your-heart',
    userName: 'Yusuf A.',
    avatar: 'YA',
    rating: 5,
    text: 'This book is a mirror for the soul. Yasmin Mogahed writes with such depth and honesty.',
    timeAgo: '12h ago',
    likes: 342,
  },
];

export const mockHighlights: Highlight[] = [
  {
    id: 'h1',
    bookId: 'atomic-habits',
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    note: 'This is the core thesis — systems over goals.',
    color: '#FFE08A',
    page: 27,
    createdAt: '2 days ago',
  },
  {
    id: 'h2',
    bookId: 'atomic-habits',
    text: 'Every action you take is a vote for the type of person you wish to become.',
    color: '#B5E8D5',
    page: 38,
    createdAt: '1 day ago',
  },
  {
    id: 'h3',
    bookId: 'deep-work',
    text: 'The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable.',
    note: 'The paradox of our age.',
    color: '#C4DBFF',
    page: 14,
    createdAt: '3 days ago',
  },
];

export const communityReviews: Review[] = [
  {
    id: 'cr1',
    bookId: 'atomic-habits',
    userName: 'Amina Y.',
    avatar: 'AY',
    rating: 5,
    text: 'This app makes reading feel calm again. I came for audiobooks and stayed for the highlights.',
    timeAgo: '2h ago',
    likes: 124,
  },
  {
    id: 'cr2',
    bookId: 'deep-work',
    userName: 'James L.',
    avatar: 'JL',
    rating: 5,
    text: 'The recommendation feed feels thoughtful instead of noisy. Finally an app that gets it.',
    timeAgo: '4h ago',
    likes: 89,
  },
  {
    id: 'cr3',
    bookId: 'the-alchemist',
    userName: 'Noor S.',
    avatar: 'NS',
    rating: 5,
    text: 'I love being able to read, listen, and save notes in one place. The offline mode is a lifesaver.',
    timeAgo: '6h ago',
    likes: 203,
  },
  {
    id: 'cr4',
    bookId: 'reclaim-your-heart',
    userName: 'David K.',
    avatar: 'DK',
    rating: 4,
    text: 'The glassmorphic design is gorgeous. Reading stats keep me motivated every day.',
    timeAgo: '1d ago',
    likes: 156,
  },
  {
    id: 'cr5',
    bookId: 'clean-code',
    userName: 'Zara P.',
    avatar: 'ZP',
    rating: 5,
    text: 'Community highlights from other readers give me new perspectives on books I thought I knew well.',
    timeAgo: '1d ago',
    likes: 78,
  },
];

export const mockReadingStats: ReadingStats = {
  booksFinished: 38,
  listeningHours: 72,
  readingStreak: 14,
  highlightsCount: 156,
  notesCount: 43,
  pagesRead: 4820,
  avgPagesPerDay: 24,
  favoriteGenre: 'Self-Help',
};

export const sampleBookContent = [
  `The most effective way to change your habits is not to focus on what you want to achieve, but on who you wish to become.

Your identity emerges out of your habits. Every action is a vote for the type of person you wish to become. No single instance will transform your beliefs, but as the votes build up, so does the evidence of your new identity.

This is a gradual evolution. We do not change by snapping our fingers and deciding to be someone entirely new. We change bit by bit, day by day, habit by habit. We are continually undergoing microevolutions of the self.

Each habit is like a suggestion: "Hey, maybe this is who I am." If you finish a book, then perhaps you are the type of person who likes reading. If you go to the gym, then perhaps you are the type of person who likes exercise.`,

  `The process of building habits is actually the process of becoming yourself.

Every time you write a page, you are a writer. Every time you practice the violin, you are a musician. Every time you start a workout, you are an athlete. Every time you encourage your employees, you are a leader.

Of course, it works the other way, too. Every time you choose to perform a bad habit, it's a vote for that identity. The good news is that you don't need to be perfect.

In any election, there are going to be votes for both sides. You don't need a unanimous vote to win an election; you just need a majority. It doesn't matter if you cast a few votes for a bad behavior or an unproductive habit. Your goal is simply to win the majority of the time.`,

  `Habits reduce cognitive load and free up mental capacity, so you can allocate your attention to other tasks.

This is the paradox of habits. The more automatic a habit becomes, the less we think about it. And when we've done something a thousand times before, we begin to overlook things. We assume that the next time will be just like the last.

We're so used to doing what we've always done that we don't stop to question whether it's the right thing to do at all. Many of our failures in performance are largely attributable to a lack of self-awareness.

One of our greatest challenges in changing habits is maintaining awareness of what we are actually doing. This helps explain why the consequences of bad habits can sneak up on us.`,

  `Some people spend their entire lives waiting for the time to be right to make an improvement. The best time to start was in the past. The second best time is now.

The task of breaking a bad habit is like uprooting a powerful oak within us. And the task of building a good habit is like cultivating a delicate flower one day at a time.

But what determines whether we stick with a habit long enough to survive the Plateau of Latent Potential? What is it that causes some people to slide into unwanted habits and enables others to enjoy the compounding effects of good ones?

The answer is the ability to see the value in systems over goals. Goals are about the results you want to achieve. Systems are about the processes that lead to those results.`,

  `If you want better results, then forget about setting goals. Focus on your system instead.

You do not rise to the level of your goals. You fall to the level of your systems. Goals are good for setting a direction, but systems are best for making progress.

A handful of problems arise when you spend too much time thinking about your goals and not enough time designing your systems.

Goal setting suffers from a serious case of survivorship bias. We concentrate on the people who end up winning and mistakenly assume that ambitious goals led to their success while overlooking all of the people who had the same objective but didn't succeed.`,

  `Outcomes are about what you get. Processes are about what you do. Identity is about what you believe.

When it comes to building habits that last, the problem is not that one level is "better" or "worse" than another. All levels of change are useful in their own way. The problem is the direction of change.

Many people begin the process of changing their habits by focusing on what they want to achieve. This leads us to outcome-based habits. The alternative is to build identity-based habits. With this approach, we start by focusing on who we wish to become.

The ultimate form of intrinsic motivation is when a habit becomes part of your identity. It's one thing to say I'm the type of person who wants this. It's something very different to say I'm the type of person who is this.`,

  `The most practical way to change who you are is to change what you do.

Each time you write a page, you are a writer. Each time you practice the violin, you are a musician. Each time you start a workout, you are an athlete.

The more you repeat a behavior, the more you reinforce the identity associated with that behavior. In fact, the word identity was originally derived from the Latin words essentitas, which means being, and identidem, which means repeatedly.

Your identity is literally your "repeated beingness." Whatever your identity is right now, you only believe it because you have proof of it.`,

  `True behavior change is identity change. You might start a habit because of motivation, but the only reason you'll stick with one is that it becomes part of your identity.

Anyone can convince themselves to visit the gym or eat healthy once or twice, but if you don't shift the belief behind the behavior, then it is hard to stick with long-term changes.

Improvements are only temporary until they become part of who you are. The goal is not to read a book, the goal is to become a reader. The goal is not to run a marathon, the goal is to become a runner.

When your behavior and your identity are fully aligned, you are no longer pursuing behavior change. You are simply acting like the type of person you already believe yourself to be.`,
];
