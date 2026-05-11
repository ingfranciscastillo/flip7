FROM oven/bun:1 AS deps

WORKDIR /app

COPY package.json bun.lockb* bun.lock* ./tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/game-engine/package.json ./packages/game-engine/package.json
COPY apps/server/package.json ./apps/server/package.json

RUN bun install --frozen-lockfile

FROM oven/bun:1 AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY packages ./packages
COPY apps ./apps

WORKDIR /app/apps/server
RUN bun run build

FROM oven/bun:1 AS runtime

RUN adduser --disabled-password --gecos "" flip7

WORKDIR /app/apps/server

COPY --from=build --chown=flip7 /app/apps/server/dist ./dist
COPY --from=build --chown=flip7 /app/apps/server/package.json ./
COPY --from=deps --chown=flip7 /app/node_modules ./node_modules

USER flip7

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --spider -q http://localhost:4000/health || exit 1

CMD ["bun", "run", "start"]