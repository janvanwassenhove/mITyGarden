import type { GardenProject } from "@mity-garden/domain";

// ─── Repository Interface ─────────────────────────────────────────────────────

export interface ProjectRepository {
  listProjects(): Promise<ProjectSummary[]>;
  getProject(id: string): Promise<GardenProject | null>;
  saveProject(project: GardenProject): Promise<void>;
  deleteProject(id: string): Promise<void>;
  exportJSON(project: GardenProject): Promise<string>;
  importJSON(json: string): Promise<GardenProject>;
}

export interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  thumbnailDataUrl?: string;
}

// ─── Cloud Sync Adapter Interface (v1: interface only, no implementation) ─────

export interface CloudSyncAdapter {
  isAvailable(): boolean;
  push(project: GardenProject): Promise<void>;
  pull(id: string): Promise<GardenProject | null>;
  listRemote(): Promise<ProjectSummary[]>;
}

/** Stub cloud adapter — always unavailable in v1 */
export class NoOpCloudSyncAdapter implements CloudSyncAdapter {
  isAvailable(): boolean {
    return false;
  }
  async push(_project: GardenProject): Promise<void> {
    // Not implemented in v1
  }
  async pull(_id: string): Promise<GardenProject | null> {
    return null;
  }
  async listRemote(): Promise<ProjectSummary[]> {
    return [];
  }
}
