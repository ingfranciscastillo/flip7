import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/engine';
import { TARGET_SCORE } from '../src/rules';

function seedRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

describe('GameEngine basic flow', () => {
  it('rejects start with too few players', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    const r = e.startGame('a');
    expect(r.ok).toBe(false);
  });

  it('starts and assigns first turn', () => {
    const e = new GameEngine('ABCDEF', seedRng(42));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.addPlayer({ id: 'c', name: 'C', emoji: '🐧' });
    expect(e.startGame('a').ok).toBe(true);
    expect(e.phase).toBe('playing');
    expect(e.toRoomState().currentTurnPlayerId).toBe('a');
  });

  it('all players staying ends the round', () => {
    const e = new GameEngine('ABCDEF', seedRng(7));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.addPlayer({ id: 'c', name: 'C', emoji: '🐧' });
    e.startGame('a');
    e.stay('a');
    e.stay('b');
    e.stay('c');
    expect(e.phase).toBe('round_end');
  });
});

describe('addPlayer validation', () => {
  it('rejects addPlayer after game started', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.addPlayer({ id: 'c', name: 'C', emoji: '🐧' });
    e.startGame('a');

    const result = e.addPlayer({ id: 'd', name: 'D', emoji: '🐸' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Game already started');
  });

  it('rejects addPlayer when room is full (8 players)', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    const emojis = ['🦊', '🐼', '🐧', '🐸', '🦁', '🐙', '🦄', '🐲'];
    for (let i = 0; i < 8; i++) {
      e.addPlayer({ id: `p${i}`, name: `Player${i}`, emoji: emojis[i]! });
    }

    const result = e.addPlayer({ id: 'p8', name: 'Player8', emoji: '🐨' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Room full');
  });

  it('allows re-adding same player ID (idempotent)', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    const result = e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    expect(result.ok).toBe(true);
    expect(e.players).toHaveLength(1);
  });
});

describe('removePlayer', () => {
  it('removes player and reassigns host', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.addPlayer({ id: 'c', name: 'C', emoji: '🐧' });

    expect(e.hostId).toBe('a');
    e.removePlayer('a');
    expect(e.hostId).toBe('b');
    expect(e.players).toHaveLength(2);
  });

  it('does not crash when removing non-existent player', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    expect(() => e.removePlayer('nonexistent')).not.toThrow();
  });
});

describe('startGame validation', () => {
  it('rejects start by non-host', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.addPlayer({ id: 'c', name: 'C', emoji: '🐧' });

    const result = e.startGame('b');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Only host can start');
  });

  it('rejects start when already started', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.addPlayer({ id: 'c', name: 'C', emoji: '🐧' });
    e.startGame('a');

    const result = e.startGame('a');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Already started');
  });
});

describe('pendingFlips blocking', () => {
  it('hit is blocked when player has pendingFlips', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.startGame('a');

    e.players[0]!.pendingFlips = 2;
    const events = e.hit('a');
    expect(events).toHaveLength(0);
  });

  it('stay is blocked when player has pendingFlips', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.startGame('a');

    e.players[0]!.pendingFlips = 2;
    const events = e.stay('a');
    expect(events).toHaveLength(0);
  });
});

describe('hit/stay in non-playing phase', () => {
  it('hit does nothing when not in playing phase', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.phase = 'round_end';

    const events = e.hit('a');
    expect(events).toHaveLength(0);
  });

  it('stay does nothing when not in playing phase', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.phase = 'round_end';

    const events = e.stay('a');
    expect(events).toHaveLength(0);
  });
});

describe('hit/stay wrong player', () => {
  it('hit does nothing when called by non-current player', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.addPlayer({ id: 'c', name: 'C', emoji: '🐧' });
    e.startGame('a');

    const events = e.hit('b');
    expect(events).toHaveLength(0);
  });

  it('stay does nothing when called by non-current player', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.addPlayer({ id: 'c', name: 'C', emoji: '🐧' });
    e.startGame('a');

    const events = e.stay('b');
    expect(events).toHaveLength(0);
  });
});

describe('resetGame validation', () => {
  it('rejects reset by non-host', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.startGame('a');

    const result = e.resetGame('b');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Only host can reset');
  });

  it('resetGame clears all state', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.startGame('a');
    e.stay('a');
    e.stay('b');
    e.stay('c');

    e.resetGame('a');

    expect(e.phase).toBe('lobby');
    expect(e.round).toBe(0);
    expect(e.winnerId).toBeNull();
    expect(e.deck).toHaveLength(0);
    expect(e.discard).toHaveLength(0);
  });
});

describe('game end at 200 points', () => {
  it('game_end phase is reachable when scores are high enough', () => {
    const e = new GameEngine('ABCDEF', seedRng(1));
    e.addPlayer({ id: 'a', name: 'A', emoji: '🦊' });
    e.addPlayer({ id: 'b', name: 'B', emoji: '🐼' });
    e.startGame('a');
    e.phase = 'round_end';

    e.players[0]!.totalScore = TARGET_SCORE;
    e.players[1]!.totalScore = TARGET_SCORE - 20;

    const winner = [...e.players].sort(
      (a, b) => b.totalScore - a.totalScore,
    )[0];
    expect(winner!.totalScore).toBeGreaterThanOrEqual(TARGET_SCORE);
    expect(winner!.id).toBe('a');
  });
});
