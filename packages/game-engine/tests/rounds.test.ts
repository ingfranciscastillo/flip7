import { describe, it, expect } from 'vitest';
import { createEngine, getPlayerId } from './utils';

describe('Round Transitions', () => {
  describe('nextRound', () => {
    it('only host can start next round', () => {
      const { engine, playerIds } = createEngine(1);
      const p0 = getPlayerId(playerIds, 0);
      const p1 = getPlayerId(playerIds, 1);
      engine.startGame(p0);

      engine.stay(p0);
      engine.stay(p1);
      engine.stay(playerIds[2]!);

      const events = engine.nextRound(p1);
      expect(events).toHaveLength(0);
      expect(engine.phase).toBe('round_end');
    });

    it('only works in round_end phase', () => {
      const { engine, playerIds } = createEngine(1);
      const p0 = getPlayerId(playerIds, 0);
      engine.startGame(p0);

      const events = engine.nextRound(p0);
      expect(events).toHaveLength(0);
      expect(engine.phase).toBe('playing');
    });

    it('increments round number', () => {
      const { engine, playerIds } = createEngine(1);
      const p0 = getPlayerId(playerIds, 0);
      const p1 = getPlayerId(playerIds, 1);
      engine.startGame(p0);

      engine.stay(p0);
      engine.stay(p1);
      engine.stay(playerIds[2]!);

      expect(engine.round).toBe(1);
      engine.nextRound(p0);
      expect(engine.round).toBe(2);
    });
  });

  describe('resetGame', () => {
    it('only host can reset', () => {
      const { engine, playerIds } = createEngine(1);
      const p0 = getPlayerId(playerIds, 0);
      const p1 = getPlayerId(playerIds, 1);
      engine.startGame(p0);

      const result = engine.resetGame(p1);
      expect(result.ok).toBe(false);
    });

    it('returns to lobby phase', () => {
      const { engine, playerIds } = createEngine(1);
      const p0 = getPlayerId(playerIds, 0);
      const p1 = getPlayerId(playerIds, 1);
      engine.startGame(p0);

      engine.stay(p0);
      engine.stay(p1);
      engine.stay(playerIds[2]!);

      engine.resetGame(p0);

      expect(engine.phase).toBe('lobby');
    });

    it('clears winner and scores', () => {
      const { engine, playerIds } = createEngine(1);
      const p0 = getPlayerId(playerIds, 0);
      const p1 = getPlayerId(playerIds, 1);
      engine.startGame(p0);

      engine.stay(p0);
      engine.stay(p1);
      engine.stay(playerIds[2]!);

      engine.resetGame(p0);

      expect(engine.winnerId).toBeNull();
      const p = engine.players.find((p) => p.id === p0);
      expect(p?.totalScore).toBe(0);
    });

    it('clears pendingTarget', () => {
      const { engine, playerIds } = createEngine(1);
      const p0 = getPlayerId(playerIds, 0);
      engine.startGame(p0);

      engine.pendingTarget = {
        sourcePlayerId: p0,
        cardId: 'test',
        action: 'freeze',
      };

      engine.resetGame(p0);

      expect(engine.pendingTarget).toBeNull();
    });
  });
});
