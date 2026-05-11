import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@flip7/shared';

const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

let _socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function getSocket(): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> {
  if (!_socket) {
    _socket = io(URL, {
      autoConnect: true,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
    });
  }
  return _socket;
}

export const SERVER_URL = URL;