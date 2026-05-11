import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  roomCode: text('room_code').notNull(),
  winnerId: text('winner_id').notNull(),
  winnerName: text('winner_name').notNull(),
  rounds: integer('rounds').notNull(),
  finalScores: jsonb('final_scores').notNull(),
  endedAt: timestamp('ended_at').notNull().defaultNow(),
});

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
