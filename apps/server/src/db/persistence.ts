import type { RoomState } from '@flip7/shared';
import { getDb, schema } from './client';

export async function saveMatchIfPossible(state: RoomState) {
  const db = getDb();
  if (!db) return;
  if (!state.winnerId) return;
  const winner = state.players.find((p) => p.id === state.winnerId);
  if (!winner) return;
  const finalScores = Object.fromEntries(state.players.map((p) => [p.name, p.totalScore]));
  try {
    await db.insert(schema.matches).values({
      roomCode: state.code,
      winnerId: state.winnerId,
      winnerName: winner.name,
      rounds: state.round,
      finalScores,
    });
  } catch (err) {
    // non-fatal
    console.warn('[db] saveMatch failed', err);
  }
}
