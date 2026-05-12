# Flip 7 Online

[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://franciscode.dev/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ingfranciscastillo/)
[![behance](https://img.shields.io/badge/behance-1769FF?style=for-the-badge&logo=behance&logoColor=white)](https://www.behance.net/ingfranciscastillo)
[![github_stars](https://img.shields.io/github/stars/ingfranciscastillo/flip7?style=for-the-badge)](https://github.com/ingfranciscastillo/flip7)
[![last_commit](https://img.shields.io/github/last-commit/ingfranciscastillo/flip7?style=for-the-badge)](https://github.com/ingfranciscastillo/flip7/commits)

**Flip 7** es una adaptación digital del juego de cartas de mesa _Flip 7_ creado por Eric Olsen y publicado por The Op Games. Es un juego party de tipo "press-your-luck" donde los jugadores toman turnos robando cartas, intentando construir la línea más alta de puntos sin repetirlas. Con reglas simples pero estrategia profunda, cada ronda es una tensión entre arriesgar para más puntos o asegurar lo que tienes.

Este proyecto es un monorepo TypeScript que implementa el juego completo con sockets en tiempo real, motor de juego puro testeado, y una interfaz responsiva con animaciones.

## Features

- **Multijugador en tiempo real** — Con Socket.IO, hasta 8 jugadores pueden jugar simultáneamente
- **Sistema de feedback visual** — Anuncios animados, confetti sutil y efectos bouncy para cada acción del juego
- **Motor de juego puro** — Lógica completamente testeada con Vitest, separada del frontend
- **UI responsiva** — Interfaz adaptativa con Framer Motion para animaciones suaves
- **Reconexión automática** — Si pierdes conexión, puedes reconectar sin perder tu progreso
- **Estados de jugador** — Visualiza desconexiones y reconexiones en tiempo real

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

- `@flip7/shared` — Tipos y schemas Zod para eventos socket
- `@flip7/game-engine` — Motor de juego puro con tests

## Installation

### Requisitos

- [Bun](https://bun.sh) ≥ 1.1
- PostgreSQL (puede ser local, Docker, o Neon/Supabase)

### Desarrollo local

```bash
bun install

# En terminales separadas
bun run dev:server
bun run dev:web
```

Abre http://localhost:5173 en tu navegador.

## Quick Start

1. Abre http://localhost:5173 en tu navegador
2. Crea una sala o únete a una existente con el código de 6 letras
3. Invita a tus amigos (mínimo 3 jugadores para empezar)
4. El host inicia la partida y ¡a jugar!

### Conexión de jugadores

```bash
# Jugador 1: Crea sala
1. Ingresa tu nombre y emoji
2. Click en "Crear sala"
3. Comparte el código con tus amigos

# Jugador 2, 3, N: Únete a sala
1. Ingresa tu nombre y emoji
2. Click en "Unirse"
3. Ingresa el código de 6 letras
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

## Reglas Flip 7

### Objetivo

Ser el primer jugador en alcanzar **200 puntos** a lo largo de múltiples rondas.

### Cartas

| Tipo                         | Descripción                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------- |
| **Numéricas (0-12)**         | El valor de la carta es su cantidad en el mazo (hay doce 12s, once 11s, etc.) |
| **Modificadores (+2 a +10)** | Suman puntos extra al final de la ronda                                       |
| **×2**                       | Duplica los puntos de tus cartas numéricas                                    |
| **Freeze**                   | Congela a un jugador, forzándolo a quedarse                                   |
| **Flip Three**               | Obliga a un jugador a robar 3 cartas seguidas                                 |
| **Second Chance**            | Te salva de un bust si obtienes un duplicado                                  |

### Cómo jugar

1. **En tu turno**: Elige **Hit** (robar otra carta) o **Stay** (asegurar puntos)
2. **Bust**: Si robas una carta con el mismo número que ya tienes, pierdes todo para esa ronda
3. **Flip 7**: Si obtienes 7 cartas numéricas únicas, ganas +15 puntos de bonus y termina la ronda
4. **Gana**: El jugador con más puntos al final de la ronda suma su total. El primero en llegar a 200 gana.

### Condiciones de fin de ronda

- Todos los jugadores activos se plantan o hacen bust
- Un jugador logra Flip 7 (7 cartas numéricas únicas)

### Condiciones de fin de juego

- Al menos un jugador alcanza 200 puntos al final de una ronda
- El jugador con más puntos totales gana

## Smoke Test

1. `bun run dev:server` y `bun run dev:web`
2. Abre dos pestañas en http://localhost:5173
3. Crea sala en una, copia el código, únete desde la otra
4. Inicia partida (mínimo 3 jugadores → puedes abrir más pestañas)

## Variables de entorno

Ver `.env.example`.

| Variable          | Donde  | Descripción                |
| ----------------- | ------ | -------------------------- |
| `PORT`            | server | Puerto HTTP                |
| `CORS_ORIGIN`     | server | Origen permitido (web)     |
| `DATABASE_URL`    | server | Postgres connection string |
| `VITE_SERVER_URL` | web    | URL del Socket.IO server   |

## Despliegue sugerido

- **Web** → Vercel / Netlify (build estático Vite)
- **Server** → Railway / Fly.io (necesita websockets persistentes)
- **Postgres** → Neon / Railway / Supabase

Configura `VITE_SERVER_URL` en el host del web apuntando al server público.

## License

MIT License

## Acknowledgments

- **Flip 7** creado por Eric Olsen y publicado por [The Op Games](https://theopgames.com/)
- **Stack tecnológico**: React, Vite, Tailwind CSS, Zustand, Framer Motion, Socket.IO, Express, Drizzle ORM
- **Fonts**: Bangers y Fredoka de Google Fonts
- **Icons**: Hugeicons
