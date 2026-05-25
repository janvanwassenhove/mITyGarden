import { test, expect } from "@playwright/test";

/**
 * LLM / AI panel E2E tests — Milestone 7
 * These tests verify the AI panel UI (open/close, tabs, buttons, provider messages).
 * Actual LLM/image API calls are NOT made in tests.
 * Note: API keys may be present via system environment variables; button enabled/disabled
 * state is therefore not asserted here.
 */

test.describe("AI Suggestions Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const emptyBtn = page.getByTestId("empty-state-create-btn");
    if (await emptyBtn.isVisible()) {
      await emptyBtn.click();
    } else {
      await page.getByTestId("new-project-btn").click();
    }
    // Complete wizard quickly
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("wizard-next").click();
    await page.getByTestId("wizard-finish").click();
    await page.waitForURL("/design");
  });

  test("AI toggle button is visible in toolbar", async ({ page }) => {
    await expect(page.getByTestId("toolbar-ai-panel")).toBeVisible();
  });

  test("clicking AI button opens the suggestions panel", async ({ page }) => {
    await expect(page.getByTestId("llm-suggestions-panel")).not.toBeVisible();
    await page.getByTestId("toolbar-ai-panel").click();
    await expect(page.getByTestId("llm-suggestions-panel")).toBeVisible();
  });

  test("clicking AI button again closes the panel", async ({ page }) => {
    await page.getByTestId("toolbar-ai-panel").click();
    await expect(page.getByTestId("llm-suggestions-panel")).toBeVisible();
    await page.getByTestId("toolbar-ai-panel").click();
    await expect(page.getByTestId("llm-suggestions-panel")).not.toBeVisible();
  });

  test("panel shows Suggestions and Visualize tabs", async ({ page }) => {
    await page.getByTestId("toolbar-ai-panel").click();
    await expect(page.getByTestId("llm-suggestions-panel")).toBeVisible();
    await expect(page.getByRole("button", { name: "Suggestions", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Visualize", exact: true })).toBeVisible();
  });

  test("Suggestions tab shows generate button", async ({ page }) => {
    await page.getByTestId("toolbar-ai-panel").click();
    // Button is always visible; enabled/disabled depends on API key availability
    await expect(page.getByTestId("llm-suggest-btn")).toBeVisible();
  });

  test("Visualize tab shows image generation UI", async ({ page }) => {
    await page.getByTestId("toolbar-ai-panel").click();
    await page.getByRole("button", { name: "Visualize" }).click();
    // Button is always visible; enabled/disabled depends on API key availability
    await expect(page.getByTestId("llm-generate-image-btn")).toBeVisible();
    // View type buttons present
    await expect(page.getByRole("button", { name: /aerial/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /perspective/i })).toBeVisible();
  });
});
