import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  GardenProject,
  GardenElement,
  Layer,
  HistoryAction,
  UUID,
  Dimensions,
  Position,
} from "../models/types.js";
import { createProject, createLayer, createElement } from "../models/factories.js";
import type { ElementType } from "../models/types.js";

// ─── State ────────────────────────────────────────────────────────────────────

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

  // Layer actions
  addLayer: (name?: string) => void;
  removeLayer: (layerId: UUID) => void;
  updateLayer: (layerId: UUID, updates: Partial<Omit<Layer, "id" | "elements">>) => void;
  reorderLayer: (layerId: UUID, newOrder: number) => void;

  // Element actions
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

  // History
  undo: () => void;
  redo: () => void;

  // Persistence flags
  markClean: () => void;
  setSaving: (saving: boolean) => void;
}

export type ProjectStore = ProjectState & ProjectActions;

// ─── Store ────────────────────────────────────────────────────────────────────

function applyAction(project: GardenProject, action: HistoryAction): GardenProject {
  switch (action.type) {
    case "ADD_ELEMENT": {
      return {
        ...project,
        layers: project.layers.map((l) =>
          l.id === action.layerId ? { ...l, elements: [...l.elements, action.element] } : l
        ),
      };
    }
    case "REMOVE_ELEMENT": {
      return {
        ...project,
        layers: project.layers.map((l) =>
          l.id === action.layerId
            ? { ...l, elements: l.elements.filter((e) => e.id !== action.elementId) }
            : l
        ),
      };
    }
    case "UPDATE_ELEMENT": {
      return {
        ...project,
        layers: project.layers.map((l) =>
          l.id === action.layerId
            ? {
                ...l,
                elements: l.elements.map((e) => (e.id === action.after.id ? action.after : e)),
              }
            : l
        ),
      };
    }
    case "ADD_LAYER": {
      return { ...project, layers: [...project.layers, action.layer] };
    }
    case "REMOVE_LAYER": {
      return { ...project, layers: project.layers.filter((l) => l.id !== action.layer.id) };
    }
    case "UPDATE_LAYER": {
      return {
        ...project,
        layers: project.layers.map((l) =>
          l.id === action.after.id ? { ...l, ...action.after } : l
        ),
      };
    }
    case "BATCH": {
      return action.actions.reduce(applyAction, project);
    }
  }
}

function reverseAction(action: HistoryAction): HistoryAction {
  switch (action.type) {
    case "ADD_ELEMENT":
      return {
        type: "REMOVE_ELEMENT",
        layerId: action.layerId,
        elementId: action.element.id,
        element: action.element,
      };
    case "REMOVE_ELEMENT":
      return { type: "ADD_ELEMENT", layerId: action.layerId, element: action.element };
    case "UPDATE_ELEMENT":
      return {
        type: "UPDATE_ELEMENT",
        layerId: action.layerId,
        before: action.after,
        after: action.before,
      };
    case "ADD_LAYER":
      return { type: "REMOVE_LAYER", layer: action.layer };
    case "REMOVE_LAYER":
      return { type: "ADD_LAYER", layer: action.layer };
    case "UPDATE_LAYER":
      return { type: "UPDATE_LAYER", before: action.after, after: action.before };
    case "BATCH":
      return { type: "BATCH", actions: [...action.actions].reverse().map(reverseAction) };
  }
}

const MAX_HISTORY = 100;

function pushHistory(project: GardenProject, action: HistoryAction): GardenProject {
  return {
    ...project,
    history: {
      past: [...project.history.past.slice(-MAX_HISTORY + 1), action],
      future: [],
    },
  };
}

function withTimestamp(project: GardenProject): GardenProject {
  return { ...project, updatedAt: new Date().toISOString() };
}

