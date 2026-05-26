# TypeCraft ⚡ — Speed Typing Platform

A full-stack typing platform built with **Node.js + Express + MongoDB + React (Vite)**.  
Features: real-time WPM tracking, multiplayer races (Socket.IO), global leaderboard, structured courses, settings that persist across all pages.

---

## Project Structure

```
typecraft/
├── server/            # Express + Socket.IO backend
│   ├── index.js       # Main server entry point
│   ├── db.js          # MongoDB connection
│   ├── models/        # Mongoose models (User, Score)
│   ├── routes/        # REST API routes (auth, scores, leaderboard)
│   ├── middleware/     # JWT auth middleware
│   └── .env           # Environment variables (git-ignored)
├── client/            # React SPA (Vite)
│   ├── src/
│   │   ├── pages/     # All page components
│   │   ├── components/# Navbar
│   │   └── context/   # Settings + Auth context (global state)
│   └── vite.config.js
└── package.json       # Root scripts for running both together
```

---

## Local Development

### 1. Prerequisites
- Node.js 18 or higher
- A free MongoDB Atlas account (or local MongoDB)

### 2. Clone & install
```bash
# Install all dependencies for both server and client
npm run install:all
```

### 3. Configure environment
```bash
cp .env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secret
```

### 4. Run in development mode (both server + client)
```bash
npm run dev
```
- Server runs on **http://localhost:4000**
- Client runs on **http://localhost:3000**

---

## API Endpoints

| Method | Path                    | Auth | Description              |
|--------|-------------------------|------|--------------------------|
| POST   | /api/auth/register      | –    | Create account           |
| POST   | /api/auth/login         | –    | Sign in, get JWT token   |
| GET    | /api/auth/me            | ✓    | Get current user         |
| PUT    | /api/auth/settings      | ✓    | Save user settings       |
| POST   | /api/scores             | ✓    | Save a test result       |
| GET    | /api/scores/me          | ✓    | Get own score history    |
| GET    | /api/leaderboard        | –    | Global leaderboard       |

Socket.IO events: `room:create`, `room:join`, `room:start`, `room:progress`, `room:leave`, `room:quickmatch`

---

## Deploying to Production

### Option A — Render.com (free, recommended)

**Server:**
1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Set Root Directory: `server`
4. Build command: `npm install`
5. Start command: `node index.js`
6. Add environment variables:
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = a long random string
   - `CLIENT_URL` = your Vercel/Netlify URL (e.g. `https://typecraft.vercel.app`)
   - `PORT` = `4000` (or leave blank — Render sets it automatically)

**Client:**
1. Go to https://vercel.com → New Project → import your repo
2. Set Root Directory: `client`
3. Framework Preset: Vite
4. Add environment variable:
   - Create `client/.env.production` with: `VITE_API_URL=https://your-render-url.onrender.com`
5. In `client/src/context/AuthContext.jsx` and other files replace `http://localhost:4000` with `import.meta.env.VITE_API_URL`

### Option B — VPS / DigitalOcean

```bash
# On your server
git clone <your-repo>
cd typecraft

# Install deps
npm run install:all

# Build client
npm run build
# Client build output is in client/dist/

# Serve client/dist with nginx, and run server/index.js with PM2
npm install -g pm2
pm2 start server/index.js --name typecraft-server
pm2 save
```

**Nginx config example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve React client
    root /path/to/typecraft/client/dist;
    index index.html;
    try_files $uri $uri/ /index.html;

    # Proxy API + WebSocket to Express
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

---

## Features Implemented

- **Global Settings** — Font, font size, caret style, WPM display, sound, language — all synced across pages and persisted in localStorage + MongoDB
- **Typing Page** — Words / Quotes / Code / Zen modes; click anywhere to dismiss blur overlay; Tab to restart; character-by-character feedback; live WPM
- **Zen Mode** — Free typing, no target text, no timer, press Finish when done
- **Results Page** — Animated WPM chart, grade, all stats, saved to server if logged in
- **Versus (Multiplayer)** — Real Socket.IO rooms, countdown, live progress bars, host controls, quick match, join by code, room browser
- **Leaderboard** — Real data from DB, filter by mode (words/quotes/code) and period (today/week/all time)
- **Courses** — Structured lessons with unlock progression, lesson progress saved locally
- **Profile** — Stats, achievements, full test history (local + server)
- **Auth** — JWT-based register/login, settings saved to user account

---

## MongoDB Atlas Setup (free tier)

1. Go to https://cloud.mongodb.com and create a free account
2. Create a new cluster (M0 Free)
3. Create a database user (Settings → Database Access)
4. Allow network access (Network Access → Add IP → 0.0.0.0/0 for all IPs)
5. Click Connect → Drivers → copy the connection string
6. Replace `<password>` with your DB user password and paste into `server/.env`
