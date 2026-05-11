import { sql } from 'drizzle-orm';
import { getDb } from './client';

async function main() {
  const db = getDb();
  if (!db) {
    console.log('[migrate] no DATABASE_URL, skipping');
    return;
  }
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      room_code TEXT NOT NULL,
      winner_id TEXT NOT NULL,
      winner_name TEXT NOT NULL,
      rounds INTEGER NOT NULL,
      final_scores JSONB NOT NULL,
      ended_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  console.log('[migrate] ok');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
