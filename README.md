# Beat The Drop 🎵

A real-time multiplayer music guessing game. Players join a shared room, listen to song previews, and race to guess the track first. Built to explore WebSocket-driven architecture and real-time state synchronisation across multiple clients.

![Node.js](https://img.shields.io/badge/Node.js-22-green) ![React](https://img.shields.io/badge/React-19-blue) ![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

---

## Features

- **Multiplayer rooms** — share a room code or invite link; up to 8 players, with anyone past that joining as a spectator
- **Host controls** — the room creator starts games, changes settings and can kick players; the role passes on if they leave
- **Game settings** — rounds (5–20), music length (10–30s), genre and era filters, and three modes: guess the title, guess the artist, or multiple choice
- **Hints over time** — the year shows first, then the genre, the artist, and finally the title's first letters, while pixelated album art sharpens
- **Everyone can score** — a round lasts until every player has guessed it or time runs out; each correct guess scores up to 1000 points, dropping every millisecond until the round ends, minus 50 for each player who got it first
- **Forgiving guesses** — accents, punctuation and small typos are accepted; near misses are only shown to the guesser, and players who got it can only chat with each other, so nobody can copy them
- **Reconnects** — a reload or dropped connection rejoins the same game with the same score, mid-song
- **No repeats** — songs don't repeat within a room until every matching song has been played
- **Solo practice** and a **daily challenge** — the same 5 songs for everyone each day (UTC), with a shareable emoji result grid
- **Reveals and recap** — album art on each answer, and a tracklist with artist links at the end of the game

---

## Tech Stack

### Backend
- **Node.js + Express 5** — HTTP server and middleware
- **Socket.io** — WebSocket server handling all real-time events
- **Neon** — serverless PostgreSQL, queried with `pg` through a read-only role
- **express-rate-limit** — rate limiting (50 req/min per IP)

### Frontend
- **React 19** with the React Compiler enabled
- **TypeScript**
- **Vite** — build tool and dev server
- **Socket.io-client** — connects to the backend over WebSockets
- **TailwindCSS 4**
- **React Router 7**

### Infrastructure
- **Docker** — multi-stage build: compiles the React frontend then bundles it with the Node backend into a single image
- **Docker Compose** — local development with file-watch and auto-restart

---

## Architecture

The entire application is event-driven — there are no REST API calls at runtime. Every user action (joining a room, sending a guess, starting a game) is a Socket.io event.

```
Client (React)
    │  Socket.io events
    ▼
Server (Express + Socket.io)
    ├── roomHandler    — create / join / leave, settings, kicks, host handover
    ├── gameHandler    — start game, round timers, hints, multiple choice picks
    └── messageHandler — chat messages + guess validation
    │
    ▼
Neon (PostgreSQL)
    └── songs + artists tables
```

### Game loop

1. The host emits `start-game` → the server fetches songs matching the room's settings (skipping ones already played in the room) and emits `game-started`, then `game-round`
2. A timer runs on the server: every quarter of the music it emits `game-hint`, then `game-music-stop` pauses the song for everyone, and 5 silent seconds later the round ends with no winner
3. Players type guesses as chat messages via `send-message` (or `pick-option` in multiple choice)
4. The server normalises the guess and compares it to the answer with a small typo allowance; near misses go back only to the sender
5. A correct guess scores by speed and the guesser gets `guess-result`; once every connected player has it (or used their pick), or time runs out, `round-end` (the reveal) is emitted, clients show a round leaderboard, and the next `game-round` follows after a 5 second break
6. After the last round, `game-end` is emitted with final scores, winner, tie status and the tracklist

### Room lifecycle

Rooms live in memory on the server (no database). Each browser tab sends a random secret key when it connects; the server identifies the player by its hash, so a reconnecting tab gets its seat and score back while other players only ever see the hash. When nobody is connected, the room is destroyed after a 30-second grace period, along with its timer and game state.

### Text normalisation

Guesses are normalised before comparison to handle accented characters, featured artist annotations, version suffixes, and punctuation differences: lowercase, strip diacritics, drop bracketed text like `(feat. ...)` and `- Remastered 2011` suffixes, then keep only letters and digits. The result is compared with Levenshtein distance — 1 typo allowed for answers over 4 characters, 2 for answers over 8.

---

## Skills Demonstrated

| Area | Details |
|---|---|
| **WebSockets** | Bidirectional real-time communication with Socket.io; event-driven architecture with no REST endpoints at runtime |
| **Real-time state sync** | Game state (scores, round, current song) kept on the server and pushed to all clients; no client polls |
| **Room & session management** | In-memory rooms with hosts, spectators and reconnects keyed by a hashed client secret; cleanup on disconnect using the `disconnecting` event |
| **Timer management** | One chained `setTimeout` per room drives hints, the music stop and the skip; cleared on correct guess or room destruction to prevent ghost timers |
| **Containerisation** | Multi-stage Dockerfile: stage 1 builds the Vite frontend, stage 2 runs the Node server with the compiled assets baked in |
| **TypeScript** | Typed socket events, component props, and shared game types across the frontend |
| **React 19** | Enabled the experimental React Compiler; custom hooks to encapsulate socket event listeners |
| **Database integration** | Neon PostgreSQL with parameterised filtering, exclusion and seeded ordering (for the daily challenge), read through a read-only role |
| **Security basics** | Rate limiting, CORS allowlist, `.env` for secrets, non-root Docker user |
| **Text processing** | Unicode normalisation + regex pipeline to make guessing forgiving of accents and punctuation |

---

## Running Locally

### With Docker (recommended)

```bash
docker compose up --build
```

App available at `http://localhost:3500`.

To watch for backend changes and auto-restart:

```bash
docker compose up --build --watch
```

### Without Docker

```bash
# Install and build frontend
cd frontend && npm install && npm run build

# Run backend (serves the built frontend)
cd ../backend && npm install && npm start
```

Requires a `backend/.env` with:

```
# Neon connection string for the read-only game_reader role
DATABASE_URL=...
PORT=3500
# Only needed for populateDatabaseWithSongs.js (neondb_owner connection string)
DATABASE_OWNER_URL=...
```

Apply new files in `backend/migrations/` in order, as the owner role, with `psql "$DATABASE_OWNER_URL" -f <file>` or the Neon SQL Editor. Then give `game_reader` a password with `ALTER ROLE game_reader PASSWORD '...'`. Run backend tests with `npm test` from `backend/`.

---

## Project Structure

```
├── backend/
│   ├── server.js
│   ├── config/          # CORS options, Postgres pool
│   ├── middleware/      # Rate limiter
│   ├── sockets/
│   │   ├── index.js
│   │   └── handlers/    # gameHandler, roomHandler, messageHandler
│   └── service/         # gameService, roomService, songService
├── frontend/
│   └── src/
│       ├── app/         # Page components (Home, PlayWithFriends, Room)
│       ├── components/  # Buttons, chat, round/settings/players panels, round results, game over screen
│       ├── hooks/       # Socket event hooks
│       └── types/
├── backend/Dockerfile   # Multi-stage build
└── docker-compose.yaml
```
