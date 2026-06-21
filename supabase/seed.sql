-- Bookola — catalog seed (mirrors src/data/mock-books.ts)
-- Runs on `supabase db reset`. cover_url is left null; the app currently bundles
-- cover images as local assets.

insert into public.books
  (id, title, author, category, rating, description, accent, duration, pages, language, published_year, has_audio)
values
  ('atomic-habits', 'Atomic Habits', 'James Clear', 'Self-Help', 4.9,
   'Small habits, repeated with clarity, create life-changing momentum over time. This groundbreaking guide reveals how tiny changes in behavior can lead to remarkable results.',
   '#DDEBFF', '5h 42m', 320, 'English', 2018, true),

  ('deep-work', 'Deep Work', 'Cal Newport', 'Business', 4.8,
   'Train your mind for focused work and protect your attention in a distracted world. Learn strategies for achieving peak productivity through intense concentration.',
   '#FFF0D6', '6h 10m', 296, 'English', 2016, true),

  ('the-alchemist', 'The Alchemist', 'Paulo Coelho', 'Fiction', 4.7,
   'A timeless story about destiny, faith, and the courage to pursue your path. Follow Santiago on his journey from Andalusian shepherd to Egyptian treasure hunter.',
   '#E7F8EF', '4h 15m', 208, 'English', 1988, true),

  ('clean-code', 'Clean Code', 'Robert C. Martin', 'Tech', 4.8,
   'A classic guide to writing readable, maintainable software. Learn the principles and patterns that separate clean code from bad code.',
   '#EBF2FF', '8h 05m', 464, 'English', 2008, true),

  ('reclaim-your-heart', 'Reclaim Your Heart', 'Yasmin Mogahed', 'Islamic Books', 4.9,
   'A reflective guide to healing, faith, and emotional resilience. Discover how to free your heart from attachment to the temporary and find lasting peace.',
   '#F5EFFF', '7h 00m', 256, 'English', 2012, true),

  ('thinking-fast-slow', 'Thinking, Fast and Slow', 'Daniel Kahneman', 'Self-Help', 4.6,
   'A tour of the mind that explains the two systems that drive the way we think and make choices.',
   '#FFF4E6', '11h 30m', 499, 'English', 2011, true),

  ('sapiens', 'Sapiens', 'Yuval Noah Harari', 'Education', 4.7,
   'A brief history of humankind from the Stone Age to the Silicon Age, exploring how biology and history defined us.',
   '#E8F5E9', '15h 18m', 512, 'English', 2014, true),

  ('the-subtle-art', 'The Subtle Art of Not Giving a F*ck', 'Mark Manson', 'Self-Help', 4.5,
   'A counterintuitive approach to living a good life by learning to focus only on what truly matters.',
   '#FFE8E8', '5h 17m', 224, 'English', 2016, true),

  ('rich-dad-poor-dad', 'Rich Dad Poor Dad', 'Robert Kiyosaki', 'Business', 4.6,
   'What the rich teach their kids about money that the poor and middle class do not.',
   '#FFF8E1', '6h 09m', 336, 'English', 1997, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Reading clubs — starter clubs (not owned by any user; created_by stays null)
-- ---------------------------------------------------------------------------
insert into public.clubs (id, name, description, emoji, member_count)
values
  ('11111111-1111-4111-8111-111111111111', 'Mindful Readers',
   'Calm, intentional reading and reflection.', '🧘', 1240),
  ('22222222-2222-4222-8222-222222222222', 'Tech Book Club',
   'Software, systems, and the craft of building.', '💻', 856),
  ('33333333-3333-4333-8333-333333333333', 'Islamic Wisdom',
   'Faith, growth, and timeless reflection.', '🕌', 2100),
  ('44444444-4444-4444-8444-444444444444', 'Business Minds',
   'Strategy, focus, and personal effectiveness.', '📊', 934)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Challenges — one active weekly challenge (ends a week from the reset)
-- ---------------------------------------------------------------------------
insert into public.challenges
  (id, title, description, emoji, target_value, target_unit, participant_count, starts_at, ends_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Read 100 Pages This Week',
   'Turn 100 pages before the week is out.', '🏆', 100, 'pages', 3420,
   now(), now() + interval '7 days')
on conflict (id) do nothing;
