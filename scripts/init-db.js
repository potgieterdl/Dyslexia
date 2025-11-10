const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'investment-analyzer.db');
const dataDir = path.dirname(DB_PATH);

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`✓ Created data directory: ${dataDir}`);
}

// Initialize database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

console.log('Initializing database...');

// Create companies table
db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ticker TEXT,
    sector TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log('✓ Created companies table');

// Create evaluations table
db.exec(`
  CREATE TABLE IF NOT EXISTS evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    overall_rating TEXT CHECK(overall_rating IN ('buy', 'hold', 'sell')),
    overall_score REAL DEFAULT 0,
    status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (company_id) REFERENCES companies (id)
  )
`);
console.log('✓ Created evaluations table');

// Create analysis_steps table
db.exec(`
  CREATE TABLE IF NOT EXISTS analysis_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evaluation_id INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    step_type TEXT CHECK(step_type IN ('ai', 'manual')) NOT NULL,
    source TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
    score REAL DEFAULT 0,
    sentiment TEXT CHECK(sentiment IN ('positive', 'negative', 'neutral')),
    raw_data TEXT,
    summary TEXT,
    key_points TEXT,
    error_message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (evaluation_id) REFERENCES evaluations (id)
  )
`);
console.log('✓ Created analysis_steps table');

// Create indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_evaluations_company ON evaluations(company_id);
  CREATE INDEX IF NOT EXISTS idx_analysis_steps_evaluation ON analysis_steps(evaluation_id);
  CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
  CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
`);
console.log('✓ Created indexes');

// Check if tables exist
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\nDatabase tables:', tables.map(t => t.name).join(', '));

db.close();
console.log('\n✓ Database initialized successfully!');
console.log(`  Location: ${DB_PATH}`);
