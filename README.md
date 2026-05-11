# Flip 7 Online

Multijugador en tiempo real del juego de cartas **Flip 7** con monorepo TypeScript: web (React + Vite), server (Node + Socket.IO) y motor de juego puro testeado.

> ⚠️ El preview de Lovable no puede ejecutar el servidor Socket.IO (necesita Node persistente). Levanta el stack en local con Docker o despliega `apps/server` en Railway/Fly.

## Estructura

```
flip7/
├── apps/
│   ├── web/        # React + Vite + Tailwind + Zustand + Framer Motion
│   └── server/     # Express + Socket.IO + Drizzle (Postgres)
├── packages/
│   ├── shared/     # Tipos + schemas Zod de eventos socket
│   └── game-engine # Motor Flip 7 puro + tests Vitest
└── docker-compose.yml
```

## Requisitos

- [Bun](https://bun.sh) ≥ 1.1
- Docker + Docker Compose (para Postgres + el stack completo)
- Node 20+ recomendado para el server fuera de Docker

## Inicio rápido (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- Web: http://localhost:5173
- Server: http://localhost:4000
- Postgres: localhost:5432 (`flip7` / `flip7`)

## Desarrollo local

```bash
bun install

# Postgres en docker
docker compose up postgres -d

# En terminales separadas
bun run dev:server
bun run dev:web
```

## Tests del motor

```bash
bun run test
```

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

## Reglas Flip 7 (resumen)

- 3–8 jugadores. Primer jugador en alcanzar 200 puntos gana.
- Cartas numéricas 0–12 (cantidad = valor, salvo 0 que es 1).
- Modificadores: `+2 +4 +6 +8 +10` y `×2`.
- Acciones: `Freeze`, `Flip Three`, `Second Chance`.
- En tu turno: **Hit** (otra carta) o **Stay** (asegurar puntos).
- **Bust** si repites un número en tu mano (a menos que tengas Second Chance).
- **Flip 7**: 7 números únicos en una mano = +15 bonus y termina la ronda.

## Smoke test

1. `docker compose up`
2. Abre dos pestañas en http://localhost:5173
3. Crea sala en una, copia el código, únete desde la otra
4. Inicia partida (mínimo 3 jugadores → puedes abrir más pestañas)
