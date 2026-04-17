import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/lib/db/schema';

const createDatabase = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured.');
  }

  return drizzle({
    client: neon(databaseUrl),
    schema,
  });
};

let database: ReturnType<typeof createDatabase> | null = null;

export const getDb = () => {
  if (database) {
    return database;
  }

  database = createDatabase();
  return database;
};
