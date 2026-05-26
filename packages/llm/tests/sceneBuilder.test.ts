import { describe, it, expect } from "vitest";
import { buildScene } from "../src/aiRender/SceneBuilder.js";
import type { GardenProject } from "@mity-garden/domain";
import { createProject } from "@mity-garden/domain";

function makeTestProject(overrides: Partial<GardenProject> = {}): GardenProject {
  const base = createProject({
    name: "Test Garden",
    dimensions: { width: 20, height: 15 },
    unit: "metric",
    style: "modern",
    goals: ["relaxation"],
  });
  // Add a pool element
  base.layers[0]!.elements.push({
    id: "el-1",
    assetId: "pool-rectangular",
    type: "pool",
    position: { x: 8, y: 5 },
    size: { width: 6, height: 3 },
    rotation: 0,
    zIndex: 1,
    locked: false,
    visible: true,
    properties: {},
  });
  // Add a tree
  base.layers[0]!.elements.push({
    id: "el-2",
    assetId: "tree-oak",
    type: "tree",
    position: { x: 2, y: 2 },
    size: { width: 3, height: 3 },
    rotation: 0,
    zIndex: 2,
    locked: false,
    visible: true,
    properties: {},
  });
  return { ...base, ...overrides };
}

describe("SceneBuilder", () => {
  it("builds a scene from a project with default options", () => {
    const project = makeTestProject();
    const scene = buildScene(project);

    expect(scene.dimensions.width).toBe(20);
    expect(scene.dimensions.height).toBe(15);
    expect(scene.style).toBe("modern");
    expect(scene.goals).toContain("relaxation");
    expect(scene.elements).toHaveLength(2);
    expect(scene.view.mode).toBe("oblique_drone");
    expect(scene.strictness).toBe("strict");
  });

  it("uses custom view options when provided", () => {
    const project = makeTestProject();
    const scene = buildScene(project, {
      view: {
        mode: "eye_level",
        realism: "architectural_visualization",
        lens: "wide_angle",
        cameraHeightMeters: 2,
        cameraAngleDegrees: 15,
        direction: "N",
        timeOfDay: "golden_hour",
        season: "autumn",
      },
    });

    expect(scene.view.mode).toBe("eye_level");
    expect(scene.view.realism).toBe("architectural_visualization");
    expect(scene.view.cameraHeightMeters).toBe(2);
    expect(scene.view.season).toBe("autumn");
  });

  it("includes position and size descriptions for each element", () => {
    const project = makeTestProject();
    const scene = buildScene(project);

    const pool = scene.elements.find((e) => e.assetId === "pool-rectangular");
    expect(pool).toBeDefined();
    expect(pool!.positionDescription).toBeTruthy();
    expect(pool!.sizeDescription).toContain("6");
    expect(pool!.visualDescription.length).toBeGreaterThan(10);
  });

  it("builds a rectangular boundary when no vertices are provided", () => {
    const project = makeTestProject();
    const scene = buildScene(project);

    expect(scene.boundary.vertices.length).toBeGreaterThanOrEqual(4);
    expect(scene.boundary.shapeDescription).toContain("rectangular");
  });

  it("uses custom boundary vertices when provided", () => {
    const project = makeTestProject({
      boundaryVertices: [
        { x: 0, y: 0 },
        { x: 20, y: 0 },
        { x: 20, y: 15 },
        { x: 15, y: 15 },
        { x: 10, y: 12 },
        { x: 0, y: 15 },
      ],
    });
    const scene = buildScene(project);

    expect(scene.boundary.vertices).toHaveLength(6);
    expect(scene.boundary.shapeDescription).toContain("irregular");
  });

  it("excludes invisible elements", () => {
    const project = makeTestProject();
    project.layers[0]!.elements[0]!.visible = false;
    const scene = buildScene(project);

    expect(scene.elements).toHaveLength(1);
    expect(scene.elements[0]!.assetId).toBe("tree-oak");
  });

  it("excludes elements from invisible layers", () => {
    const project = makeTestProject();
    project.layers[0]!.visible = false;
    const scene = buildScene(project);

    expect(scene.elements).toHaveLength(0);
  });
});
