const Database = require('better-sqlite3');
const db = new Database('/opt/nexus-api/nexus.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    order_num INTEGER DEFAULT 99,
    group_name TEXT DEFAULT 'Dynamic',
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    sections TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    monthly_goal TEXT DEFAULT '',
    learning_style TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS progress (
    user_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    status TEXT NOT NULL,
    confidence TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, topic_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    topic_id TEXT DEFAULT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);

  CREATE TABLE IF NOT EXISTS domains (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#4db8ff',
    order_num INTEGER DEFAULT 99,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    domain_id TEXT NOT NULL,
    label TEXT NOT NULL,
    version TEXT DEFAULT 'v1.0',
    order_num INTEGER DEFAULT 99,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS student_memory (
    user_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, key)
  );

  CREATE TABLE IF NOT EXISTS invite_codes (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS subject_summaries (
    user_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    summary_md TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, module_id)
  );

  CREATE TABLE IF NOT EXISTS weaknesses (
    user_id TEXT NOT NULL,
    concept TEXT NOT NULL,
    topic_id TEXT,
    severity INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    last_reviewed_at TEXT,
    PRIMARY KEY (user_id, concept)
  );

  CREATE TABLE IF NOT EXISTS roadmaps (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps_json TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
