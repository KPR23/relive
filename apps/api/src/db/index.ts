import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { env } from '../env.server.js';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool);
