const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'media.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_path TEXT NOT NULL,
      audio_path TEXT,
      transcript TEXT,
      status TEXT DEFAULT 'uploaded',
      asr_provider TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

module.exports = { getDb };
