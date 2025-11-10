import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  Company,
  Evaluation,
  AnalysisStep,
  WorkflowStepDefinition,
} from './schema';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'investment-analyzer.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(database: Database.Database) {
  // Create companies table
  database.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ticker TEXT,
      sector TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create evaluations table
  database.exec(`
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

  // Create analysis_steps table
  database.exec(`
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

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_evaluations_company ON evaluations(company_id);
    CREATE INDEX IF NOT EXISTS idx_analysis_steps_evaluation ON analysis_steps(evaluation_id);
    CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
  `);
}

// Company operations
export function createCompany(name: string, ticker?: string, sector?: string): Company {
  const db = getDatabase();
  const stmt = db.prepare('INSERT INTO companies (name, ticker, sector) VALUES (?, ?, ?)');
  const result = stmt.run(name, ticker, sector);

  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(result.lastInsertRowid) as Company;
  return company;
}

export function getOrCreateCompany(name: string, ticker?: string): Company {
  const db = getDatabase();

  // Try to find existing company
  let company = db.prepare('SELECT * FROM companies WHERE name = ?').get(name) as Company | undefined;

  if (!company) {
    company = createCompany(name, ticker);
  }

  return company;
}

export function getCompanies(): Company[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM companies ORDER BY created_at DESC').all() as Company[];
}

// Evaluation operations
export function createEvaluation(companyId: number): Evaluation {
  const db = getDatabase();
  const stmt = db.prepare('INSERT INTO evaluations (company_id, status) VALUES (?, ?)');
  const result = stmt.run(companyId, 'pending');

  return db.prepare('SELECT * FROM evaluations WHERE id = ?').get(result.lastInsertRowid) as Evaluation;
}

export function updateEvaluation(
  evaluationId: number,
  updates: Partial<Omit<Evaluation, 'id' | 'company_id' | 'created_at'>>
): void {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(evaluationId);

  const stmt = db.prepare(`UPDATE evaluations SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function getEvaluation(evaluationId: number): Evaluation | undefined {
  const db = getDatabase();
  return db.prepare(`
    SELECT e.*, c.name as company_name, c.ticker
    FROM evaluations e
    JOIN companies c ON e.company_id = c.id
    WHERE e.id = ?
  `).get(evaluationId) as Evaluation | undefined;
}

export function getEvaluationsByCompany(companyId: number): Evaluation[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM evaluations WHERE company_id = ? ORDER BY created_at DESC')
    .all(companyId) as Evaluation[];
}

export function getAllEvaluations(): Evaluation[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT e.*, c.name as company_name, c.ticker
    FROM evaluations e
    JOIN companies c ON e.company_id = c.id
    ORDER BY e.created_at DESC
  `).all() as Evaluation[];
}

// Analysis step operations
export function createAnalysisStep(
  evaluationId: number,
  stepName: string,
  stepType: 'ai' | 'manual',
  source: string
): AnalysisStep {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO analysis_steps (evaluation_id, step_name, step_type, source, status)
    VALUES (?, ?, ?, ?, 'pending')
  `);
  const result = stmt.run(evaluationId, stepName, stepType, source);

  return db.prepare('SELECT * FROM analysis_steps WHERE id = ?').get(result.lastInsertRowid) as AnalysisStep;
}

export function updateAnalysisStep(
  stepId: number,
  updates: Partial<Omit<AnalysisStep, 'id' | 'evaluation_id' | 'created_at'>>
): void {
  const db = getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });

  values.push(stepId);

  const stmt = db.prepare(`UPDATE analysis_steps SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function getAnalysisSteps(evaluationId: number): AnalysisStep[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM analysis_steps WHERE evaluation_id = ? ORDER BY id')
    .all(evaluationId) as AnalysisStep[];
}

export function getAnalysisStep(stepId: number): AnalysisStep | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM analysis_steps WHERE id = ?').get(stepId) as AnalysisStep | undefined;
}
