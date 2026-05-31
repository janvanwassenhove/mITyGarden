import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";
import type { GardenProject } from "@mity-garden/domain";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}

// ─── Database setup ───────────────────────────────────────────────────────────

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  const dbPath = path.join(app.getPath("userData"), "garden.db");
  _db = new Database(dbPath);

  // Enable WAL mode for better concurrent performance
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      data        TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_projects_updated_at
      ON projects (updated_at DESC);
  `);

  return _db;
}

// ─── Repository operations ────────────────────────────────────────────────────

export function listProjectsSQLite(): ProjectSummary[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT id, name, created_at, updated_at FROM projects ORDER BY updated_at DESC")
    .all() as Array<{ id: string; name: string; created_at: string; updated_at: string }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function getProjectSQLite(id: string): GardenProject | null {
  const db = getDb();
  const row = db.prepare("SELECT data FROM projects WHERE id = ?").get(id) as
    | { data: string }
    | undefined;

  if (!row) return null;

  try {
    return JSON.parse(row.data) as GardenProject;
  } catch {
    return null;
  }
}

export function saveProjectSQLite(project: GardenProject): void {
  const db = getDb();
  const data = JSON.stringify(project);
  db.prepare(
    `
    INSERT INTO projects (id, name, data, created_at, updated_at)
    VALUES (@id, @name, @data, @created_at, @updated_at)
    ON CONFLICT(id) DO UPDATE SET
      name       = excluded.name,
      data       = excluded.data,
      updated_at = excluded.updated_at
  `
  ).run({
    id: project.id,
    name: project.name,
    data,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
  });
}

export function deleteProjectSQLite(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM projects WHERE id = ?").run(id);
}

export function exportProjectJSON(id: string): string | null {
  const project = getProjectSQLite(id);
  if (!project) return null;
  return JSON.stringify(project, null, 2);
}

export function importProjectJSON(json: string): GardenProject | null {
  try {
    const project = JSON.parse(json) as GardenProject;
    if (!project.id || !project.name || !Array.isArray(project.layers)) {
      return null;
    }
    saveProjectSQLite(project);
    return project;
  } catch {
    return null;
  }
}

export function closeDb(): void {
  _db?.close();
  _db = null;
}
