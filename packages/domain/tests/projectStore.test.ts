import { describe, it, expect, beforeEach } from "vitest";
import { projectStore } from "../src/stores/projectStore.js";
import { createProject } from "../src/models/factories.js";

describe("projectStore", () => {
  beforeEach(() => {
    projectStore.getState().newProject();
  });

  it("creates a new project with one default layer", () => {
    const { project } = projectStore.getState();
    expect(project).not.toBeNull();
    expect(project!.layers).toHaveLength(1);
    expect(project!.layers[0]!.name).toBe("Main Layer");
  });

  it("adds an element and records history", () => {
    const { project, addElement } = projectStore.getState();
    const layerId = project!.layers[0]!.id;
    addElement(layerId, "pool-rect", "pool", { x: 5, y: 5 }, { width: 4, height: 2 });

    const updated = projectStore.getState();
    expect(updated.project!.layers[0]!.elements).toHaveLength(1);
    expect(updated.project!.history.past).toHaveLength(1);
  });

  it("supports undo after adding element", () => {
    const { project, addElement, undo } = projectStore.getState();
    const layerId = project!.layers[0]!.id;
    addElement(layerId, "pool-rect", "pool", { x: 5, y: 5 }, { width: 4, height: 2 });
    undo();

    const afterUndo = projectStore.getState();
    expect(afterUndo.project!.layers[0]!.elements).toHaveLength(0);
    expect(afterUndo.project!.history.future).toHaveLength(1);
  });

  it("supports redo after undo", () => {
    const { project, addElement, undo, redo } = projectStore.getState();
    const layerId = project!.layers[0]!.id;
    addElement(layerId, "pool-rect", "pool", { x: 5, y: 5 }, { width: 4, height: 2 });
    undo();
    redo();

    const afterRedo = projectStore.getState();
    expect(afterRedo.project!.layers[0]!.elements).toHaveLength(1);
    expect(afterRedo.project!.history.future).toHaveLength(0);
  });

  it("clears redo history when a new action is performed after undo", () => {
    const { project, addElement, undo } = projectStore.getState();
    const layerId = project!.layers[0]!.id;
    addElement(layerId, "pool-rect", "pool", { x: 5, y: 5 }, { width: 4, height: 2 });
    undo();
    addElement(layerId, "tree-oak", "tree", { x: 2, y: 2 }, { width: 1, height: 1 });

    const state = projectStore.getState();
    expect(state.project!.history.future).toHaveLength(0);
    expect(state.project!.layers[0]!.elements).toHaveLength(1);
  });

  it("marks isDirty on changes and clean after markClean", () => {
    const { project, addElement, markClean } = projectStore.getState();
    const layerId = project!.layers[0]!.id;
    addElement(layerId, "tree-oak", "tree", { x: 2, y: 2 }, { width: 1, height: 1 });
    expect(projectStore.getState().isDirty).toBe(true);
    markClean();
    expect(projectStore.getState().isDirty).toBe(false);
  });

  it("adds and removes layers", () => {
    const { addLayer, removeLayer } = projectStore.getState();
    addLayer("Garden Layer");

    const afterAdd = projectStore.getState();
    expect(afterAdd.project!.layers).toHaveLength(2);

    const newLayerId = afterAdd.project!.layers[1]!.id;
    removeLayer(newLayerId);
    expect(projectStore.getState().project!.layers).toHaveLength(1);
  });

  it("loads an existing project", () => {
    const customProject = createProject({
      name: "My Garden",
      dimensions: { width: 30, height: 25 },
    });
    projectStore.getState().loadProject(customProject);

    const state = projectStore.getState();
    expect(state.project!.name).toBe("My Garden");
    expect(state.project!.dimensions.width).toBe(30);
    expect(state.isDirty).toBe(false);
  });
});
