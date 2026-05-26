import { describe, it, expect } from "vitest";
import {
  getAssetVisualDescription,
  getPositionDescription,
  getSizeDescription,
  getAssetLabel,
} from "../src/aiRender/assetDescriptions.js";

describe("assetDescriptions", () => {
  describe("getAssetVisualDescription", () => {
    it("returns a description for a known asset", () => {
      const desc = getAssetVisualDescription("pool-rectangular");
      expect(desc).toContain("rectangular");
      expect(desc.length).toBeGreaterThan(20);
    });

    it("returns a fallback for an unknown asset", () => {
      const desc = getAssetVisualDescription("unknown-thing");
      expect(desc).toContain("unknown thing");
    });

    it("returns descriptions for all tree types", () => {
      const treeIds = ["tree-oak", "tree-pine", "tree-birch", "tree-apple", "tree-palm"];
      for (const id of treeIds) {
        const desc = getAssetVisualDescription(id);
        expect(desc.length).toBeGreaterThan(10);
      }
    });
  });

  describe("getPositionDescription", () => {
    it("returns 'central area' for a centered position", () => {
      const desc = getPositionDescription({ x: 10, y: 8 }, { width: 20, height: 16 });
      expect(desc).toBe("central area");
    });

    it("returns 'upper-left area' for a top-left position", () => {
      const desc = getPositionDescription({ x: 1, y: 1 }, { width: 20, height: 16 });
      expect(desc).toBe("upper-left area");
    });

    it("returns 'lower-right area' for a bottom-right position", () => {
      const desc = getPositionDescription({ x: 18, y: 14 }, { width: 20, height: 16 });
      expect(desc).toBe("lower-right area");
    });
  });

  describe("getSizeDescription", () => {
    it("describes size in metres", () => {
      const desc = getSizeDescription({ width: 8, height: 5 });
      expect(desc).toContain("8");
      expect(desc).toContain("5");
      expect(desc).toContain("metre");
    });
  });

  describe("getAssetLabel", () => {
    it("converts kebab-case to title case", () => {
      expect(getAssetLabel("tree-weeping-willow")).toBe("Weeping Willow");
    });

    it("strips type prefix", () => {
      expect(getAssetLabel("pool-rectangular")).toBe("Rectangular");
    });

    it("handles single-word after prefix", () => {
      expect(getAssetLabel("terrain-pond")).toBe("Pond");
    });
  });
});
