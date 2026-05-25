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
    // Step 1: Location (skip)
    await expect(page.getByTestId("wizard-step-location")).toBeVisible();
    await page.getByTestId("wizard-next").click();
    // Step 2: Boundary (no API key in test env, skip)
    await page.getByTestId("wizard-next").click();
    // Step 3: Dimensions
    await page.getByTestId("wizard-next").click();
    // Step 4: Style
    await page.getByTestId("wizard-next").click();
    // Step 5: Goals → finish
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
