# Bookola — Complete App Blueprint

> A premium, AI-powered book reading and audiobook platform built with React Native (Expo SDK 55).

---

## 1. Complete UI/UX Design

### Design Philosophy
Bookola follows a **Scandinavian-minimalist** design language with glassmorphic elements:
- **Calm, airy layouts** with generous white space
- **Soft neumorphic cards** with frosted-glass surfaces (`GlassPanel`)
- **Rounded cards** (28px border radius) with subtle shadows
- **Decorative gradient orbs** for depth and warmth
- **Smooth fade-in animations** on every screen with staggered delays

### Screen Architecture

| Screen | Purpose | Key UI Patterns |
|--------|---------|-----------------|
| **Onboarding** (3 slides) | First-time experience | Full-screen hero images, gradient backgrounds, pill dots |
| **Login / Signup** | Authentication | Glass form cards, animated fade-in, social login buttons |
| **Forgot Password** | Recovery flow | Two-state UI (form → success confirmation) |
| **Preferences** | Genre selection | Chip grid, personalization onboarding |
| **Home** | Discovery hub | Featured card, continue reading, horizontal book rows, category chips |
| **Search** | Book discovery | Search bar, advanced filters overlay, genre grid, suggestions |
| **Library** | Personal collection | 4-tab layout (Reading, Favorites, Offline, Highlights) |
| **Community** | Social layer | Feed, clubs with join buttons, weekly challenges with progress |
| **Profile** | User dashboard | Stats grid, streak tracker, genre breakdown, AI insights |
| **Book Details** | Book info | Hero cover card, meta pills, CTA buttons, reviews, AI recommendations |
| **Reader** | Reading interface | Horizontal page swipe, font controls, highlights panel |
| **Audio Player** | Listening interface | Album art, playback controls, chapters, sleep timer |
| **Settings** | App configuration | Toggle switches, grouped sections, sign out |
| **Subscription** | Monetization | Plan comparison cards, benefits list, "Best Value" badge |

### Navigation Flow
```
Onboarding → Login ←→ Signup → Preferences → Home (Tabs)
                ↓
         Forgot Password

Tabs: Home | Search | Library | Community | Profile
         ↓         ↓          ↓
     Book Details → Reader ←→ Audio Player
         ↓
     Settings → Subscription
```

### Component Library
- `GlassPanel` — Frosted glass container with soft shadow
- `AppButton` — Primary / Secondary / Ghost variants
- `IconButton` — Glass / Ghost / Filled circular buttons
- `ScreenShell` — SafeArea + ScrollView wrapper with decorative orbs
- `AnimatedFadeIn` — Reanimated entrance animation (opacity + translateY)
- `AnimatedScalePress` — Spring-based press feedback
- `ProgressBar` — Customizable progress indicator
- `ReviewCard` — User review with avatar, stars, likes
- `StatCard` — Icon + value + label stat display
- `SectionHeader` — Section title + action link
- `CategoryChip` — Selectable filter/category pill
- `BookCard` — Vertical book preview (180px wide)
- `FeaturedBookCard` — Large featured book with CTA

---

## 2. App Color Palette

### Light Theme
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#F6F7FB` | Page backgrounds |
| `surface` | `rgba(255,255,255,0.78)` | Glass panels |
| `surfaceStrong` | `#FFFFFF` | Solid cards, inputs |
| `text` | `#111827` | Primary text |
| `mutedText` | `#667085` | Secondary text |
| `border` | `#E6EAF2` | Card borders, dividers |
| `primary` | `#5B8CFF` | CTAs, links, active states |
| `secondary` | `#79D9B7` | Success accents, audio |
| `accent` | `#FFBC7D` | Warm highlights, ratings |
| `accentSoft` | `#F3D7E6` | Romance/soft category |
| `success` | `#36B37E` | Completed states |
| `danger` | `#F25F5C` | Destructive actions, hearts |

### Dark Theme
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#0C1220` | Deep navy base |
| `surface` | `rgba(20,27,44,0.86)` | Glass panels |
| `surfaceStrong` | `#141B2C` | Solid cards |
| `text` | `#F3F6FC` | Primary text |
| `mutedText` | `#94A3B8` | Secondary text |
| `border` | `#263042` | Card borders |
| `primary` | `#7AA2FF` | Brighter blue for contrast |
| `secondary` | `#5CC9A7` | Teal green |
| `accent` | `#FFB86B` | Warm orange |
| `success` | `#4BD1A0` | Bright green |
| `danger` | `#FF7C72` | Coral red |

