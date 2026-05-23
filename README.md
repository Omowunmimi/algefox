# AlgeFox

A gamified mathematics Progressive Web App (PWA) for JSS2 students in Nigeria.

Built as a final year project studying the effect of gamification on students' interest in **Algebraic Expressions** and **Fractions**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion 11 |
| State | Zustand 4 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Math rendering | KaTeX |
| Audio | Howler.js |
| Drag & Drop | @dnd-kit |
| Confetti | canvas-confetti |

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/Omowunmimi/algefox.git
cd algefox
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your Supabase URL and anon key
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Login, signup, mascot intro
│   ├── (onboarding)/     # Profile setup + skill level
│   ├── (app)/            # Home, learn, achievements, profile, progress
│   ├── lesson/           # Dynamic lesson route [sectionId]/[level]
│   ├── auth/callback/    # Supabase OAuth callback (PKCE)
│   └── api/              # Route handlers (award-xp, complete-level, research-export)
├── components/           # Reusable UI components
│   ├── mascot/           # Ayo the Fox SVG mascot
│   ├── questions/        # Question type renderers
│   ├── gamification/     # Hearts, XP bar, streak, achievements
│   ├── visualizers/      # Fraction/algebra visual aids
│   └── ui/               # Design system primitives (Button, Card, etc.)
├── lib/
│   ├── supabase/         # Browser + server clients
│   ├── engine/           # Question generator + lesson engine
│   └── utils/            # cn, math helpers, format helpers
├── stores/               # Zustand stores (user, lesson, game, streak, audio)
├── types/                # TypeScript types (database, lesson, gamification, question)
├── content/
│   └── templates/        # Question template seeds (fractions + algebra)
└── hooks/                # Custom React hooks
```

---

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `RESEARCH_EXPORT_KEY` | Secret key protecting the research CSV export |
| `NEXT_PUBLIC_APP_URL` | App URL (for OAuth redirects) |

---

## Research Context

This app is part of a final year project examining the **effect of gamification techniques on JSS2 students' interest in algebraic expressions and fractions**. Participant data is anonymised and accessible only via the `/api/research-export` route with a valid key.
