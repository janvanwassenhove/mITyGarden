import { test, expect } from "@playwright/test";

/**
 * Maps / Location step E2E tests — Milestone 6
 * Tests address search and map preview in the wizard Step 5 (Location).
 * Uses the NominatimMapsAdapter (free, no API key) in the test environment.
 */

test.describe("Wizard Location step", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const emptyBtn = page.getByTestId("empty-state-create-btn");
    if (await emptyBtn.isVisible()) {
      await emptyBtn.click();
    } else {
      await page.getByTestId("new-project-btn").click();
    }
    // Navigate to Step 5 (Location)
    await page.getByTestId("wizard-next").click(); // → Step 2
    await page.getByTestId("wizard-next").click(); // → Step 3
    await page.getByTestId("wizard-next").click(); // → Step 4
    await page.getByTestId("wizard-next").click(); // → Step 5
    await expect(page.getByTestId("wizard-step-location")).toBeVisible();
  });

  test("shows address search input and search button", async ({ page }) => {
    await expect(page.getByTestId("wizard-address-input")).toBeVisible();
    await expect(page.getByTestId("wizard-address-search")).toBeVisible();
  });

  test("search button is disabled when input is empty", async ({ page }) => {
    await expect(page.getByTestId("wizard-address-search")).toBeDisabled();
  });

  test("search button enables when address is typed", async ({ page }) => {
    await page.getByTestId("wizard-address-input").fill("Brussels");
    await expect(page.getByTestId("wizard-address-search")).toBeEnabled();
  });

  test("can complete wizard after skipping location search", async ({ page }) => {
    await page.getByTestId("wizard-finish").click();
    await expect(page).toHaveURL(/\/design/);
  });

  test("shows map placeholder before search", async ({ page }) => {
    // Map preview iframe should not be present before a location is selected
    await expect(page.getByTestId("wizard-map-preview")).not.toBeVisible();
    // Placeholder emoji/text should be visible
    await expect(page.locator("text=Search for an address")).toBeVisible();
  });
});
