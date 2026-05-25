import type { GardenProject } from "@mity-garden/domain";
import type { ProjectRepository, ProjectSummary } from "../repository.js";

// ─── ElectronRepository ───────────────────────────────────────────────────────
//
// Implements ProjectRepository using the IPC bridge exposed by the Electron
// preload script as `window.mityGardenDesktop.db.*`.
// Only safe to instantiate when `window.mityGardenDesktop?.isDesktop === true`.

interface DesktopDb {
  listProjects: () => Promise<ProjectSummary[]>;
  getProject: (id: string) => Promise<unknown | null>;
  saveProject: (project: unknown) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  exportJSON: (id: string) => Promise<string | null>;
  importJSON: (json: string) => Promise<unknown | null>;
}

function getDb(): DesktopDb {
  const db = (window as { mityGardenDesktop?: { db?: DesktopDb } })
    .mityGardenDesktop?.db;
  if (!db) throw new Error("ElectronRepository: mityGardenDesktop.db is not available");
  return db;
}

export class ElectronRepository implements ProjectRepository {
  async listProjects(): Promise<ProjectSummary[]> {
    return getDb().listProjects() as Promise<ProjectSummary[]>;
  }

  async getProject(id: string): Promise<GardenProject | null> {
    const result = await getDb().getProject(id);
    return (result as GardenProject | null) ?? null;
  }

  async saveProject(project: GardenProject): Promise<void> {
    await getDb().saveProject(project as unknown);
  }

  async deleteProject(id: string): Promise<void> {
    await getDb().deleteProject(id);
  }

  async exportJSON(project: GardenProject): Promise<string> {
    const result = await getDb().exportJSON(project.id);
    return result ?? JSON.stringify(project, null, 2);
  }

  async importJSON(json: string): Promise<GardenProject> {
    const result = await getDb().importJSON(json);
    if (!result) throw new Error("Failed to import project JSON");
    return result as GardenProject;
  }
}
