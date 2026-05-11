import { GameEngine } from '@flip7/game-engine';

export interface Room {
  code: string;
  engine: GameEngine;
  socketByPlayer: Map<string, string>; // playerId -> socketId
  playerBySocket: Map<string, string>; // socketId -> playerId
  createdAt: number;
}

const ROOM_TTL_MS = 1000 * 60 * 60 * 4; // 4h

function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  createRoom(): Room {
    let code = genCode();
    while (this.rooms.has(code)) code = genCode();
    const room: Room = {
      code,
      engine: new GameEngine(code),
      socketByPlayer: new Map(),
      playerBySocket: new Map(),
      createdAt: Date.now(),
    };
    this.rooms.set(code, room);
    return room;
  }

  get(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  delete(code: string) {
    this.rooms.delete(code.toUpperCase());
  }

  sweep() {
    const cutoff = Date.now() - ROOM_TTL_MS;
    for (const [code, r] of this.rooms) {
      if (r.createdAt < cutoff && r.socketByPlayer.size === 0)
        this.rooms.delete(code);
    }
  }
}
