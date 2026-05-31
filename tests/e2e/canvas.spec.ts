import { test, expect } from "@playwright/test";

/**
 * Canvas E2E tests — spec: specs/002-garden-canvas/spec.md
 * Note: Full canvas tests require Milestone 3 (react-konva interactive canvas)
 */

test.describe("Garden Design Canvas", () => {
  test.beforeEach(async ({ page }) => {
    // Create a project via wizard first
    await page.goto("/");
    await page.getByTestId("new-project-btn").click();

    // Complete wizard quickly
    await page.getByTestId("wizard-next").click(); // dimensions → style
    await page.getByTestId("wizard-next").click(); // style → structures
    await page.getByTestId("wizard-next").click(); // structures → goals
    await page.getByTestId("wizard-next").click(); // goals → location
    await page.getByTestId("wizard-finish").click(); // create

    await page.waitForURL(/\/design/);
  });

  test("renders canvas area after project creation", async ({ page }) => {
    await expect(page.getByTestId("canvas-area")).toBeVisible();
  });

  test("shows undo and redo toolbar buttons", async ({ page }) => {
    await expect(page.getByTestId("toolbar-undo")).toBeVisible();
    await expect(page.getByTestId("toolbar-redo")).toBeVisible();
  });

  test("shows saved indicator", async ({ page }) => {
    // Initially should show Saved (no changes)
    await expect(page.getByText("✓ Saved")).toBeVisible();
  });

  // TODO: Milestone 3 — Interactive canvas tests
  // test("places element by clicking on canvas", ...)
  // test("moves element by dragging", ...)
  // test("deletes selected element with Delete key", ...)
  // test("undo reverses add element", ...)
  // test("redo re-applies add element", ...)
});

test.describe("Canvas — No Project Open", () => {
  test("shows empty state when navigating directly to /design", async ({ page }) => {
    await page.goto("/design");
    await expect(page.getByText("No garden open")).toBeVisible();
    await expect(page.getByText("Create New Garden")).toBeVisible();
  });
});
