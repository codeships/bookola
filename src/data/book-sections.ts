// Home-screen merchandising config. The catalog lives in Supabase; which books
// appear in each home section is a presentation concern, kept here as ordered ids.
export const homeSections = {
  featured: ['atomic-habits', 'deep-work'],
  trending: ['the-alchemist', 'clean-code', 'reclaim-your-heart'],
  recommended: ['thinking-fast-slow', 'sapiens', 'the-subtle-art', 'rich-dad-poor-dad'],
};

// UI taxonomy for browsing/onboarding (not every genre has books yet).
export const categories = [
  'Fiction',
  'Romance',
  'Tech',
  'Business',
  'Islamic Books',
  'Self-Help',
  'Education',
];
