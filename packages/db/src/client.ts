import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export type DB = ReturnType<typeof drizzle<typeof schema>>;

let _client: postgres.Sql | undefined;
let _db: DB | undefined;

/**
 * Returns a lazily-initialized Drizzle database client.
 * Reads DATABASE_URL from the environment on first call.
 * Does NOT connect at module import time.
 */
export function getDb(): DB {
  if (!_db) {
    const DATABASE_URL = process.env['DATABASE_URL'];
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _client = postgres(DATABASE_URL);
    _db = drizzle(_client, { schema });
  }
  return _db;
}
