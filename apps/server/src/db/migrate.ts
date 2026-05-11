import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from './client';

async function main() {
  console.log(process.env.DATABASE_URL);

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

  console.log('migration complete');
}

main().catch(console.error);
