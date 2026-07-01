/**
 * Database module — Neon Postgres via `pg` with Neon's HTTP keepalive settings.
 * Falls back to in-memory if PG unavailable.
 */

const { Pool } = require('pg');

let pool = null;
let initialized = false;
let poolFailed = false;

function getPool() {
  if (pool) return pool;
  if (poolFailed) return null;

  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith('postgres')) {
    poolFailed = true;
    return null;
  }

  try {
    pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 8000,
    });
    return pool;
  } catch (e) {
    console.error('PG Pool creation failed:', e.message);
    poolFailed = true;
    return null;
  }
}

// In-memory fallback
const memStore = { users: [], subs: [], usage: [], nextId: 1 };

function memQuery(text, params) {
  const upper = text.trim().toUpperCase();
  if (upper.startsWith('CREATE TABLE')) return [];

  const tableMatch = text.match(/(?:FROM|INTO|UPDATE)\s+(\w+)/i);
  if (!tableMatch) return [];
  const table = tableMatch[1].toLowerCase();
  const store = table === 'users' ? memStore.users : table === 'subscriptions' ? memStore.subs : table === 'usage_log' ? memStore.usage : null;
  if (!store) return [];

  if (upper.startsWith('INSERT')) {
    const colsMatch = text.match(/\(([^)]+)\)\s*VALUES/i);
    const valsMatch = text.match(/VALUES\s*\(([^)]+)\)/i);
    if (colsMatch && valsMatch) {
      const cols = colsMatch[1].split(',').map(c => c.trim().toLowerCase());
      const valRefs = valsMatch[1].split(',').map(v => v.trim());
      const row = { id: memStore.nextId++ };
      cols.forEach((col, i) => {
        const ref = valRefs[i];
        const pm = ref.match(/^\$(\d+)$/);
        row[col] = pm ? params[parseInt(pm[1]) - 1] : ref.replace(/'/g, '');
      });
      store.push(row);
      if (text.includes('RETURNING')) return [row];
      return [{ id: row.id }];
    }
  }

  if (upper.startsWith('SELECT')) {
    let rows = [...store];
    const whereMatch = text.match(/WHERE\s+(.+?)(?:ORDER|GROUP|LIMIT|$)/i);
    if (whereMatch) {
      const condition = whereMatch[1].trim();
      const eqParts = condition.split(/\s*=\s*/);
      if (eqParts.length === 2) {
        const field = eqParts[0].trim().toLowerCase();
        let val = eqParts[1].trim().replace(/^'(.*)'$/, '$1');
        const pm = val.match(/^\$(\d+)$/);
        if (pm) val = params[parseInt(pm[1]) - 1];
        rows = rows.filter(r => String(r[field] || '') === String(val));
      }
    }
    if (text.includes('COUNT(*)')) return [{ count: rows.length }];
    return rows;
  }

  if (upper.startsWith('UPDATE')) {
    const setMatch = text.match(/SET\s+(.+?)(?:WHERE|$)/i);
    if (setMatch) {
      const sets = setMatch[1].split(',').map(s => s.trim());
      const whereMatch = text.match(/WHERE\s+(.+?)$/i);
      let rows = [...store];
      if (whereMatch) {
        const parts = whereMatch[1].trim().split(/\s*=\s*/);
        if (parts.length === 2) {
          let val = parts[1].trim().replace(/^'(.*)'$/, '$1');
          const pm = val.match(/^\$(\d+)$/);
          if (pm) val = params[parseInt(pm[1]) - 1];
          rows = store.filter(r => String(r[parts[0].trim().toLowerCase()] || '') === String(val));
        }
      }
      rows.forEach(row => {
        sets.forEach(set => {
          const parts = set.split(/\s*=\s*/);
          if (parts.length === 2) {
            let val = parts[1].trim();
            const pm = val.match(/^\$(\d+)$/);
            if (pm) val = params[parseInt(pm[1]) - 1];
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            row[parts[0].toLowerCase()] = val;
          }
        });
      });
    }
    return [];
  }

  return [];
}

async function q(text, params = []) {
  const p = getPool();
  if (p) {
    try {
      if (!initialized) {
        await tryInit(p);
        initialized = true;
      }
      const r = await p.query(text, params);
      return r.rows;
    } catch (err) {
      console.error('PG query error:', err.message);
    }
  }
  return memQuery(text, params);
}

async function tryInit(p) {
  await p.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, company TEXT DEFAULT '', role TEXT DEFAULT 'user', subscription_tier TEXT DEFAULT 'starter', subscription_status TEXT DEFAULT 'active', stripe_customer_id TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
  await p.query(`CREATE TABLE IF NOT EXISTS subscriptions (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, stripe_subscription_id TEXT UNIQUE, stripe_customer_id TEXT, tier TEXT NOT NULL DEFAULT 'starter', status TEXT NOT NULL DEFAULT 'active', current_period_start TIMESTAMP, current_period_end TIMESTAMP, created_at TIMESTAMP DEFAULT NOW())`);
  await p.query(`CREATE TABLE IF NOT EXISTS usage_log (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, endpoint TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW())`);
}

module.exports = { q };