export const projectStore = createStore<ProjectStore>()(
  subscribeWithSelector((set, get) => ({
    project: null,
    isDirty: false,
    isSaving: false,

    newProject: (overrides) => {
      set({ project: createProject(overrides), isDirty: false });
    },

    loadProject: (project) => {
      set({ project, isDirty: false });
    },

    closeProject: () => {
      set({ project: null, isDirty: false });
    },

    updateProject: (updates) => {
      const { project } = get();
      if (!project) return;
      set({ project: withTimestamp({ ...project, ...updates }), isDirty: true });
    },

    addLayer: (name) => {
      const { project } = get();
      if (!project) return;
      const order = project.layers.length;
      const layer = createLayer(name ?? `Layer ${order + 1}`, order);
      const action: HistoryAction = { type: "ADD_LAYER", layer };
      const updated = applyAction(pushHistory(withTimestamp(project), action), action);
      set({ project: updated, isDirty: true });
    },

    removeLayer: (layerId) => {
      const { project } = get();
      if (!project) return;
      const layer = project.layers.find((l) => l.id === layerId);
      if (!layer) return;
      const action: HistoryAction = { type: "REMOVE_LAYER", layer };
      const updated = applyAction(pushHistory(withTimestamp(project), action), action);
      set({ project: updated, isDirty: true });
    },

    updateLayer: (layerId, updates) => {
      const { project } = get();
      if (!project) return;
      const layer = project.layers.find((l) => l.id === layerId);
      if (!layer) return;
      const before = {
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        locked: layer.locked,
        order: layer.order,
      };
      const after = { ...before, ...updates };
      const action: HistoryAction = { type: "UPDATE_LAYER", before, after };
      const updated = applyAction(pushHistory(withTimestamp(project), action), action);
      set({ project: updated, isDirty: true });
    },

    reorderLayer: (layerId, newOrder) => {
      const { updateLayer } = get();
      updateLayer(layerId, { order: newOrder });
    },

    addElement: (layerId, assetId, type, position, size) => {
      const { project } = get();
      if (!project) return "";
      const layer = project.layers.find((l) => l.id === layerId);
      if (!layer) return "";
      const zIndex = layer.elements.length;
      const element = createElement(assetId, type, position, size, { zIndex });
      const action: HistoryAction = { type: "ADD_ELEMENT", layerId, element };
      const updated = applyAction(pushHistory(withTimestamp(project), action), action);
      set({ project: updated, isDirty: true });
      return element.id;
    },

    removeElement: (layerId, elementId) => {
      const { project } = get();
      if (!project) return;
      const layer = project.layers.find((l) => l.id === layerId);
      const element = layer?.elements.find((e) => e.id === elementId);
      if (!element) return;
      const action: HistoryAction = { type: "REMOVE_ELEMENT", layerId, elementId, element };
      const updated = applyAction(pushHistory(withTimestamp(project), action), action);
      set({ project: updated, isDirty: true });
    },

    updateElement: (layerId, elementId, updates) => {
      const { project } = get();
      if (!project) return;
      const layer = project.layers.find((l) => l.id === layerId);
      const before = layer?.elements.find((e) => e.id === elementId);
      if (!before) return;
      const after = { ...before, ...updates };
      const action: HistoryAction = { type: "UPDATE_ELEMENT", layerId, before, after };
      const updated = applyAction(pushHistory(withTimestamp(project), action), action);
      set({ project: updated, isDirty: true });
    },

    moveElement: (layerId, elementId, position) => {
      get().updateElement(layerId, elementId, { position });
    },

    undo: () => {
      const { project } = get();
      if (!project || project.history.past.length === 0) return;
      const past = [...project.history.past];
      const lastAction = past.pop();
      if (!lastAction) return;
      const reversed = reverseAction(lastAction);
      const reverted = applyAction(project, reversed);
      set({
        project: {
          ...reverted,
          history: {
            past,
            future: [lastAction, ...project.history.future],
          },
        },
        isDirty: true,
      });
    },

    redo: () => {
      const { project } = get();
      if (!project || project.history.future.length === 0) return;
      const future = [...project.history.future];
      const nextAction = future.shift();
      if (!nextAction) return;
      const redone = applyAction(project, nextAction);
      set({
        project: {
          ...redone,
          history: {
            past: [...project.history.past, nextAction],
            future,
          },
        },
        isDirty: true,
      });
    },

    markClean: () => set({ isDirty: false }),
    setSaving: (saving) => set({ isSaving: saving }),
  }))
);
