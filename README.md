# Doodle Duel - Hack The Mountain

A fast-paced, daily art game that requires the user to draw and submit in 2 minutes, then jump into the arena and rate everyone else's artwork!

## Demo

- Live app: `doodle-duel-htm.vercel.app`
- Video: `TODO`

## What It Does?

- Daily Draw: one official drawing per day, with a 2-minute timer.
- Auto-submit on timeout: if the timer hits zero, your current canvas is submitted.
- Rate It Arena: swipe/right-left (or buttons on desktop) to vote on today’s entries.
- Live leaderboard: top cards are highlighted, with full daily ranking below.
- Supabase auth: sign up, log in and keep daily submissions tied to your profile.

## What we use?

- Next.js (App Router)
- React
- Tailwind CSS
- Supabase (Backend server : auth, postgres, storage)
- Vercel (Frontend Deployment)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the app:

```bash
npm run dev
```

4. Open `http://localhost:3000 or 3001`

## Scripts

- `npm run dev` - Start local testing server
- `npm run build`
- `npm run start` - Run official build

## How It Works?

- Users authenticate with Supabase Auth.
- Daily Draw allows one official submission per local day.
- Canvas image uploads to Supabase Storage (`artworks` bucket).
- Artwork metadata and Elo score save in Supabase Postgres.
- Rate It updates Elo based on swipe votes and builds a daily leaderboard.

## Core Routes

- `/` - Landing page
- `/auth` - Login / signup
- `/quickplay` - Daily draw hub
- `/quickplay/create` - Drawing canvas + submission
- `/rate-it` - Voting entry page
- `/rate-it/arena` - Swipe voting arena + leaderboard

## Future ideas

- Add personal stats card (submissions, average Elo, best rank).
- Real-time live 1v1 battles via (WebSocket rooms).
- Add sharing for submitted artwork.
