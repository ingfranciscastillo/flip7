import { GameEngine } from '../src/engine';
import type { Card } from '@flip7/shared';

export function seedRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function createEngine(
  seed = 42,
  playerCount = 3,
): {
  engine: GameEngine;
  playerIds: string[];
} {
  const engine = new GameEngine('TEST', seedRng(seed));
  const playerIds: string[] = [];
  const emojis = ['🦊', '🐼', '🐧', '🐸', '🦁', '🐙', '🦄', '🐲'];

  for (let i = 0; i < playerCount; i++) {
    const id = `p${i}`;
    playerIds.push(id);
    engine.addPlayer({ id, name: `Player${i}`, emoji: emojis[i] ?? '🦊' });
  }

  return { engine, playerIds };
}

export function getPlayerId(playerIds: string[], index: number): string {
  const id = playerIds[index];
  if (!id) throw new Error(`Player index ${index} not found`);
  return id;
}

export function forceDeck(engine: GameEngine, cards: Card[]): void {
  engine.deck = [...cards].reverse();
  engine.discard = [];
}

export function forceDraw(engine: GameEngine, count: number): Card[] {
  const drawn: Card[] = [];
  for (let i = 0; i < count; i++) {
    const card = engine.deck.pop();
    if (card) drawn.push(card);
  }
  return drawn;
}

export type EngineEventWithPlayerId =
  | { type: 'card_dealt'; playerId: string; card: Card }
  | { type: 'busted'; playerId: string }
  | { type: 'stayed'; playerId: string }
  | { type: 'frozen'; playerId: string }
  | { type: 'flip7'; playerId: string }
  | { type: 'turn_changed'; playerId: string }
  | { type: 'round_ended'; round: number; scores: Record<string, number> }
  | { type: 'game_ended'; winnerId: string }
  | {
      type: 'pending_target';
      sourcePlayerId: string;
      cardId: string;
      action: 'freeze' | 'flip3';
    };

export function findEventByType(
  events: EngineEventWithPlayerId[],
  type: string,
): EngineEventWithPlayerId | undefined {
  return events.find((e) => e.type === type) as
    | EngineEventWithPlayerId
    | undefined;
}

export function hasEventType(
  events: EngineEventWithPlayerId[],
  type: string,
): boolean {
  return events.some((e) => e.type === type);
}
