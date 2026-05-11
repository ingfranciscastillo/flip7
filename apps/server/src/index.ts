import express from 'express';
import http from 'node:http';
import cors from 'cors';
import { Server } from 'socket.io';
import { env } from './env';
import type { ClientToServerEvents, ServerToClientEvents } from '@flip7/shared';
import { registerHandlers } from './sockets/handlers';

const app = express();
app.use(cors({ origin: env.CORS_ORIGIN }));
app.get('/health', (_req, res) => res.json({ ok: true }));

const httpServer = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: env.CORS_ORIGIN, methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  registerHandlers(io, socket);
});

httpServer.listen(env.PORT, () => {
  console.log(`[flip7] server on :${env.PORT}`);
});
