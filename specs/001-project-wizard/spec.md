# Feature Spec: Project Creation Wizard

## User Story

> As a garden designer, I want to create a new garden project by answering a few guided questions about my garden's size, style, and goals, so that I can start designing immediately with an appropriately configured canvas.

## Acceptance Criteria

### AC-001: Start wizard
- Given I am on the home page
- When I click "New Garden" or "Create My First Garden"
- Then a modal wizard opens at Step 1 (Location)

### AC-002: Step 1 — Location (optional)
- Address text input is shown with a search button
- After searching, a map preview is displayed
- Clicking "Next" advances to Step 2

### AC-003: Step 2 — Garden Boundary (optional)
- If `VITE_GOOGLE_MAPS_API_KEY` is configured, an interactive Google Maps view is shown
- User can draw a polygon to trace their garden outline
- After drawing, width/height (bounding box) and area are displayed
- If no API key, a message explains the feature requires configuration
- Clicking "Next" advances to Step 3

### AC-004: Step 3 — Dimensions
- Width and height inputs are visible (default 20m × 15m, or pre-filled from boundary)
- If boundary was drawn, an info note indicates the values were auto-calculated
- User can switch between metric (meters) and imperial (feet)
- Inputs accept numeric values between 1 and 500
- Clicking "Next" advances to Step 4

### AC-005: Step 4 — Garden Style
- Seven style options are displayed (Modern, Classic, Japanese, Mediterranean, English, Minimal, Custom)
- Selected style is visually highlighted
- Clicking "Next" advances to Step 5

### AC-006: Step 5 — Goals
- Eight goal checkboxes are shown
- Multiple goals can be selected simultaneously
- Clicking "Create Garden" creates the project and opens the canvas

### AC-007: Navigation
- "Back" button is hidden on Step 1
- "Back" button is visible on Steps 2-5
- "Cancel" button dismisses the wizard without creating a project
- Progress bar shows correct fill based on current step

### AC-008: Project creation
- After completing the wizard, a new `GardenProject` is created in the store
- User is navigated to the design canvas
- The canvas shows the garden boundary with correct dimensions

## Requirements

- REQ-WIZ-01: Wizard MUST have exactly 5 steps
- REQ-WIZ-02: All wizard state MUST be managed in `uiStore.wizard`
- REQ-WIZ-03: Project creation MUST call `projectStore.newProject()`
- REQ-WIZ-04: Wizard MUST be accessible via keyboard (Tab, Enter, Escape)
- REQ-WIZ-05: Wizard MUST render correctly in all three supported locales (en/nl/fr)

## Test IDs (for E2E)

| Element | data-testid |
|---------|-------------|
| Wizard modal | `project-wizard` |
| Step 1 container | `wizard-step-dimensions` |
| Width input | `wizard-width` |
| Height input | `wizard-height` |
| Step 2 container | `wizard-step-style` |
| Style button (template) | `wizard-style-{style}` |
| Step 4 container | `wizard-step-goals` |
| Goal checkbox (template) | `wizard-goal-{goal}` |
| Step 5 container | `wizard-step-location` |
| Address input | `wizard-address-input` |
| Back button | `wizard-back` |
| Next button | `wizard-next` |
| Finish button | `wizard-finish` |

## Success Metrics

- Wizard completion rate ≥ 80% of opens
- E2E test for full wizard flow passes in CI
- All 5 steps render without errors in all locales
