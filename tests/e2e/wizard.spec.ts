import { test, expect } from "@playwright/test";

/**
 * Wizard E2E tests — spec: specs/001-project-wizard/spec.md
 */

test.describe("Project Creation Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("opens wizard from empty state CTA", async ({ page }) => {
    // Home page should show empty state since IndexedDB is empty in tests
    const emptyStateBtn = page.getByTestId("empty-state-create-btn");
    if (await emptyStateBtn.isVisible()) {
      await emptyStateBtn.click();
    } else {
      await page.getByTestId("new-project-btn").click();
    }

    await expect(page.getByTestId("project-wizard")).toBeVisible();
    await expect(page.getByTestId("wizard-step-location")).toBeVisible();
  });

  test("completes full wizard flow and navigates to design canvas", async ({ page }) => {
    await page.getByTestId("new-project-btn").click();
    await expect(page.getByTestId("project-wizard")).toBeVisible();

    // Step 1: Location (skip)
    await expect(page.getByTestId("wizard-step-location")).toBeVisible();
    await page.getByTestId("wizard-next").click();

    // Step 2: Boundary (no API key in test env, skip)
    await expect(page.getByTestId("wizard-step-boundary")).toBeVisible();
    await page.getByTestId("wizard-next").click();

    // Step 3: Dimensions
    await expect(page.getByTestId("wizard-step-dimensions")).toBeVisible();
    await page.getByTestId("wizard-width").fill("12");
    await page.getByTestId("wizard-height").fill("10");
    await page.getByTestId("wizard-next").click();

    // Step 4: Style
    await expect(page.getByTestId("wizard-step-style")).toBeVisible();
    await page.getByTestId("wizard-style-modern").click();
    await page.getByTestId("wizard-next").click();

    // Step 5: Goals → finish
    await expect(page.getByTestId("wizard-step-goals")).toBeVisible();
    await page.getByTestId("wizard-goal-terrace").click();
    await page.getByTestId("wizard-finish").click();

    // Should navigate to design canvas
    await expect(page).toHaveURL(/\/design/);
    await expect(page.getByTestId("canvas-area")).toBeVisible();
  });

  test("back button is hidden on step 1", async ({ page }) => {
    await page.getByTestId("new-project-btn").click();
    await expect(page.getByTestId("wizard-step-location")).toBeVisible();
    await expect(page.getByTestId("wizard-back")).not.toBeVisible();
  });

  test("back button navigates to previous step", async ({ page }) => {
    await page.getByTestId("new-project-btn").click();
    await page.getByTestId("wizard-next").click();
    await expect(page.getByTestId("wizard-step-boundary")).toBeVisible();
    await page.getByTestId("wizard-back").click();
    await expect(page.getByTestId("wizard-step-location")).toBeVisible();
  });

  test("cancel dismisses wizard without creating project", async ({ page }) => {
    await page.getByTestId("new-project-btn").click();
    await expect(page.getByTestId("project-wizard")).toBeVisible();
    await page.getByText("Cancel").click();
    await expect(page.getByTestId("project-wizard")).not.toBeVisible();
    await expect(page).toHaveURL("/");
  });

  test("progress bar advances through steps", async ({ page }) => {
    await page.getByTestId("new-project-btn").click();
    
    // Check initial state — step 1 of 5
    await expect(page.getByText("Step 1 of 5")).toBeVisible();
    await page.getByTestId("wizard-next").click();
    await expect(page.getByText("Step 2 of 5")).toBeVisible();
    await page.getByTestId("wizard-next").click();
    await expect(page.getByText("Step 3 of 5")).toBeVisible();
  });

  test("wizard preserves dimension values across navigation", async ({ page }) => {
    await page.getByTestId("new-project-btn").click();

    // Navigate to Step 3 (Dimensions)
    await page.getByTestId("wizard-next").click(); // Location → Boundary
    await page.getByTestId("wizard-next").click(); // Boundary → Dimensions

    await page.getByTestId("wizard-width").fill("25");
    await page.getByTestId("wizard-height").fill("15");
    await page.getByTestId("wizard-next").click(); // Dimensions → Style
    await page.getByTestId("wizard-back").click(); // Style → Dimensions

    // Values should be preserved
    await expect(page.getByTestId("wizard-width")).toHaveValue("25");
    await expect(page.getByTestId("wizard-height")).toHaveValue("15");
  });

  test("Google Maps boundary step loads map when API key is present", async ({ page }) => {
    // Intercept the Google Maps script to prevent real network request
    await page.route("**/maps.googleapis.com/maps/api/js*", (route) =>
      route.fulfill({ status: 200, contentType: "text/javascript", body: "/* mocked */" }),
    );

    // Set a fake API key in localStorage so the wizard shows the Google Maps branch
    await page.evaluate(() => {
      localStorage.setItem("mitygarden_google_maps_key", "FAKE_TEST_KEY");
    });

    // Reload so the app picks up the new localStorage key
    await page.reload();

    // Inject mock google.maps BEFORE opening the wizard (so loadGoogleMapsScript resolves)
    await page.evaluate(() => {
      const noop = (): void => {};
      class FakeMap {
        constructor(_el: HTMLElement, _opts: unknown) {}
        fitBounds = noop;
        addListener = noop;
      }
      class FakePolygon {
        constructor(_opts: unknown) {}
        setMap = noop;
        getPath() {
          return { getArray: () => [] };
        }
      }
      class FakePolyline {
        constructor(_opts: unknown) {}
        setMap = noop;
        setPath = noop;
      }
      class FakeLatLngBounds {
        extend = noop;
      }
      const mapsLib = {
        Map: FakeMap,
        Polygon: FakePolygon,
        Polyline: FakePolyline,
      };
      const coreLib = {
        LatLngBounds: FakeLatLngBounds,
      };

      (window as any).google = {
        maps: {
          ...mapsLib,
          LatLngBounds: FakeLatLngBounds,
          importLibrary: (name: string) => {
            if (name === "maps") return Promise.resolve(mapsLib);
            if (name === "core") return Promise.resolve(coreLib);
            return Promise.resolve({});
          },
        },
      };
    });

    await page.getByTestId("new-project-btn").click();
    await expect(page.getByTestId("project-wizard")).toBeVisible();

    // Step 1: Location → Step 2: Boundary
    await page.getByTestId("wizard-next").click();
    await expect(page.getByTestId("wizard-step-boundary")).toBeVisible();

    // The map div should render (Google Maps mode with apiKey)
    const mapContainer = page.getByTestId("wizard-gmaps-container");
    await expect(mapContainer).toBeVisible({ timeout: 5000 });

    // Collect console errors to verify no "Map is not a constructor"
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.waitForTimeout(500);
    const mapConstructorErrors = errors.filter((e) => e.includes("Map is not a constructor"));
    expect(mapConstructorErrors).toHaveLength(0);
  });
});
