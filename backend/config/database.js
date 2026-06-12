const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/shotlist.db');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

function initDb() {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      inputs JSON NOT NULL,
      result JSON NOT NULL,
      model TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Add user_id column if it doesn't exist (for existing tables)
  try {
    db.prepare('SELECT user_id FROM generations LIMIT 1').get();
  } catch (e) {
    db.exec('ALTER TABLE generations ADD COLUMN user_id INTEGER REFERENCES users(id)');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      generation_id TEXT,
      rating INTEGER,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(generation_id) REFERENCES generations(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  try {
    db.prepare('SELECT user_id FROM feedback LIMIT 1').get();
  } catch (e) {
    db.exec('ALTER TABLE feedback ADD COLUMN user_id INTEGER REFERENCES users(id)');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      scene_description TEXT,
      production_requirements TEXT,
      camera_angles TEXT,
      lens_suggestions TEXT,
      coverage_notes TEXT,
      is_public INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  logger.info('✅ Connected to SQLite database (WAL mode enabled for concurrency)');
}

function getDb() {
  if (!db) initDb();
  return db;
}

module.exports = { initDb, getDb };
