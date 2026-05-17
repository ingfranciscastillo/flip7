import { create } from 'zustand';
import type { RoomState } from '@flip7/shared';

interface IdentityState {
  playerId: string | null;
  roomCode: string | null;
  name: string;
  emoji: string;
  setIdentity: (i: { playerId: string; roomCode: string }) => void;
  clearIdentity: () => void;
  setProfile: (p: { name: string; emoji: string }) => void;
}

const STORAGE_KEY = 'flip7_identity';
const PROFILE_KEY = 'flip7_profile';

function loadIdentity(): { playerId: string | null; roomCode: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { playerId: null, roomCode: null };
    return JSON.parse(raw) as {
      playerId: string | null;
      roomCode: string | null;
    };
  } catch {
    return { playerId: null, roomCode: null };
  }
}

function loadProfile(): { name: string; emoji: string } {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { name: '', emoji: '🦊' };
    return JSON.parse(raw) as { name: string; emoji: string };
  } catch {
    return { name: '', emoji: '🦊' };
  }
}

export const useIdentity = create<IdentityState>((set) => ({
  ...loadIdentity(),
  ...loadProfile(),
  setIdentity: (i) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(i));
    set({ playerId: i.playerId, roomCode: i.roomCode });
  },
  clearIdentity: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ playerId: null, roomCode: null });
  },
  setProfile: (p) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    set({ name: p.name, emoji: p.emoji });
  },
}));

interface GameState {
  room: RoomState | null;
  setRoom: (r: RoomState | null) => void;
  lastDealtCardId: string | null;
  setLastDealt: (id: string | null) => void;
  lastDealtCard: { id: string; playerId: string } | null;
  setLastDealtCard: (card: { id: string; playerId: string } | null) => void;
  turnTimeRemaining: number;
  setTurnTimeRemaining: (remaining: number) => void;
}

export const useGame = create<GameState>((set) => ({
  room: null,
  setRoom: (r) => set({ room: r }),
  lastDealtCardId: null,
  setLastDealt: (id) => set({ lastDealtCardId: id }),
  lastDealtCard: null,
  setLastDealtCard: (card) => set({ lastDealtCard: card }),
  turnTimeRemaining: 0,
  setTurnTimeRemaining: (remaining) => set({ turnTimeRemaining: remaining }),
}));
