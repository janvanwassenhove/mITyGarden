# Feature Spec: Terrain Features

## User Story

> As a garden designer, I want to place terrain modifications (wadi, slope, pond, raised bed, sunken area, berm) on the canvas, so that I can model the topography and water management of the garden.

## Acceptance Criteria

### AC-001: Terrain element type available in asset library

- Given the asset library panel is open
- When the user scrolls or searches
- Then a "Terrain" category is visible containing terrain assets (wadi, slope, pond, raised bed, sunken area, berm)

### AC-002: Place terrain element on canvas

- Given a terrain asset is selected in the library
- When the user clicks on the canvas
- Then the terrain element is placed at the clicked position with its default size

### AC-003: Terrain elements are resizable

- Given a terrain element is selected on the canvas
- When the user drags the resize handles
- Then the element resizes within its min/max bounds

### AC-004: Terrain elements support undo/redo

- Given a terrain element has been placed
- When the user presses Ctrl+Z
- Then the element placement is undone

### AC-005: Terrain elements persist with project

- Given a project contains terrain elements
- When the project is saved and reopened
- Then all terrain elements are restored at their correct positions and sizes

## Requirements

- REQ-TER-01: MUST add `"terrain"` to the `ElementType` union in domain types.
- REQ-TER-02: MUST provide at least 6 terrain asset definitions: wadi, slope, pond, raised bed, sunken area, berm.
- REQ-TER-03: MUST provide SVG thumbnails for all terrain assets.
- REQ-TER-04: MUST add i18n labels for all three locales (en, nl, fr).
- REQ-TER-05: MUST add the `"terrain"` category to the asset library i18n keys.
- REQ-TER-06: MUST add a fallback fill color for terrain elements in the canvas renderer.
- REQ-TER-07: All terrain assets SHOULD be resizable and rotatable.

## Test IDs (for E2E)

| Element                 | data-testid                |
| ----------------------- | -------------------------- |
| Terrain category header | `asset-category-terrain`   |
| Wadi asset card         | `asset-card-terrain-wadi`  |
| Slope asset card        | `asset-card-terrain-slope` |
| Pond asset card         | `asset-card-terrain-pond`  |

## Success Metrics

- All 6 terrain assets render correctly in the asset library panel.
- Terrain elements can be placed, moved, resized, and deleted on the canvas.
- Undo/redo works for all terrain element operations.