### Typography Scale
- **Display**: 34px / weight 800
- **Title**: 24px / weight 700
- **Subtitle**: 18px / weight 600
- **Body**: 16px / weight 400
- **Caption**: 13px / weight 500
- **Micro**: 11px / weight 600

### Shadow System
- iOS: `shadowColor: #10243E`, opacity 0.08, radius 24, offset (0, 14)
- Android: `elevation: 6`

---

## 3. Logo Concept

### Bookola Logo Design
- **Mark**: An open book silhouette with one page curved upward, forming a subtle "B" shape. A small sparkle (✦) sits at the top-right, representing AI intelligence.
- **Wordmark**: "BOOKOLA" in a geometric sans-serif (Inter or SF Pro Display), weight 800, tracking 2.2px
- **Icon variants**:
  - Full color: Primary blue (`#5B8CFF`) book mark on white
  - Dark mode: Lighter blue (`#7AA2FF`) on dark navy (`#0C1220`)
  - Monochrome: Single-color silhouette for adaptive icons
- **Splash screen**: Dark navy background (`#0C1220`) with centered white book mark, clean and premium

---

## 4. Database Schema

### Supabase / PostgreSQL Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  auth_provider TEXT DEFAULT 'email', -- 'email' | 'google' | 'apple'
  subscription_tier TEXT DEFAULT 'free', -- 'free' | 'premium'
  subscription_expires_at TIMESTAMPTZ,
  preferred_genres TEXT[] DEFAULT '{}',
  daily_goal_minutes INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Books
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  cover_url TEXT,
  accent_color TEXT DEFAULT '#DDEBFF',
  rating NUMERIC(2,1) DEFAULT 0,
  rating_count INT DEFAULT 0,
  pages INT,
  language TEXT DEFAULT 'English',
  published_year INT,
  duration TEXT, -- audiobook duration e.g. '5h 42m'
  has_audio BOOLEAN DEFAULT false,
  epub_url TEXT,
  audio_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User book progress
CREATE TABLE user_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  progress NUMERIC(5,2) DEFAULT 0, -- percentage 0-100
  current_page INT DEFAULT 0,
  current_audio_position INT DEFAULT 0, -- seconds
  is_favorite BOOLEAN DEFAULT false,
  is_downloaded BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  UNIQUE(user_id, book_id)
);

-- Highlights
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  note TEXT,
  color TEXT DEFAULT '#FFE08A',
  page INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookmarks
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  page INT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Review likes
CREATE TABLE review_likes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, review_id)
);

-- Reading clubs
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '📚',
  created_by UUID REFERENCES users(id),
  member_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Club members
CREATE TABLE club_members (
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (club_id, user_id)
);

-- Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_value INT NOT NULL, -- e.g. 100 pages
  target_unit TEXT DEFAULT 'pages', -- 'pages' | 'books' | 'hours' | 'days'
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User challenge progress
CREATE TABLE user_challenges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  progress INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id, challenge_id)
);

