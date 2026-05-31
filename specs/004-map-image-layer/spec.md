# Feature Spec: Map Image Layer

## User Story

> As a garden designer, I want to keep the satellite or uploaded map image visible as a toggleable background layer on the design canvas, so that I can use it as a reference while placing garden elements.

## Acceptance Criteria

### AC-001: Map image captured on project creation

- Given the user draws a boundary on the satellite map (Leaflet ESRI or Google Maps) in the wizard
- When the polygon is completed and "Finish" is clicked
- Then the project stores a URL pointing to a static satellite image of the boundary area

### AC-002: Uploaded image captured on project creation

- Given the user uploads an image and traces a boundary on it in the wizard
- When the scale is calculated and "Finish" is clicked
- Then the project stores the uploaded image (cropped to the traced bounding box) as a Base64 data URL

### AC-003: Map image layer shown on canvas

- Given a project has a stored map image
- When the design canvas is opened
- Then the map image is displayed as a background layer below all garden elements, stretched to fit the garden dimensions

### AC-004: Map layer visible by default

- Given a project has a stored map image
- When the canvas first loads
- Then the map layer is visible (default: on)

### AC-005: Toggle map layer visibility

- Given a project has a stored map image
- When the user clicks the "Map Layer" toggle button in the canvas toolbar
- Then the map image layer is hidden
- And the button reflects the hidden state
- When the user clicks again
- Then the map layer becomes visible again

### AC-006: No map layer when no image stored

- Given a project has no stored map image (created manually without wizard boundary)
- When the design canvas is opened
- Then the map layer toggle button is absent or disabled

## Requirements

- REQ-MAPLAYER-01: `GardenProject` MUST have an optional `mapImageUrl: string` field; this is populated by the wizard and MUST NOT be set manually.
- REQ-MAPLAYER-02: The map image MUST be rendered on a dedicated Konva Layer positioned between the grid background and the garden boundary layer.
- REQ-MAPLAYER-03: The map image MUST be scaled to cover exactly the garden bounding box (0,0) → (width m, height m), matching the garden canvas dimensions.
- REQ-MAPLAYER-04: The `mapLayerVisible` toggle MUST live in `canvasStore`, not in the project model.
- REQ-MAPLAYER-05: For satellite map mode (Leaflet ESRI), the stored URL MUST be an ArcGIS World Imagery MapServer export URL with no authentication required.
- REQ-MAPLAYER-06: For Google Maps mode, the stored URL MAY contain the Google Maps Static API key; this is acceptable as the key is already bundled in the frontend.
- REQ-MAPLAYER-07: For image trace mode, the stored value MUST be a Base64 JPEG data URL of the uploaded image cropped to the traced boundary bounding box.

## Test IDs

| Element                 | data-testid                |
| ----------------------- | -------------------------- |
| Map layer toggle button | `toolbar-toggle-map-layer` |

## Success Metrics

- When a project with a map image is opened, the satellite image is visible under all garden elements without affecting element interaction.
- Toggling the map layer hides/shows the image in under 100 ms.
