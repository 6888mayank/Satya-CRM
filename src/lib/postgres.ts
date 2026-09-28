import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPostgresPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
  }

  return pool;
}

export async function checkPostgresHealth(): Promise<{ connected: boolean; version?: string; error?: string }> {
  const p = getPostgresPool();
  if (!p) {
    return { connected: false, error: 'DATABASE_URL environment variable is not set.' };
  }

  try {
    const res = await p.query('SELECT version(), current_database(), current_user;');
    return {
      connected: true,
      version: res.rows[0]?.version || 'PostgreSQL'
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err?.message || 'Failed to connect to Render PostgreSQL'
    };
  }
}
