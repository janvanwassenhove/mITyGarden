# Feature Spec: Editable Project Name in Toolbar

## User Story

> As a garden designer, I want to see my project name in the toolbar and be able to rename it inline, so that I can quickly identify and rename my project without opening a separate dialog.

## Acceptance Criteria

### AC-001: Display project name when a project is open
- Given a garden project is open
- When the app header is visible
- Then the project name is displayed in the toolbar between the logo and the action buttons

### AC-002: No project name shown when no project is open
- Given no project is currently open
- When the app header is visible
- Then no project name element is rendered in the toolbar

### AC-003: Click to edit
- Given a project is open and the project name is visible in the toolbar
- When the user clicks the project name display
- Then an inline text input appears pre-filled with the current project name

### AC-004: Save on blur or Enter
- Given the project name input is active
- When the user presses Enter or clicks away (blur)
- Then the trimmed input value is saved via `updateProject({ name })` if non-empty
- And the input is replaced by the updated project name display

### AC-005: Cancel on Escape
- Given the project name input is active
- When the user presses Escape
- Then the input is dismissed without saving
- And the original project name is shown again

### AC-006: Empty name not saved
- Given the project name input is active
- When the user clears the input and presses Enter or blurs
- Then the name is NOT updated (the original name is retained)
- And the input is dismissed

### AC-007: Auto-focus input on edit start
- Given the user clicks the project name to edit
- When the input appears
- Then it is automatically focused and its text is selected

## Requirements

- REQ-PTB-01: The project name display and input MUST be rendered inside the existing app header element (`data-testid="app-header"`)
- REQ-PTB-02: Name updates MUST go through the `updateProject` store action — never mutate state directly
- REQ-PTB-03: The edit input MUST have a maximum length of 100 characters
- REQ-PTB-04: All visible strings MUST use i18n keys from the `common` namespace

## Test IDs (for E2E)

| Element                  | data-testid           |
|--------------------------|-----------------------|
| Project name display     | `project-name-display` |
| Project name edit input  | `project-name-input`   |

## Success Metrics

- Project name is visible in the toolbar whenever a project is open
- Inline rename round-trip (click → type → Enter) takes under 2 seconds