-- Reading sessions (for stats tracking)
CREATE TABLE reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  duration_minutes INT NOT NULL,
  pages_read INT DEFAULT 0,
  session_type TEXT DEFAULT 'read', -- 'read' | 'listen'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI recommendation cache
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  score NUMERIC(4,3), -- relevance score 0-1
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_books_user ON user_books(user_id);
CREATE INDEX idx_highlights_user ON highlights(user_id);
CREATE INDEX idx_reviews_book ON reviews(book_id);
CREATE INDEX idx_reading_sessions_user ON reading_sessions(user_id);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_ai_recs_user ON ai_recommendations(user_id);
```

---

## 5. Folder Structure

```
bookola/
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
│
├── assets/
│   └── images/
│       ├── icon.png              # App icon
│       ├── splash-icon.png       # Splash screen logo
│       ├── favicon.png           # Web favicon
│       ├── learn.png             # Onboarding illustration 1
│       ├── edu.png               # Onboarding illustration 2
│       └── road.png              # Onboarding illustration 3
│
├── docs/
│   └── bookola-blueprint.md      # This file
│
└── src/
    ├── app/                      # Expo Router file-based routing
    │   ├── _layout.tsx           # Root Stack navigator
    │   ├── index.tsx             # Onboarding intro slider
    │   │
    │   ├── (auth)/               # Auth group
    │   │   ├── _layout.tsx       # Auth stack
    │   │   ├── login.tsx         # Email + Google login
    │   │   ├── signup.tsx        # Registration
    │   │   ├── forgot-password.tsx # Password reset
    │   │   └── preferences.tsx   # Genre selection
    │   │
    │   ├── (tabs)/               # Main tab navigator
    │   │   ├── _layout.tsx       # Tab bar config with icons
    │   │   ├── home.tsx          # Discovery feed
    │   │   ├── search.tsx        # Search + filters
    │   │   ├── library.tsx       # Personal library
    │   │   ├── community.tsx     # Social features
    │   │   └── profile.tsx       # User dashboard
    │   │
    │   ├── book/[id].tsx         # Book details (dynamic)
    │   ├── reader/[id].tsx       # Reading interface (dynamic)
    │   ├── player/[id].tsx       # Audio player (dynamic)
    │   ├── settings/index.tsx    # App settings
    │   └── subscription/index.tsx # Subscription plans
    │
    ├── components/
    │   ├── cards/
    │   │   ├── book-card.tsx     # Vertical book card
    │   │   ├── featured-book-card.tsx # Hero featured card
    │   │   └── category-chip.tsx # Selectable category pill
    │   │
    │   └── shared/
    │       ├── animated-fade-in.tsx    # Reanimated fade+slide entrance
    │       ├── animated-scale-press.tsx # Spring press feedback
    │       ├── app-button.tsx    # Primary/Secondary/Ghost button
    │       ├── glass-panel.tsx   # Frosted glass card
    │       ├── icon-button.tsx   # Circular icon button
    │       ├── progress-bar.tsx  # Progress indicator
    │       ├── review-card.tsx   # User review display
    │       ├── screen-shell.tsx  # Page layout wrapper
    │       ├── section-header.tsx # Section title + action
    │       └── stat-card.tsx     # Stats display card
    │
    ├── data/
    │   └── mock-books.ts         # Mock data for prototyping
    │
    ├── lib/
    │   └── theme/
    │       ├── colors.ts         # Light + dark palettes
    │       ├── typography.ts     # Font size scale
    │       ├── spacing.ts        # Spacing scale
    │       ├── shadows.ts        # Platform shadows
    │       └── use-app-theme.ts  # Theme hook
    │
    └── types/
        └── book.ts               # TypeScript type definitions
```

---

## 6. API Structure

### RESTful API Endpoints (Supabase Edge Functions or Express)

```
Auth
────────────────────────────────────────
POST   /auth/signup                 Create account (email/password)
POST   /auth/login                  Login with credentials
POST   /auth/google                 Google OAuth flow
POST   /auth/forgot-password        Send reset email
POST   /auth/reset-password         Reset with token
GET    /auth/me                     Get current user profile
PATCH  /auth/me                     Update profile

Books
────────────────────────────────────────
GET    /books                       List books (paginated, filterable)
GET    /books/:id                   Get book details
GET    /books/featured              Get featured picks
GET    /books/trending              Get trending books
GET    /books/search?q=             Search by title/author/category
GET    /books/category/:category    Books by category

User Library
────────────────────────────────────────
GET    /library                     Get user's books with progress
POST   /library/:bookId             Add book to library
PATCH  /library/:bookId             Update reading progress
DELETE /library/:bookId             Remove from library
GET    /library/favorites           Get favorite books
POST   /library/:bookId/favorite    Toggle favorite
GET    /library/downloads           Get downloaded books

Reading & Audio
────────────────────────────────────────
GET    /books/:id/content           Get book content (epub/chapters)
GET    /books/:id/audio             Get audio stream URL
POST   /reading-sessions            Log a reading session

Highlights & Bookmarks
────────────────────────────────────────
GET    /highlights                  Get user's highlights
POST   /highlights                  Create highlight
PATCH  /highlights/:id              Update highlight/note
DELETE /highlights/:id              Delete highlight
GET    /bookmarks                   Get bookmarks
POST   /bookmarks                   Create bookmark
DELETE /bookmarks/:id               Delete bookmark

