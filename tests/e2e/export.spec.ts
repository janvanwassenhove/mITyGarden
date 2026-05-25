import { test, expect } from "@playwright/test";

/**
 * Export E2E tests — Milestone 5
 * Verifies that JSON and text proposal export buttons are present on the design page
 * and that clicking them triggers a file download.
 */

test.describe("Export feature", () => {
  test.beforeEach(async ({ page }) => {
    // Create a project via the wizard (matches wizard.spec.ts flow)
    await page.goto("/");
    const emptyBtn = page.getByTestId("empty-state-create-btn");
    if (await emptyBtn.isVisible()) {
      await emptyBtn.click();
    } else {
      await page.getByTestId("new-project-btn").click();
    }
    // Step 1: Dimensions
    await expect(page.getByTestId("wizard-step-dimensions")).toBeVisible();
    await page.getByTestId("wizard-next").click();
    // Step 2: Style
    await page.getByTestId("wizard-next").click();
    // Step 3: Structures
    await page.getByTestId("wizard-next").click();
    // Step 4: Goals
    await page.getByTestId("wizard-next").click();
    // Step 5: Location → finish
    await page.getByTestId("wizard-finish").click();
    await page.waitForURL("/design");
  });

  test("export JSON button is visible in toolbar", async ({ page }) => {
    await expect(page.getByTestId("toolbar-export-json")).toBeVisible();
  });

  test("export Proposal button is visible in toolbar", async ({ page }) => {
    await expect(page.getByTestId("toolbar-export-text")).toBeVisible();
  });

  test("clicking JSON export triggers download", async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("toolbar-export-json").click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.garden\.json$/);
  });

  test("clicking Proposal export triggers download", async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByTestId("toolbar-export-text").click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/-proposal\.txt$/);
  });
});
