# Feature Spec: Garden Design Canvas

## User Story

> As a garden designer, I want to place, move, and delete garden elements on a 2D canvas that represents my garden to scale, so that I can visualise and plan my garden layout interactively.

## Acceptance Criteria

### AC-001: Canvas initialisation
- Given a garden project is open
- When the design page loads
- Then a canvas is displayed matching the project's dimensions
- And a green boundary rectangle is visible representing the garden area

### AC-002: Place element from asset library
- Given the "Place" tool is active
- When I click an asset in the asset library panel
- And click on the canvas
- Then a new garden element appears at the clicked position

### AC-003: Select element
- Given elements exist on the canvas
- When I click an element
- Then it becomes selected (visible selection handles)
- And its properties appear in the properties panel

### AC-004: Move element
- Given an element is selected
- When I drag it on the canvas
- Then it moves to the new position
- And the project is marked as dirty (unsaved)

### AC-005: Delete element
- Given an element is selected
- When I press Delete or Backspace
- Then the element is removed from the canvas

### AC-006: Undo/Redo
- Given I have performed an action (add/move/delete)
- When I click Undo (or Ctrl+Z)
- Then the last action is reversed
- When I click Redo (or Ctrl+Shift+Z)
- Then the action is re-applied

### AC-007: Pan and zoom
- User can pan by clicking and dragging with the Pan tool
- User can zoom with the scroll wheel or pinch gesture
- Zoom level is clamped between 10% and 1000%

### AC-008: Grid snap
- When grid snap is enabled
- Elements snap to the nearest grid point during placement and movement
- Default grid size is 1 metre

## Requirements

- REQ-CNV-01: Canvas MUST use `react-konva` (web/desktop) or WebView wrapper (mobile)
- REQ-CNV-02: Canvas scale MUST be 50px per metre at 100% zoom
- REQ-CNV-03: All element mutations MUST go through `projectStore` actions
- REQ-CNV-04: Undo/redo history MUST be capped at 100 actions
- REQ-CNV-05: Canvas MUST support at least 200 simultaneous elements without frame drops

## Test IDs (for E2E)

| Element | data-testid |
|---------|-------------|
| Canvas area | `canvas-area` |
| Undo button | `toolbar-undo` |
| Redo button | `toolbar-redo` |

## Success Metrics

- Place, move, delete cycle completes without errors in E2E test
- Undo/redo maintains correct state through 10 sequential actions
- Canvas renders at ≥ 30fps with 100 elements (Lighthouse performance test)
