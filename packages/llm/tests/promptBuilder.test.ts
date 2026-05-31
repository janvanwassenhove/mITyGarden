import { describe, it, expect } from "vitest";
import {
  buildPrompt,
  buildShortPrompt,
  buildNegativePrompt,
} from "../src/aiRender/PromptBuilder.js";
import { buildScene } from "../src/aiRender/SceneBuilder.js";
import { createProject } from "@mity-garden/domain";
import type { GardenProject } from "@mity-garden/domain";

function makeTestProject(): GardenProject {
  const project = createProject({
    name: "Test Garden",
    dimensions: { width: 20, height: 15 },
    unit: "metric",
    style: "modern",
    goals: ["relaxation"],
  });
  project.layers[0]!.elements.push({
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
  project.layers[0]!.elements.push({
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
  return project;
}

describe("PromptBuilder", () => {
  const project = makeTestProject();
  const scene = buildScene(project);

  describe("buildPrompt", () => {
    const prompt = buildPrompt(scene);

    it("produces a non-empty prompt", () => {
      expect(prompt.length).toBeGreaterThan(200);
    });

    it("contains the role/description section", () => {
      expect(prompt).toContain("photorealistic");
      expect(prompt).toContain("garden");
    });

    it("contains camera details", () => {
      expect(prompt).toContain("Camera:");
      expect(prompt).toContain("metres");
    });

    it("contains element descriptions", () => {
      expect(prompt).toContain("Elements:");
      expect(prompt).toContain("pool");
      expect(prompt).toContain("oak");
    });

    it("contains strictness instructions", () => {
      expect(prompt).toContain("Strict layout:");
    });

    it("contains negative constraints", () => {
      expect(prompt).toContain("Avoid:");
    });

    it("never contains raw JSON", () => {
      expect(prompt).not.toContain("{");
      expect(prompt).not.toContain("}");
      expect(prompt).not.toContain("[");
      expect(prompt).not.toContain("]");
    });
  });

  describe("buildShortPrompt", () => {
    const short = buildShortPrompt(scene);

    it("is significantly shorter than the full prompt", () => {
      const full = buildPrompt(scene);
      expect(short.length).toBeLessThan(full.length);
    });

    it("mentions the view type", () => {
      expect(short.toLowerCase()).toContain("drone");
    });
  });

  describe("buildNegativePrompt", () => {
    const negative = buildNegativePrompt(scene);

    it("contains negative constraints", () => {
      expect(negative).toContain("cartoon");
      expect(negative).toContain("No text");
    });
  });
});
