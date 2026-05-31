import type {
  GardenProject,
  GardenElement,
  Layer,
  UUID,
  Dimensions,
  Position,
} from "../models/types.js";
import type { ElementType } from "../models/types.js";
export interface ProjectState {
  project: GardenProject | null;
  isDirty: boolean;
  isSaving: boolean;
}
export interface ProjectActions {
  newProject: (overrides?: Partial<GardenProject>) => void;
  loadProject: (project: GardenProject) => void;
  closeProject: () => void;
  updateProject: (
    updates: Partial<
      Pick<GardenProject, "name" | "dimensions" | "unit" | "style" | "goals" | "metadata">
    >
  ) => void;
  addLayer: (name?: string) => void;
  removeLayer: (layerId: UUID) => void;
  updateLayer: (layerId: UUID, updates: Partial<Omit<Layer, "id" | "elements">>) => void;
  reorderLayer: (layerId: UUID, newOrder: number) => void;
  addElement: (
    layerId: UUID,
    assetId: string,
    type: ElementType,
    position: Position,
    size: Dimensions
  ) => UUID;
  removeElement: (layerId: UUID, elementId: UUID) => void;
  updateElement: (
    layerId: UUID,
    elementId: UUID,
    updates: Partial<Omit<GardenElement, "id">>
  ) => void;
  moveElement: (layerId: UUID, elementId: UUID, position: Position) => void;
  undo: () => void;
  redo: () => void;
  markClean: () => void;
  setSaving: (saving: boolean) => void;
}
export type ProjectStore = ProjectState & ProjectActions;
export declare const projectStore: Omit<import("zustand").StoreApi<ProjectStore>, "subscribe"> & {
  subscribe: {
    (
      listener: (selectedState: ProjectStore, previousSelectedState: ProjectStore) => void
    ): () => void;
    <U>(
      selector: (state: ProjectStore) => U,
      listener: (selectedState: U, previousSelectedState: U) => void,
      options?:
        | {
            equalityFn?: (a: U, b: U) => boolean;
            fireImmediately?: boolean;
          }
        | undefined
    ): () => void;
  };
};
//# sourceMappingURL=projectStore.d.ts.map
