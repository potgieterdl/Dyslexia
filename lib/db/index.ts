import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Company, Evaluation, AnalysisStep } from './schema';
import { logInfo, logError, logDebug } from '../logger';
import { databaseError } from '../api-error';

const DB_PATH =
  process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'investment-analyzer.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    logInfo('Created database directory', { path: dataDir });
  } catch (error) {
    logError('Failed to create database directory', error, { path: dataDir });
    throw error;
  }
}

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    try {
      db = new Database(DB_PATH);
      db.pragma('journal_mode = WAL');
      initializeDatabase(db);
      logDebug('Database connection established', { path: DB_PATH });
    } catch (error) {
      logError('Failed to initialize database', error, { path: DB_PATH });
      throw databaseError('Failed to initialize database');
    }
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
  try {
    const db = getDatabase();
    const stmt = db.prepare('INSERT INTO companies (name, ticker, sector) VALUES (?, ?, ?)');
    const result = stmt.run(name, ticker, sector);

    const company = db
      .prepare('SELECT * FROM companies WHERE id = ?')
      .get(result.lastInsertRowid) as Company;

    logDebug('Created company', { id: company.id, name, ticker });
    return company;
  } catch (error) {
    logError('Failed to create company', error, { name, ticker, sector });
    throw databaseError('Failed to create company');
  }
}

export function getOrCreateCompany(name: string, ticker?: string): Company {
  try {
    const db = getDatabase();

    // Try to find existing company
    let company = db.prepare('SELECT * FROM companies WHERE name = ?').get(name) as
      | Company
      | undefined;

    if (!company) {
      company = createCompany(name, ticker);
      logDebug('Company not found, created new', { name, ticker });
    } else {
      logDebug('Found existing company', { id: company.id, name });
    }

    return company;
  } catch (error) {
    logError('Failed to get or create company', error, { name, ticker });
    throw databaseError('Failed to get or create company');
  }
}

export function getCompanies(): Company[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM companies ORDER BY created_at DESC').all() as Company[];
}

// Evaluation operations
export function createEvaluation(companyId: number): Evaluation {
  try {
    const db = getDatabase();
    const stmt = db.prepare('INSERT INTO evaluations (company_id, status) VALUES (?, ?)');
    const result = stmt.run(companyId, 'pending');

    const evaluation = db
      .prepare('SELECT * FROM evaluations WHERE id = ?')
      .get(result.lastInsertRowid) as Evaluation;

    logDebug('Created evaluation', { id: evaluation.id, companyId });
    return evaluation;
  } catch (error) {
    logError('Failed to create evaluation', error, { companyId });
    throw databaseError('Failed to create evaluation');
  }
}

export function updateEvaluation(
  evaluationId: number,
  updates: Partial<Omit<Evaluation, 'id' | 'company_id' | 'created_at'>>
): void {
  try {
    const db = getDatabase();
    const fields: string[] = [];
    const values: unknown[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(evaluationId);

    const stmt = db.prepare(`UPDATE evaluations SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    logDebug('Updated evaluation', { evaluationId, updates });
  } catch (error) {
    logError('Failed to update evaluation', error, { evaluationId, updates });
    throw databaseError('Failed to update evaluation');
  }
}

export function getEvaluation(evaluationId: number): Evaluation | undefined {
  try {
    const db = getDatabase();
    const evaluation = db
      .prepare(
        `
      SELECT e.*, c.name as company_name, c.ticker
      FROM evaluations e
      JOIN companies c ON e.company_id = c.id
      WHERE e.id = ?
    `
      )
      .get(evaluationId) as Evaluation | undefined;

    logDebug('Retrieved evaluation', { evaluationId, found: !!evaluation });
    return evaluation;
  } catch (error) {
    logError('Failed to get evaluation', error, { evaluationId });
    throw databaseError('Failed to get evaluation');
  }
}

export function getEvaluationsByCompany(companyId: number): Evaluation[] {
  try {
    const db = getDatabase();
    const evaluations = db
      .prepare('SELECT * FROM evaluations WHERE company_id = ? ORDER BY created_at DESC')
      .all(companyId) as Evaluation[];

    logDebug('Retrieved evaluations for company', { companyId, count: evaluations.length });
    return evaluations;
  } catch (error) {
    logError('Failed to get evaluations by company', error, { companyId });
    throw databaseError('Failed to get evaluations by company');
  }
}

export function getAllEvaluations(): Evaluation[] {
  try {
    const db = getDatabase();
    const evaluations = db
      .prepare(
        `
      SELECT e.*, c.name as company_name, c.ticker
      FROM evaluations e
      JOIN companies c ON e.company_id = c.id
      ORDER BY e.created_at DESC
    `
      )
      .all() as Evaluation[];

    logDebug('Retrieved all evaluations', { count: evaluations.length });
    return evaluations;
  } catch (error) {
    logError('Failed to get all evaluations', error);
    throw databaseError('Failed to get all evaluations');
  }
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

  return db
    .prepare('SELECT * FROM analysis_steps WHERE id = ?')
    .get(result.lastInsertRowid) as AnalysisStep;
}

export function updateAnalysisStep(
  stepId: number,
  updates: Partial<Omit<AnalysisStep, 'id' | 'evaluation_id' | 'created_at'>>
): void {
  const db = getDatabase();
  const fields: string[] = [];
  const values: unknown[] = [];

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
  return db
    .prepare('SELECT * FROM analysis_steps WHERE evaluation_id = ? ORDER BY id')
    .all(evaluationId) as AnalysisStep[];
}

export function getAnalysisStep(stepId: number): AnalysisStep | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM analysis_steps WHERE id = ?').get(stepId) as
    | AnalysisStep
    | undefined;
}
