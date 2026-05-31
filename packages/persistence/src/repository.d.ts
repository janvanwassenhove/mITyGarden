import type { GardenProject } from "@mity-garden/domain";
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
export interface CloudSyncAdapter {
  isAvailable(): boolean;
  push(project: GardenProject): Promise<void>;
  pull(id: string): Promise<GardenProject | null>;
  listRemote(): Promise<ProjectSummary[]>;
}
/** Stub cloud adapter — always unavailable in v1 */
export declare class NoOpCloudSyncAdapter implements CloudSyncAdapter {
  isAvailable(): boolean;
  push(_project: GardenProject): Promise<void>;
  pull(_id: string): Promise<GardenProject | null>;
  listRemote(): Promise<ProjectSummary[]>;
}
//# sourceMappingURL=repository.d.ts.map
