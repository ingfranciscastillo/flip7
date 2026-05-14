import { describe, it, expect } from 'vitest';
import { createEngine, getPlayerId, forceDeck, findEventByType } from './utils';
import type { Card } from '@flip7/shared';

const actionCard = (action: 'freeze' | 'flip3', id = `a_${action}`): Card => ({
  kind: 'action',
  action,
  id,
});

const numberCard = (value: number, id = `n_${value}`): Card => ({
  kind: 'number',
  value,
  id,
});

describe('applyTarget', () => {
  it('does nothing if no pendingTarget', () => {
    const { engine, playerIds } = createEngine(1);
    const p0 = getPlayerId(playerIds, 0);
    engine.startGame(p0);

    const events = engine.applyTarget(p0, 'any_card', playerIds[1]!);
    expect(events).toHaveLength(0);
  });

  it('does nothing if source player mismatch', () => {
    const { engine, playerIds } = createEngine(1);
    const p0 = getPlayerId(playerIds, 0);
    engine.startGame(p0);

    forceDeck(engine, [
      actionCard('freeze', 'freeze1'),
      numberCard(1),
      numberCard(1),
    ]);
    engine.hit(p0);

    const events = engine.applyTarget('wrong_player', 'freeze1', playerIds[1]!);
    expect(events).toHaveLength(0);
    expect(engine.pendingTarget).not.toBeNull();
  });

  it('does nothing if cardId mismatch', () => {
    const { engine, playerIds } = createEngine(1);
    const p0 = getPlayerId(playerIds, 0);
    engine.startGame(p0);

    forceDeck(engine, [
      actionCard('freeze', 'freeze1'),
      numberCard(1),
      numberCard(1),
    ]);
    engine.hit(p0);

    const events = engine.applyTarget(p0, 'wrong_card', playerIds[1]!);
    expect(events).toHaveLength(0);
  });

  it('does nothing if target player not found', () => {
    const { engine, playerIds } = createEngine(1);
    const p0 = getPlayerId(playerIds, 0);
    engine.startGame(p0);

    forceDeck(engine, [
      actionCard('freeze', 'freeze1'),
      numberCard(1),
      numberCard(1),
    ]);
    engine.hit(p0);

    const events = engine.applyTarget(p0, 'freeze1', 'nonexistent');
    expect(events).toHaveLength(0);
  });

  it('freezes target player and clears pendingTarget', () => {
    const { engine, playerIds } = createEngine(1);
    const p0 = getPlayerId(playerIds, 0);
    const p1 = getPlayerId(playerIds, 1);
    engine.startGame(p0);

    forceDeck(engine, [
      actionCard('freeze', 'freeze1'),
      numberCard(1),
      numberCard(1),
    ]);
    engine.hit(p0);
    expect(engine.pendingTarget).not.toBeNull();

    const events = engine.applyTarget(p0, 'freeze1', p1);

    expect(engine.pendingTarget).toBeNull();
    const targetP = engine.players.find((p) => p.id === p1);
    expect(targetP?.status).toBe('frozen');
  });
});
