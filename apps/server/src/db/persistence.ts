import type { RoomState } from '@flip7/shared';

import { db, schema } from './client';

export async function saveMatchIfPossible(state: RoomState) {
  if (!state.winnerId) return;

  const winner = state.players.find((p) => p.id === state.winnerId);

  if (!winner) return;

  const finalScores = Object.fromEntries(state.players.map((p) => [p.id, p.totalScore]));

  try {
    await db.insert(schema.matches).values({
      roomCode: state.code,
      winnerId: state.winnerId,
      winnerName: winner.name,
      rounds: state.round,
      finalScores,
    });
  } catch (err) {
    console.warn('[db] saveMatch failed', err);
  }
}
