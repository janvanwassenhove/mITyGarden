import type { GardenProject } from "@mity-garden/domain";
import type { ProjectRepository, ProjectSummary } from "../repository.js";
export declare class ElectronRepository implements ProjectRepository {
    listProjects(): Promise<ProjectSummary[]>;
    getProject(id: string): Promise<GardenProject | null>;
    saveProject(project: GardenProject): Promise<void>;
    deleteProject(id: string): Promise<void>;
    exportJSON(project: GardenProject): Promise<string>;
    importJSON(json: string): Promise<GardenProject>;
}
//# sourceMappingURL=ElectronRepository.d.ts.map