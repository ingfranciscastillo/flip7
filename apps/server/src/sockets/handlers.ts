import type { Server, Socket } from 'socket.io';
import { randomUUID } from 'node:crypto';
import type { RoomPhase, RoomState } from '@flip7/shared';
import {
  CardTargetSchema,
  RoomCreateSchema,
  RoomJoinSchema,
  RoomRejoinSchema,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '@flip7/shared';
import type { EngineEvent } from '@flip7/game-engine';
import { RoomManager } from '../rooms/RoomManager';
import { allow, clear } from '../middleware/rateLimit';
import { saveMatchIfPossible } from '../db/persistence';

type IO = Server<ClientToServerEvents, ServerToClientEvents>;
type S = Socket<ClientToServerEvents, ServerToClientEvents>;

const manager = new RoomManager();
setInterval(() => manager.sweep(), 60_000).unref?.();

const turnTimers = new Map<
  string,
  { intervalId: ReturnType<typeof setInterval>; playerId: string }
>();

function startTurnTimer(
  io: IO,
  roomCode: string,
  playerId: string,
  limit: number,
) {
  stopTurnTimer(roomCode);

  let remaining = limit;
  io.to(roomCode).emit('turn:timeupdate', { playerId, remaining });

  const intervalId = setInterval(() => {
    remaining -= 1000;
    io.to(roomCode).emit('turn:timeupdate', { playerId, remaining });

    if (remaining <= 0) {
      clearInterval(intervalId);
      const room = manager.get(roomCode);
      if (room) {
        const state = room.engine.toRoomState();
        if (state.currentTurnPlayerId === playerId) {
          const events = room.engine.stay(playerId);
          emitEngineEvents(io, roomCode, events);
          broadcastState(io, roomCode);
        }
      }
      turnTimers.delete(roomCode);
    }
  }, 1000);

  turnTimers.set(roomCode, { intervalId, playerId });
}

function stopTurnTimer(roomCode: string) {
  const timer = turnTimers.get(roomCode);
  if (timer) {
    clearInterval(timer.intervalId);
    turnTimers.delete(roomCode);
  }
}

function emitEngineEvents(io: IO, code: string, events: EngineEvent[]) {
  let lastCardDealtTime = 0;
  const CARD_DEALT_DELAY = 450;

  for (const ev of events) {
    if (ev.type === 'card_dealt') {
      const now = Date.now();
      if (lastCardDealtTime > 0 && now - lastCardDealtTime < CARD_DEALT_DELAY) {
        const waitTime = CARD_DEALT_DELAY - (now - lastCardDealtTime);
        const waitUntil = now + waitTime;
        while (Date.now() < waitUntil) {
          // busy wait - simple delay
        }
      }
      lastCardDealtTime = Date.now();
    }

    switch (ev.type) {
      case 'card_dealt':
        io.to(code).emit('card:dealt', {
          playerId: ev.playerId,
          card: ev.card,
        });
        break;
      case 'busted':
        io.to(code).emit('player:busted', ev.playerId);
        break;
      case 'stayed':
        io.to(code).emit('player:stayed', ev.playerId);
        break;
      case 'frozen':
        io.to(code).emit('player:frozen', ev.playerId);
        break;
      case 'flip7':
        io.to(code).emit('player:flip7', ev.playerId);
        break;
      case 'turn_changed':
        io.to(code).emit('turn:changed', ev.playerId);
        const turnRoom = manager.get(code);
        if (turnRoom) {
          const limit = turnRoom.engine.config.turnTimeLimit;
          if (limit > 0) {
            startTurnTimer(io, code, ev.playerId, limit);
          }
        }
        break;
      case 'round_ended':
        io.to(code).emit('round:ended', { round: ev.round, scores: ev.scores });
        break;
      case 'game_ended':
        io.to(code).emit('game:ended', ev.winnerId);
        break;
      case 'pending_target':
        io.to(code).emit('card:target-required', {
          sourcePlayerId: ev.sourcePlayerId,
          cardId: ev.cardId,
          action: ev.action,
        });
        break;
    }
  }
}

function broadcastState(io: IO, code: string) {
  const room = manager.get(code);
  if (!room) return;
  io.to(code).emit('room:state', room.engine.toRoomState());
}

export function registerHandlers(io: IO, socket: S) {
  let currentRoom: string | null = null;
  let currentPlayer: string | null = null;

  const guard = () => allow(socket.id);

  socket.on('room:create', (raw, ack) => {
    if (!guard()) return ack({ ok: false, error: 'rate_limited' });
    const parsed = RoomCreateSchema.safeParse(raw);
    if (!parsed.success) return ack({ ok: false, error: 'invalid_payload' });
    const room = manager.createRoom();
    const playerId = randomUUID();
    room.engine.addPlayer({ id: playerId, ...parsed.data });
    room.socketByPlayer.set(playerId, socket.id);
    room.playerBySocket.set(socket.id, playerId);
    socket.join(room.code);
    currentRoom = room.code;
    currentPlayer = playerId;
    ack({ ok: true, roomCode: room.code, playerId });
    broadcastState(io, room.code);
  });

  socket.on('room:join', (raw, ack) => {
    if (!guard()) return ack({ ok: false, error: 'rate_limited' });
    const parsed = RoomJoinSchema.safeParse(raw);
    if (!parsed.success) return ack({ ok: false, error: 'invalid_payload' });
    const room = manager.get(parsed.data.code);
    if (!room) return ack({ ok: false, error: 'room_not_found' });
    const playerId = randomUUID();
    const r = room.engine.addPlayer({
      id: playerId,
      name: parsed.data.name,
      emoji: parsed.data.emoji,
    });
    if (!r.ok) return ack({ ok: false, error: r.error ?? 'join_failed' });
    room.socketByPlayer.set(playerId, socket.id);
    room.playerBySocket.set(socket.id, playerId);
    socket.join(room.code);
    currentRoom = room.code;
    currentPlayer = playerId;
    ack({ ok: true, playerId });
    io.to(room.code).emit('player:joined', playerId);
    broadcastState(io, room.code);
  });

  socket.on('room:rejoin', (raw, ack) => {
    if (!guard()) return ack({ ok: false, error: 'rate_limited' });
    const parsed = RoomRejoinSchema.safeParse(raw);
    if (!parsed.success) return ack({ ok: false, error: 'invalid_payload' });
    const room = manager.get(parsed.data.code);
    if (!room) return ack({ ok: false, error: 'room_not_found' });
    const player = room.engine.players.find(
      (p) => p.id === parsed.data.playerId,
    );
    if (!player) return ack({ ok: false, error: 'player_not_found' });
    // swap socket
    const oldSocketId = room.socketByPlayer.get(player.id);
    if (oldSocketId) room.playerBySocket.delete(oldSocketId);
    room.socketByPlayer.set(player.id, socket.id);
    room.playerBySocket.set(socket.id, player.id);
    socket.join(room.code);
    currentRoom = room.code;
    currentPlayer = player.id;
    room.engine.setConnected(player.id, true);
    io.to(room.code).emit('player:reconnected', player.id);
    ack({ ok: true });
    broadcastState(io, room.code);
  });

  socket.on('room:leave', () => {
    if (!currentRoom || !currentPlayer) return;

    const roomCode = currentRoom;

    const room = manager.get(roomCode);
    if (!room) return;

    room.engine.removePlayer(currentPlayer);
    room.socketByPlayer.delete(currentPlayer);
    room.playerBySocket.delete(socket.id);

    socket.leave(roomCode);

    if (room.engine.players.length === 0) {
      setTimeout(() => {
        const r = manager.get(roomCode);
        if (r && r.engine.players.length === 0) {
          manager.delete(roomCode);
        }
      }, 60_000);
    } else {
      broadcastState(io, roomCode);
    }

    currentRoom = null;
    currentPlayer = null;
  });

  socket.on(
    'game:start',
    (config?: {
      rounds?: number;
      turnTimeLimit?: number;
      deckCount?: number;
    }) => {
      if (!guard() || !currentRoom || !currentPlayer) return;
      const room = manager.get(currentRoom);
      if (!room) return;

      stopTurnTimer(currentRoom);

      if (room.engine.phase === 'round_end') {
        const events = room.engine.nextRound(currentPlayer);
        emitEngineEvents(io, currentRoom, events);
        broadcastState(io, currentRoom);
        return;
      }

      if (config) {
        room.engine.setConfig(config);
      }

      const r = room.engine.startGame(currentPlayer);
      if (!r.ok)
        return socket.emit('error', {
          code: 'start_failed',
          message: r.error ?? 'failed',
        });
      io.to(currentRoom).emit('game:started');
      const cur = room.engine.toRoomState().currentTurnPlayerId;
      if (cur) {
        io.to(currentRoom).emit('turn:changed', cur);
        const limit = room.engine.config.turnTimeLimit;
        if (limit > 0) {
          startTurnTimer(io, currentRoom, cur, limit);
        }
      }
      broadcastState(io, currentRoom);
    },
  );

  socket.on('game:reset', () => {
    if (!guard() || !currentRoom || !currentPlayer) return;
    const room = manager.get(currentRoom);
    if (!room) return;
    stopTurnTimer(currentRoom);
    room.engine.resetGame(currentPlayer);
    io.to(currentRoom).emit('game:reset');
    broadcastState(io, currentRoom);
  });

  socket.on('turn:hit', () => {
    if (!guard() || !currentRoom || !currentPlayer) return;
    const room = manager.get(currentRoom);
    if (!room) return;
    stopTurnTimer(currentRoom);
    const events = room.engine.hit(currentPlayer);
    emitEngineEvents(io, currentRoom, events);
    broadcastState(io, currentRoom);
    maybePersistEnd(room);
  });

  socket.on('turn:stay', () => {
    if (!guard() || !currentRoom || !currentPlayer) return;
    const room = manager.get(currentRoom);
    if (!room) return;
    stopTurnTimer(currentRoom);
    const events = room.engine.stay(currentPlayer);
    emitEngineEvents(io, currentRoom, events);
    broadcastState(io, currentRoom);
    maybePersistEnd(room);
  });

  socket.on('card:target', (raw) => {
    if (!guard() || !currentRoom || !currentPlayer) return;
    const parsed = CardTargetSchema.safeParse(raw);
    if (!parsed.success) return;
    const room = manager.get(currentRoom);
    if (!room) return;
    stopTurnTimer(currentRoom);
    const events = room.engine.applyTarget(
      currentPlayer,
      parsed.data.cardId,
      parsed.data.targetPlayerId,
    );
    emitEngineEvents(io, currentRoom, events);
    broadcastState(io, currentRoom);
    maybePersistEnd(room);
  });

  socket.on('chat:message', (raw, ack) => {
    if (!guard() || !currentRoom || !currentPlayer) {
      ack?.({ ok: false, error: 'Not in a room' });
      return;
    }
    if (!raw.message || raw.message.length > 200) {
      ack?.({ ok: false, error: 'Invalid message' });
      return;
    }
    const room = manager.get(currentRoom);
    if (!room) {
      ack?.({ ok: false, error: 'Room not found' });
      return;
    }
    const player = room.engine.players.find((p) => p.id === currentPlayer);
    if (!player) {
      ack?.({ ok: false, error: 'Player not found' });
      return;
    }
    io.to(currentRoom).emit('chat:message', {
      playerId: currentPlayer,
      playerName: player.name,
      emoji: player.emoji,
      message: raw.message.trim(),
      timestamp: Date.now(),
    });
    ack?.({ ok: true });
  });

  socket.on('chat:typing', () => {
    if (!currentRoom || !currentPlayer) return;
    socket.to(currentRoom).emit('chat:typing', currentPlayer);
  });

  socket.on('disconnect', () => {
    clear(socket.id);

    if (!currentRoom || !currentPlayer) return;

    const room = manager.get(currentRoom);
    if (!room) return;

    room.engine.setConnected(currentPlayer, false);
    room.playerBySocket.delete(socket.id);

    io.to(currentRoom).emit('player:disconnected', currentPlayer);
    broadcastState(io, currentRoom);

    const anyoneOnline = room.engine.players.some((p) => p.connected);

    if (!anyoneOnline) {
      const roomCode = currentRoom!;
      setTimeout(() => {
        const r = manager.get(roomCode);
        if (r && !r.engine.players.some((p) => p.connected)) {
          manager.delete(roomCode);
        }
      }, 60_000);
    }
  });
}

function maybePersistEnd(room: {
  code: string;
  engine: { phase: RoomPhase; toRoomState: () => RoomState };
}) {
  if (room.engine.phase === 'game_end') {
    void saveMatchIfPossible(room.engine.toRoomState());
  }
}
