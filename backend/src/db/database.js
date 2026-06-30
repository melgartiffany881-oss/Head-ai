const path = require('path');
const Database = require('better-sqlite3');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'hirestack.db');

let db = null;

function getDb() {
  if (db) return db;

  const fs = require('fs');
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      plan TEXT DEFAULT 'free',
      stripeCustomerId TEXT,
      rolesUsed INTEGER DEFAULT 0,
      rolesLimit INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}

function closeDb() {
  if (db) { db.close(); db = null; }
}

function uuid() {
  return crypto.randomUUID();
}

module.exports = { getDb, closeDb, uuid };