Reviews
────────────────────────────────────────
GET    /books/:id/reviews           Get reviews for a book
POST   /books/:id/reviews           Post a review
PATCH  /reviews/:id                 Update review
DELETE /reviews/:id                 Delete review
POST   /reviews/:id/like            Toggle like

Community
────────────────────────────────────────
GET    /clubs                       List reading clubs
POST   /clubs                       Create a club
POST   /clubs/:id/join              Join a club
DELETE /clubs/:id/leave             Leave a club
GET    /challenges                  List active challenges
POST   /challenges/:id/join         Join a challenge
PATCH  /challenges/:id/progress     Update challenge progress

AI & Recommendations
────────────────────────────────────────
GET    /recommendations             AI-powered book suggestions
GET    /insights                    Reading analytics & insights

Subscription
────────────────────────────────────────
GET    /subscription                Get current plan
POST   /subscription/checkout       Create payment session
POST   /subscription/webhook        Stripe/RevenueCat webhook
```

---

## 7. Feature List

### Core Features (Implemented)
- [x] Beautiful onboarding (3-slide intro with animations)
- [x] Email login & signup with animated transitions
- [x] Google login (UI ready)
- [x] Forgot password flow with success state
- [x] Genre preference selection
- [x] Home feed: featured, trending, recommended, continue reading, quick picks
- [x] Dynamic greeting (Good morning/afternoon/evening)
- [x] Full-text search with results
- [x] Advanced filters (rating, format, length, sort)
- [x] Browse by genre (7 categories with icons)
- [x] Book details: cover, meta, description, reviews, AI recommendation
- [x] Read/Listen CTA buttons
- [x] Horizontal page-swipe reader with font controls
- [x] Highlights & notes panel in reader
- [x] Audiobook player with chapters, speed control, sleep timer
- [x] Dark mode & light mode (system-automatic)
- [x] Reading progress tracking with visual bars
- [x] Bookmark system (UI)
- [x] Favorites system with heart toggle
- [x] Offline downloads tracking with storage info
- [x] Community feed with reviews and compose
- [x] Reading clubs with join/create
- [x] Weekly challenges with progress tracking
- [x] Profile dashboard with stats grid
- [x] Reading streak tracker with weekly dots
- [x] Genre breakdown analytics with progress bars
- [x] AI reading analysis insights
- [x] Settings with appearance, reading, notifications, storage, account
- [x] Subscription plans with yearly/monthly comparison
- [x] Glassmorphic UI components with soft shadows
- [x] Smooth Reanimated fade-in animations
- [x] Spring-based press feedback animations
- [x] Tab bar with icons and active state highlights
- [x] Responsive, adaptive layouts

### Planned Features
- [ ] Real Supabase/Firebase backend integration
- [ ] ePub file rendering (react-native-epub-reader)
- [ ] Real audio playback (expo-av)
- [ ] Push notifications (expo-notifications)
- [ ] Social sharing
- [ ] Reading streaks with calendar heatmap
- [ ] In-app purchases (RevenueCat)
- [ ] AI recommendation engine (vector embeddings)
- [ ] Export highlights to PDF/Notion
- [ ] Parental controls
- [ ] Web app (Next.js)

---

## 8. Monetization Ideas

### Freemium Model
| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 5 books/month, basic search, 10 highlights, community access |
| **Premium** | $8.99/mo or $79.99/yr | Unlimited books, audiobooks, offline, AI recs, advanced analytics |
| **Family** | $14.99/mo | Premium for up to 5 accounts |

### Revenue Streams
1. **Subscription** — Core revenue driver (Premium & Family plans)
2. **Individual book purchases** — Buy individual premium titles
3. **Affiliate commissions** — Link to physical book retailers
4. **Publisher partnerships** — Featured placement fees for publishers
5. **Brand sponsorships** — Sponsored reading challenges and community events
6. **Gift cards** — Digital gift cards for Premium subscriptions
7. **Merchandise** — Bookola-branded bookmarks, reading journals
8. **API access** — Developer API for reading analytics

---

## 9. Launch Strategy

### Phase 1: Pre-Launch (Weeks 1-4)
- Build landing page at bookola.app
- Create social media presence (Instagram, Twitter/X, TikTok)
- Launch "BookTok" content series
- Build email waitlist with early-access perks
- Partner with 5-10 book influencers for beta reviews
- Submit to ProductHunt, IndieHackers

### Phase 2: Beta Launch (Weeks 5-8)
- Private beta with 500 waitlist users
- Collect feedback and iterate on UX
- Add 1000+ books to the catalog
- Test subscription flow with Stripe/RevenueCat
- Load test backend infrastructure

### Phase 3: Public Launch (Weeks 9-12)
- Submit to Apple App Store and Google Play Store
- Launch with 7-day free trial for Premium
- PR outreach to tech and book publications
- Reddit AMAs in r/books, r/audiobooks, r/reactnative
- Launch referral program (give 1 month, get 1 month)

### Phase 4: Growth (Months 4-12)
- Localization (Arabic, Spanish, French, Urdu)
- Introduce Family plan
- Launch reading challenges with prizes
- Build publisher dashboard for content submission
- Expand audiobook catalog
- Release web app version

---

## 10. App Store Description

### Title
**Bookola — Read, Listen, Grow**

### Subtitle
AI-powered reading with audiobooks, highlights, and community

### Description
```
Bookola is your calm, focused reading space — designed for readers who want
more than just a book app.

