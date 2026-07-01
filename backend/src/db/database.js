/**
 * Database module — In-memory store with Neon Postgres fallback.
 * Uses pg for Postgres if DATABASE_URL is set, otherwise falls back to in-memory.
 */

const pgPool = tryRequirePg();

function tryRequirePg() {
  try {
    const { Pool } = require('pg');
    const url = process.env.DATABASE_URL;
    if (url && url.startsWith('postgres')) {
      return new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 1, connectionTimeoutMillis: 5000 });
    }
  } catch (e) { /* pg not available */ }
  return null;
}

// In-memory fallback store
const memStore = {
  users: [],
  subs: [],
  usage: [],
  nextId: 1,
};

async function q(text, params = []) {
  // If pg pool available, use it
  if (pgPool) {
    try {
      if (!pgPool._initialized) {
        await initPgTables();
        pgPool._initialized = true;
      }
      const result = await pgPool.query(text, params);
      return result.rows;
    } catch (err) {
      console.error('PG Error:', err.message);
      // Fall through to in-memory
    }
  }

  // In-memory implementation
  return memQuery(text, params);
}

async function initPgTables() {
  await pgPool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, company TEXT DEFAULT '', role TEXT DEFAULT 'user', subscription_tier TEXT DEFAULT 'starter', subscription_status TEXT DEFAULT 'active', stripe_customer_id TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
  await pgPool.query(`CREATE TABLE IF NOT EXISTS subscriptions (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, stripe_subscription_id TEXT UNIQUE, stripe_customer_id TEXT, tier TEXT NOT NULL DEFAULT 'starter', status TEXT NOT NULL DEFAULT 'active', current_period_start TIMESTAMP, current_period_end TIMESTAMP, created_at TIMESTAMP DEFAULT NOW())`);
  await pgPool.query(`CREATE TABLE IF NOT EXISTS usage_log (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, endpoint TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW())`);
}

// Simple in-memory SQL-like query parser
function memQuery(text, params) {
  const upper = text.trim().toUpperCase();

  if (upper.startsWith('SELECT')) {
    return memSelect(text, params);
  } else if (upper.startsWith('INSERT')) {
    return memInsert(text, params);
  } else if (upper.startsWith('UPDATE')) {
    return memUpdate(text, params);
  } else if (upper.startsWith('CREATE TABLE')) {
    return []; // no-op
  }
  return [];
}

function memSelect(text, params) {
  const fromMatch = text.match(/FROM\s+(\w+)/i);
  if (!fromMatch) return [];
  const table = fromMatch[1].toLowerCase();

  let rows = [];
  if (table === 'users') rows = memStore.users;
  else if (table === 'subscriptions') rows = memStore.subs;
  else if (table === 'usage_log') rows = memStore.usage;
  else return [];

  // Handle WHERE
  const whereMatch = text.match(/WHERE\s+(.+?)(?:ORDER|GROUP|LIMIT|$)/i);
  if (whereMatch) {
    const condition = whereMatch[1].trim();
    rows = rows.filter(row => {
      const parts = condition.split(/\s*=\s*/);
      if (parts.length === 2) {
        const field = parts[0].trim().toLowerCase();
        let val = parts[1].trim();
        // Handle $1, $2 params
        const paramMatch = val.match(/^\$(\d+)$/);
        if (paramMatch) val = params[parseInt(paramMatch[1]) - 1];
        // Handle string quotes
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        return String(row[field] || '') === String(val);
      }
      return true;
    });
  }

  // Handle COUNT(*)
  if (text.includes('COUNT(*)')) {
    return [{ count: rows.length }];
  }

  return rows;
}

function memInsert(text, params) {
  const intoMatch = text.match(/INTO\s+(\w+)/i);
  if (!intoMatch) return [];
  const table = intoMatch[1].toLowerCase();

  const colsMatch = text.match(/\(([^)]+)\)\s*VALUES/i);
  const valsMatch = text.match(/VALUES\s*\(([^)]+)\)/i);

  if (!colsMatch || !valsMatch) return [];

  const cols = colsMatch[1].split(',').map(c => c.trim().toLowerCase());
  const valRefs = valsMatch[1].split(',').map(v => v.trim());

  const row = { id: memStore.nextId++ };
  cols.forEach((col, i) => {
    const ref = valRefs[i];
    const paramMatch = ref.match(/^\$(\d+)$/);
    row[col] = paramMatch ? params[parseInt(paramMatch[1]) - 1] : ref.replace(/'/g, '');
  });

  memStore[table].push(row);

  // RETURNING support
  const returningMatch = text.match(/RETURNING\s+(.+)/i);
  if (returningMatch) {
    const fields = returningMatch[1].split(',').map(f => f.trim());
    const result = {};
    fields.forEach(f => { result[f] = row[f]; });
    return [result];
  }

  return [row];
}

function memUpdate(text, params) {
  const tableMatch = text.match(/UPDATE\s+(\w+)/i);
  if (!tableMatch) return [];
  const table = tableMatch[1].toLowerCase();
  let rows = memStore[table] || [];

  const setMatch = text.match(/SET\s+(.+?)(?:WHERE|$)/i);
  if (setMatch) {
    const sets = setMatch[1].split(',').map(s => s.trim());
    rows.forEach(row => {
      sets.forEach(set => {
        const parts = set.split(/\s*=\s*/);
        if (parts.length === 2) {
          let val = parts[1].trim();
          const paramMatch = val.match(/^\$(\d+)$/);
          if (paramMatch) val = params[parseInt(paramMatch[1]) - 1];
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          row[parts[0].toLowerCase()] = val;
        }
      });
    });
  }

  return [];
}

module.exports = { q };