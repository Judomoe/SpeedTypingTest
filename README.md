# TypeCraft ⌨️✦

> The typing platform designed to beat MonkeyType and KeyBR — combined.

## Design System

- **Theme**: Dark, electric yellow-green + cyan accents on near-black
- **Fonts**: Outfit (display), JetBrains Mono (typing/code), DM Sans (body)
- **Palette**: `#e8ff57` (accent), `#57ffd8` (success/correct), `#ff6b6b` (error), `#c084fc` (purple)

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 + React 18 + TypeScript |
| Styling | Tailwind CSS + inline CSS variables |
| Backend | Next.js API Routes (RESTful) |
| Database | MongoDB via Mongoose (Atlas free tier) |
| Auth | NextAuth.js + bcryptjs |
| Realtime | Socket.io (multiplayer) |
| Animations | Framer Motion |

## Pages

| Route | Page |
|---|---|
| `/` | Home — hero, stats, feature cards |
| `/typing` | Typing test — MonkeyType-inspired |
| `/courses` | Lessons — Agile Fingers-inspired |
| `/results` | Results — grade system, WPM chart |
| `/leaderboard` | Global rankings + podium |
| `/multiplayer` | Live race rooms + Quick match |
| `/profile` | Stats, history, achievements |
| `/settings` | Font, caret, sound, language |
| `/subscription` | Free / Pro / Team plans |
| `/help` | FAQ, shortcuts, getting started |
| `/login` | Sign in |
| `/register` | Create account |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth` | Register or login |
| POST | `/api/scores` | Save test result |
| GET | `/api/scores?userId=` | Get user history |
| GET | `/api/leaderboard` | Top 100 players |

## Database Schema

### User
```
_id, username (unique), email (unique), password (bcrypt hash)
country, avatar, isPro, createdAt
stats: { totalTests, bestWpm, avgWpm, avgAcc, streak, lastActive }
```

### Score
```
_id, userId (ref→User), wpm, accuracy, errors, duration, mode, language, createdAt
```

## Quick Start

```bash
# 1. Install
npm install

# 2. Setup env
cp .env.local.example .env.local
# → Paste your MongoDB Atlas URI

# 3. Run dev
npm run dev
# → http://localhost:3000
```

## Deploy (Bonus marks!)

```bash
# Push to GitHub, then:
npx vercel --prod
# Add MONGODB_URI in Vercel dashboard
```

## Team Responsibilities

| Member | Student ID | Role |
|---|---|---|
| | | Frontend (Home, Typing, Courses) |
| | | Backend (API Routes, Auth, DB) |
| | | UI/UX (Profile, Leaderboard, Multiplayer) |