READ BEAUTIFULLY
Enjoy a distraction-free reading experience with customizable fonts, themes,
and a clean interface inspired by the best of Scandinavian design.

LISTEN ANYWHERE
Seamlessly switch between reading and listening. Pick up your audiobook
exactly where your eyes left off.

SMART HIGHLIGHTS
Save quotes, add notes, and build a personal knowledge library. Export your
highlights anytime.

AI THAT GETS YOU
Our recommendation engine learns your taste and suggests books that actually
fit — not just what's popular.

TRACK YOUR GROWTH
Watch your reading streak grow. See your stats, favorite genres, and
reading patterns with beautiful analytics.

JOIN THE COMMUNITY
Share reviews, join reading clubs, and take on weekly challenges with
readers around the world.

OFFLINE READY
Download books and audiobooks for offline reading — perfect for flights,
commutes, and quiet evenings.

PREMIUM FEATURES
• Unlimited audiobook listening
• Offline reading & downloads
• AI-powered recommendations
• Exclusive book collections
• Ad-free experience
• Advanced reading analytics

Start your 7-day free trial today. No commitment, cancel anytime.
```

### Keywords
`books, reading, audiobooks, ebooks, book tracker, reading list, highlights, notes, book club, AI recommendations`

---

## 11. Modern Splash Screen

### Splash Screen Design
- **Background**: Deep navy `#0C1220` (matches dark theme)
- **Center element**: White Bookola book-mark icon (120px)
- **Style**: Minimal, no text on splash — the icon speaks for itself
- **iOS**: System splash with smooth fade-in transition
- **Android**: Adaptive splash with 120px icon width
- **Duration**: ~1.5s with fade-out transition to onboarding

### Configuration (app.json)
```json
{
  "expo-splash-screen": {
    "backgroundColor": "#0C1220",
    "image": "./assets/images/splash-icon.png",
    "imageWidth": 120
  }
}
```

---

## 12. Interactive Prototype Ideas

### Prototype 1: "First Read" Flow
Simulate the complete journey from opening the app to reading the first page:
`Splash → Onboarding → Signup → Preferences → Home → Book Details → Reader`

### Prototype 2: "Switch & Listen"
Show the seamless transition from reading to audio:
`Reader (page 42) → Tap 🎧 → Audio Player (same position) → Speed change → Chapter select`

### Prototype 3: "Social Discovery"
Demonstrate the community and discovery loop:
`Home → Trending → Book Details → Write Review → Community Feed → Join Club`

### Prototype 4: "Knowledge Capture"
Highlight the note-taking and knowledge workflow:
`Reader → Long-press highlight → Add note → Library → Highlights tab → All notes view`

### Prototype 5: "Premium Upgrade"
Show the subscription conversion funnel:
`Profile → Premium CTA → Subscription → Plan comparison → Checkout → Success`

### Animation Specifications
- **Screen transitions**: Fade (300ms) for tabs, slide-from-right (350ms) for push, slide-from-bottom for modals
- **Card entrances**: Staggered fade-in (50ms delay per item, 500ms duration, 18px translateY)
- **Press feedback**: Spring scale (0.97 scale, damping 15, stiffness 300)
- **Tab switches**: Cross-fade (200ms)
- **Progress bars**: Animated width with easing (400ms)
