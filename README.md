# Beat The Drop 🎵

A real-time multiplayer music guessing game. Players join a shared room, listen to 30-second song previews, and race to type the correct song title first. Built to explore WebSocket-driven architecture and real-time state synchronisation across multiple clients.

![Node.js](https://img.shields.io/badge/Node.js-22-green) ![React](https://img.shields.io/badge/React-19-blue) ![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

---

## Features

- **Multiplayer rooms** — create a room with a custom code and share it with friends
- **Real-time gameplay** — guesses, scores, and round transitions sync instantly across all players
- **10-round games** — each round plays a different song preview with artist, genre, and release year as hints
- **Auto-skip timer** — rounds automatically skip after 20 seconds if nobody guesses correctly
- **Live leaderboard** — scores update in real time after each correct guess
- **In-game chat** — chat doubles as the guess input; correct guesses are detected from chat messages
- **Tie detection** — gracefully handles shared top scores at game end

---

## Tech Stack

### Backend
- **Node.js + Express 5** — HTTP server and middleware
- **Socket.io** — WebSocket server handling all real-time events
- **Supabase** — PostgreSQL database accessed via a `get_random_song()` RPC function
- **express-rate-limit** — rate limiting (50 req/min per IP)

### Frontend
- **React 19** with the React Compiler enabled
- **TypeScript**
- **Vite** — build tool and dev server
- **Socket.io-client** — connects to the backend over WebSockets
- **TailwindCSS 4**
- **React Router 7**
- **TanStack React Query**

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
    ├── roomHandler    — create / join / leave rooms
    ├── gameHandler    — start game, round timers, skip logic
    ├── messageHandler — chat messages + guess validation
    └── userHandler    — username management
    │
    ▼
Supabase (PostgreSQL)
    └── get_random_song() RPC
```

### Game loop

1. A player emits `start-game` → server fetches a random song from Supabase and emits `game-started` to the room
2. A 20-second timer starts on the server; if it fires, the round is skipped and the next song is loaded
3. Players type guesses as chat messages via `send-message`
4. The server normalises the guess (lowercase, diacritics stripped, punctuation removed) and compares it to the normalised song title
5. On a correct guess: the timer is cleared, 1 point is awarded, and `game-correct-guess` + the next round data are emitted to the room
6. After 10 rounds, `game-end` is emitted with final scores, winner, and tie status

### Room lifecycle

Rooms exist purely in Socket.io's adapter (no database). When the last player leaves or disconnects, the server clears the round timer and deletes the in-memory game state — handled via Socket.io's `disconnecting` event (which fires before the socket leaves its rooms).

### Text normalisation

Guesses are normalised before comparison to handle accented characters, featured artist annotations, and punctuation differences:

```js
const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")          // strip diacritics
    .replace(/[\(\[（［][^)\]）］]*[\)\]）］]|[^\w\s]/g, "") // remove bracketed text + punctuation
    .trim()
    .replace(/[^a-z0-9]/g, "");
```

---

## Skills Demonstrated

| Area | Details |
|---|---|
| **WebSockets** | Bidirectional real-time communication with Socket.io; event-driven architecture with no REST endpoints at runtime |
| **Real-time state sync** | Game state (scores, round, current song) kept on the server and pushed to all clients; no client polls |
| **Room & session management** | In-memory room lifecycle using Socket.io's adapter; proper cleanup on disconnect using the `disconnecting` event |
| **Timer management** | Per-room `setTimeout` tracked in a `Map`; cleared on correct guess or room destruction to prevent ghost timers |
| **Containerisation** | Multi-stage Dockerfile: stage 1 builds the Vite frontend, stage 2 runs the Node server with the compiled assets baked in |
| **TypeScript** | Typed socket events, component props, and shared game types across the frontend |
| **React 19** | Enabled the experimental React Compiler; custom hooks to encapsulate socket event listeners |
| **Database integration** | Supabase PostgreSQL with a server-side RPC function for random song selection |
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
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
PORT=3500
```

---

## Project Structure

```
├── backend/
│   ├── server.js
│   ├── config/          # CORS options, Supabase client
│   ├── middleware/      # Rate limiter
│   ├── sockets/
│   │   ├── index.js
│   │   └── handlers/    # gameHandler, roomHandler, messageHandler, userHandler
│   └── service/         # gameService, roomService, spotifyService, songService
├── frontend/
│   └── src/
│       ├── app/         # Page components (Home, PlayWithFriends, Room)
│       ├── components/  # Buttons, chat, game over screen
│       ├── hooks/       # Socket event hooks
│       └── types/
├── backend/Dockerfile   # Multi-stage build
└── docker-compose.yaml
```
