/**
 * Database module — Neon HTTP driver (no WebSocket needed) with in-memory fallback.
 * Uses @neondatabase/serverless with WebSocket disabled (HTTP mode).
 */

let neonSql = null;
let pgPool = null;
let pgFailed = false;

// Try Neon HTTP driver first
try {
  const { neon } = require('@neondatabase/serverless');
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith('postgres')) {
    neonSql = neon(url);
  }
} catch (e) { /* Neon not available */ }

// Fallback: try pg pool
if (!neonSql) {
  try {
    const { Pool } = require('pg');
    const url = process.env.DATABASE_URL;
    if (url && url.startsWith('postgres')) {
      pgPool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 1, connectionTimeoutMillis: 5000 });
    }
  } catch (e) { /* pg not available */ }
}

// In-memory fallback store (per-request, won't persist across serverless calls)
const memStore = { users: [], subs: [], usage: [], nextId: 1 };
let tablesCreated = false;

async function createTables(db) {
  if (tablesCreated) return;
  await db`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, company TEXT DEFAULT '', role TEXT DEFAULT 'user', subscription_tier TEXT DEFAULT 'starter', subscription_status TEXT DEFAULT 'active', stripe_customer_id TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`;
  await db`CREATE TABLE IF NOT EXISTS subscriptions (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, stripe_subscription_id TEXT UNIQUE, stripe_customer_id TEXT, tier TEXT NOT NULL DEFAULT 'starter', status TEXT NOT NULL DEFAULT 'active', current_period_start TIMESTAMP, current_period_end TIMESTAMP, created_at TIMESTAMP DEFAULT NOW())`;
  await db`CREATE TABLE IF NOT EXISTS usage_log (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL, endpoint TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW())`;
  tablesCreated = true;
}

async function q(text, params = []) {
  // Try Neon HTTP driver first (works on Vercel)
  if (neonSql) {
    try {
      if (!tablesCreated) await createTables(neonSql);
      return await neonSql(text, ...params);
    } catch (err) {
      console.error('Neon error:', err.message);
    }
  }

  // Try pg pool fallback
  if (pgPool) {
    try {
      if (!tablesCreated) {
        await pgPool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, company TEXT DEFAULT '', role TEXT DEFAULT 'user', subscription_tier TEXT DEFAULT 'starter', subscription_status TEXT DEFAULT 'active', stripe_customer_id TEXT, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
        tablesCreated = true;
      }
      const r = await pgPool.query(text, params);
      return r.rows;
    } catch (err) {
      console.error('PG error:', err.message);
    }
  }

  // In-memory fallback
  return memQuery(text, params);
}

function memQuery(text, params) {
  const upper = text.trim().toUpperCase();
  if (upper.startsWith('CREATE TABLE')) return [];

  const tableMatch = text.match(/(?:FROM|INTO|UPDATE|TABLE\s+(\w+))/i);
  const table = tableMatch?.[1]?.toLowerCase() || '';
  const store = table === 'users' ? memStore.users : table === 'subscriptions' ? memStore.subs : table === 'usage_log' ? memStore.usage : null;
  if (!store && !upper.startsWith('INSERT') && !upper.startsWith('UPDATE')) return [];

  if (upper.startsWith('INSERT') && store) {
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
      return text.includes('RETURNING') ? [row] : [{ id: row.id }];
    }
  }

  if (upper.startsWith('SELECT') && store) {
    let rows = [...store];
    const whereMatch = text.match(/WHERE\s+(.+?)(?:ORDER|GROUP|LIMIT|$)/i);
    if (whereMatch) {
      const parts = whereMatch[1].trim().split(/\s*=\s*/);
      if (parts.length === 2) {
        let val = parts[1].trim().replace(/^'(.*)'$/, '$1');
        const pm = val.match(/^\$(\d+)$/);
        if (pm) val = params[parseInt(pm[1]) - 1];
        rows = rows.filter(r => String(r[parts[0].trim().toLowerCase()] || '') === String(val));
      }
    }
    if (text.includes('COUNT(*)')) return [{ count: rows.length }];
    return rows;
  }

  if (upper.startsWith('UPDATE') && store) {
    const setMatch = text.match(/SET\s+(.+?)(?:WHERE|$)/i);
    const whereMatch = text.match(/WHERE\s+(.+?)$/i);
    if (setMatch && whereMatch) {
      const sets = setMatch[1].split(',').map(s => s.trim());
      const wp = whereMatch[1].trim().split(/\s*=\s*/);
      if (wp.length === 2) {
        let val = wp[1].trim().replace(/^'(.*)'$/, '$1');
        const pm = val.match(/^\$(\d+)$/);
        if (pm) val = params[parseInt(pm[1]) - 1];
        const rows = store.filter(r => String(r[wp[0].trim().toLowerCase()] || '') === String(val));
        rows.forEach(row => {
          sets.forEach(set => {
            const sp = set.split(/\s*=\s*/);
            if (sp.length === 2) {
              let v = sp[1].trim();
              const pm2 = v.match(/^\$(\d+)$/);
              if (pm2) v = params[parseInt(pm2[1]) - 1];
              if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
              row[sp[0].toLowerCase()] = v;
            }
          });
        });
      }
    }
    return [];
  }

  return [];
}

module.exports = { q };