# Flip 7 Online

<!-- README-I18N:START -->

**English** | [Español](./README.es.md)

<!-- README-I18N:END -->

[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://franciscode.dev/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ingfranciscastillo/)
[![behance](https://img.shields.io/badge/behance-1769FF?style=for-the-badge&logo=behance&logoColor=white)](https://www.behance.net/ingfranciscastillo)
[![github_stars](https://img.shields.io/github/stars/ingfranciscastillo/flip7?style=for-the-badge)](https://github.com/ingfranciscastillo/flip7)
[![last_commit](https://img.shields.io/github/last-commit/ingfranciscastillo/flip7?style=for-the-badge)](https://github.com/ingfranciscastillo/flip7/commits)

**Flip 7** is a digital adaptation of the board game _Flip 7_ created by Eric Olsen and published by The Op Games. It's a "press-your-luck" party game where players take turns drawing cards, trying to build the highest scoring row without repeating any. With simple rules but deep strategy, each round is a tension between risking for more points or securing what you have.

This project is a TypeScript monorepo that implements the complete game with real-time sockets, a fully tested pure game engine, and a responsive interface with animations.

## Features

- **Real-time multiplayer** — With Socket.IO, up to 8 players can play simultaneously
- **Visual feedback system** — Animated announcements, subtle confetti, and bouncy effects for every game action
- **Pure game engine** — Fully tested logic with Vitest, separated from the frontend
- **Responsive UI** — Adaptive interface with Framer Motion for smooth animations
- **Auto-reconnection** — If you lose connection, you can reconnect without losing your progress
- **Player states** — View disconnections and reconnections in real time

## Tech Stack

### Web (Frontend)

- React 19 + Vite
- Tailwind CSS v4
- Zustand (state management)
- Framer Motion (animations)
- Socket.IO Client
- canvas-confetti

### Server (Backend)

- Express + Socket.IO
- Drizzle ORM
- PostgreSQL (Neon)
- TypeScript

### Packages

- `@flip7/shared` — Types and Zod schemas for socket events
- `@flip7/game-engine` — Pure game engine with tests

## Installation

### Requirements

- [Bun](https://bun.sh) ≥ 1.1
- PostgreSQL (can be local, Docker, or Neon/Supabase)

### Local Development

```bash
bun install

# In separate terminals
bun run dev:server
bun run dev:web
```

Open http://localhost:5173 in your browser.

## Quick Start

1. Open http://localhost:5173 in your browser
2. Create a room or join an existing one with the 6-letter code
3. Invite friends (minimum 3 players to start)
4. The host starts the game and you're ready to play!

### Player Connection

```bash
# Player 1: Create room
1. Enter your name and emoji
2. Click "Create room"
3. Share the code with your friends

# Player 2, 3, N: Join room
1. Enter your name and emoji
2. Click "Join"
3. Enter the 6-letter code
```

## Architecture

```
flip7/
├── apps/
│   ├── web/                    # React + Vite frontend
│   │   ├── app/
│   │   │   ├── components/     # UI components (Card, PlayerSeat, etc.)
│   │   │   ├── hooks/          # Custom hooks (useSocket, useSound)
│   │   │   ├── routes/         # Page routes (home, lobby, game)
│   │   │   ├── store/          # Zustand stores (game, feedback)
│   │   │   └── lib/            # Utilities (socket, audio)
│   │   └── public/
│   │       └── sounds/         # Audio files for feedback
│   │
│   └── server/                 # Express + Socket.IO backend
│       ├── src/
│       │   ├── sockets/        # Socket event handlers
│       │   ├── rooms/          # Room management (RoomManager)
│       │   ├── engine/         # Game engine bridge
│       │   ├── db/             # Drizzle schema + migrations
│       │   └── middleware/      # Rate limiting, etc.
│       └── drizzle.config.ts
│
├── packages/
│   ├── shared/                 # Shared types & Zod schemas
│   │   └── src/
│   │       ├── events.ts       # Socket event definitions
│   │       ├── cards.ts        # Card type definitions
│   │       └── index.ts
│   │
│   └── game-engine/            # Pure game logic
│       └── src/
│           ├── engine.ts       # Core game engine
│           ├── cards.ts        # Card logic
│           └── __tests__/      # Vitest tests
│
├── package.json                # Workspace root
├── tsconfig.base.json
└── README.md
```

## Flip 7 Rules

### Objective

Be the first player to reach **200 points** across multiple rounds.

### Cards

| Type                      | Description                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------- |
| **Number cards (0-12)**   | The card's value is its count in the deck (there are twelve 12s, eleven 11s, etc.) |
| **Modifiers (+2 to +10)** | Add extra points at the end of the round                                           |
| **×2**                    | Doubles the points from your number cards                                          |
| **Freeze**                | Freezes a player, forcing them to stay                                             |
| **Flip Three**            | Forces a player to draw 3 cards in a row                                           |
| **Second Chance**         | Saves you from a bust if you get a duplicate                                       |

### How to Play

1. **On your turn**: Choose **Hit** (draw another card) or **Stay** (secure your points)
2. **Bust**: If you draw a card with the same number you already have, you lose everything for that round
3. **Flip 7**: If you get 7 unique number cards, you win +15 bonus points and the round ends
4. **Winner**: The player with the most points at the end of the round adds their total. First to reach 200 wins.

### Round End Conditions

- All active players stay or bust
- A player achieves Flip 7 (7 unique number cards)

### Game End Conditions

- At least one player reaches 200 points at the end of a round
- The player with the most total points wins

## Smoke Test

1. `bun run dev:server` and `bun run dev:web`
2. Open two tabs at http://localhost:5173
3. Create a room in one, copy the code, join from the other
4. Start the game (minimum 3 players → you can open more tabs)

## Environment Variables

See `.env.example`.

| Variable          | Where  | Description                |
| ----------------- | ------ | -------------------------- |
| `PORT`            | server | HTTP port                  |
| `CORS_ORIGIN`     | server | Allowed origin (web)       |
| `DATABASE_URL`    | server | Postgres connection string |
| `VITE_SERVER_URL` | web    | Socket.IO server URL       |

## Suggested Deployment

- **Web** → Vercel / Netlify (Vite static build)
- **Server** → Railway / Fly.io (needs persistent websockets)
- **Postgres** → Neon / Railway / Supabase

Set `VITE_SERVER_URL` on the web host pointing to the public server.

## License

MIT License

## Acknowledgments

- **Flip 7** created by Eric Olsen and published by [The Op Games](https://theopgames.com/)
- **Tech stack**: React, Vite, Tailwind CSS, Zustand, Framer Motion, Socket.IO, Express, Drizzle ORM
- **Fonts**: Bangers and Fredoka from Google Fonts
- **Icons**: Hugeicons
