import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from '../env';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!env.DATABASE_URL) return null;
  if (!_db) {
    _client = postgres(env.DATABASE_URL, { max: 5 });
    _db = drizzle(_client, { schema });
  }
  return _db;
}

export { schema };
