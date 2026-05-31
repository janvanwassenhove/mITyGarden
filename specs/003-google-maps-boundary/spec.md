# Feature Spec: Google Maps Garden Boundary Drawing

## User Story

> As a garden designer, I want to draw the outline of my garden on Google Maps before entering dimensions, so that the app can automatically calculate the correct dimensions — even for irregular, multi-sided or curved gardens.

## Acceptance Criteria

### AC-001: Location first

- Given I open the new project wizard
- When Step 1 is shown
- Then I see the Location step (address search + map preview) before the Boundary and Dimensions steps

### AC-002: Boundary step after Location

- Given I complete or skip the Location step
- When I click "Next"
- Then I am shown the Garden Boundary step (Step 2)

### AC-003: Google Maps not configured — Leaflet satellite fallback

- Given `GOOGLE_MAPS_API_KEY` is not set
- When the Boundary step is shown
- Then a Leaflet map with free ESRI satellite imagery is displayed (no API key required)
- And the user can click to place polygon vertices and close the shape
- And dimensions are auto-calculated the same way as with the Google Maps version

### AC-004: Interactive boundary map

- Given `GOOGLE_MAPS_API_KEY` is set
- When the Boundary step is shown
- Then a Google Maps satellite view is rendered, centred on the previously searched address (or default region if no address)
- And a polygon drawing tool is active

### AC-005: Draw non-rectangular boundary

- Given the map is shown with the drawing tool
- When the user clicks multiple points to form a polygon (including many-sided / curved shapes)
- Then the polygon is drawn on the map in green
- And the polygon is stored in wizard state as a series of lat/lng coordinates

### AC-006: Auto-calculate dimensions

- Given a polygon has been drawn
- When the polygon is completed
- Then the app calculates the bounding box of the polygon in metres
- And the Dimensions step is pre-filled with width (east–west) and height (north–south) in metres
- And the actual polygon area is displayed in m²

### AC-007: Clear and redraw

- Given a boundary has been drawn
- When the user clicks "Clear & redraw"
- Then the drawn polygon is removed
- And the drawing tool is reset so a new polygon can be drawn

### AC-008: Boundary stored on project creation

- Given a boundary polygon was drawn
- When the wizard is completed
- Then the new `GardenProject.mapData.boundary` contains the recorded polygon coordinates

### AC-009: Dimensions remain editable

- Given dimensions were auto-filled from the boundary
- When the user reaches the Dimensions step
- Then an info note indicates the values were calculated from the boundary
- And the width and height inputs are still editable so the user can fine-tune them

## Requirements

- REQ-BOUNDARY-01: The wizard MUST show Location before Boundary before Dimensions.
- REQ-BOUNDARY-02: The boundary step MUST work in a degraded (manual-skip) mode when no Google Maps API key is configured.
- REQ-BOUNDARY-03: The Google Maps JS API (with `drawing` library) MUST be loaded dynamically only when the step is rendered and an API key is available.
- REQ-BOUNDARY-04: The bounding box calculation MUST use geodetic distance (degrees × metres-per-degree) to return metres, not degrees.
- REQ-BOUNDARY-05: The polygon area MUST be calculated using the shoelace formula in local metric coordinates.
- REQ-BOUNDARY-06: The drawn polygon SHOULD be re-displayed if the user navigates back to the Boundary step.
- REQ-BOUNDARY-07: The wizard total step count MUST remain 5 (the Structures placeholder step is replaced by this Boundary step).

## Test IDs

| Element               | data-testid            |
| --------------------- | ---------------------- |
| Boundary step wrapper | `wizard-step-boundary` |

## Success Metrics

- Users who have a Google Maps API key can draw an irregular garden shape and arrive at the Dimensions step with width/height pre-filled.
- Users without a Google Maps key see a clear message and can proceed manually.
