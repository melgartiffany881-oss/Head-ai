/**
 * Database module — Postgres via `pg` pool
 * Compatible with Vercel serverless functions.
 * Uses DATABASE_URL env var (Neon or any Postgres connection string).
 */

const { Pool } = require('pg');

let pool = null;
let initialized = false;

async function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 1 });
  }
  return pool;
}

/**
 * Execute a query. Usage: const rows = await q('SELECT * FROM users WHERE email = $1', [email]);
 * Returns the rows array (not the full result object).
 */
async function q(text, params = []) {
  const p = await getPool();
  if (!initialized) {
    await initTables(p);
    initialized = true;
  }
  const result = await p.query(text, params);
  return result.rows;
}

async function initTables(p) {
  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT DEFAULT '',
      role TEXT DEFAULT 'user',
      subscription_tier TEXT DEFAULT 'starter',
      subscription_status TEXT DEFAULT 'active',
      stripe_customer_id TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await p.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      stripe_subscription_id TEXT UNIQUE,
      stripe_customer_id TEXT,
      tier TEXT NOT NULL DEFAULT 'starter',
      status TEXT NOT NULL DEFAULT 'active',
      current_period_start TIMESTAMP,
      current_period_end TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await p.query(`
    CREATE TABLE IF NOT EXISTS usage_log (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      endpoint TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Database tables initialized');
}

module.exports = { q };