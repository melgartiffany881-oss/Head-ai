/**
 * Database module — Neon Postgres for serverless compatibility.
 * Auto-initializes tables on first call.
 */

const { neon } = require('@neondatabase/serverless');

let sql = null;
let initialized = false;

async function getDb() {
  if (sql && initialized) return sql;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required for Neon Postgres');
  }

  if (!sql) {
    sql = neon(connectionString);
  }

  if (!initialized) {
    await initTables(sql);
    initialized = true;
  }

  return sql;
}

async function initTables(db) {
  await db`
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
  `;

  await db`
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
  `;

  await db`
    CREATE TABLE IF NOT EXISTS usage_log (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      endpoint TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log('Database tables initialized');
}

module.exports = { getDb };