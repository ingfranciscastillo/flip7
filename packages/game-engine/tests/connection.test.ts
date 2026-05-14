import { describe, it, expect } from 'vitest';
import { createEngine, getPlayerId } from './utils';

describe('Connection State', () => {
  describe('setConnected', () => {
    it('sets player to disconnected', () => {
      const { engine, playerIds } = createEngine(1);
      const p0 = getPlayerId(playerIds, 0);
      engine.startGame(p0);

      engine.setConnected(p0, false);

      const p = engine.players.find((p) => p.id === p0);
      expect(p?.connected).toBe(false);
    });

    it('sets player to connected', () => {
      const { engine, playerIds } = createEngine(1);
      const p0 = getPlayerId(playerIds, 0);
      engine.startGame(p0);

      engine.setConnected(p0, false);
      engine.setConnected(p0, true);

      const p = engine.players.find((p) => p.id === p0);
      expect(p?.connected).toBe(true);
    });
  });
});
