# Feature Spec: AI Render Pipeline

## User Story

> As a garden designer, I want a rich AI-powered image generation flow, so that I can produce photorealistic visualizations of my garden design from multiple camera angles with precise layout control.

## Acceptance Criteria

### AC-001: Scene model from garden JSON

- Given a garden project with elements, boundary, style, and goals
- When the user opens the Visualize tab
- Then a normalized `ImageGenerationScene` is built from the project data with view, enhancements, strictness, boundary, and element descriptions

### AC-002: Rich natural-language prompt

- Given a scene model with camera, strictness, and element descriptions
- When a prompt is built from the scene
- Then the output is a structured multi-section natural-language prompt (no raw JSON) covering role, camera, site, strictness, elements, materials, and negative constraints

### AC-003: Reference image generation

- Given a garden project with visible elements
- When the user clicks "Preview Reference Layout"
- Then a simplified top-down PNG reference image is rendered using headless Konva showing boundary, elements (color-coded by type), north arrow, and scale bar

### AC-004: Multi-step render settings wizard

- Given the Visualize tab in the AI panel
- When the user navigates the wizard steps
- Then they can configure: view mode (drone/eye-level/top-down/cinematic), realism level, strictness, camera height/angle/direction, lens, time of day, season, and enhancement toggles

### AC-005: Settings persistence

- Given the user has configured render settings
- When they revisit the Visualize tab (same session or later)
- Then their previous settings are restored from localStorage

### AC-006: Image generation with reference image

- Given a provider that supports reference images (GPT Image 1)
- When the user clicks "Generate AI Render"
- Then a reference layout image is automatically generated and passed alongside the prompt to the image provider

### AC-007: Provider reference image capability

- Given different image providers
- When checking `supportsReferenceImage()`
- Then DalleProvider returns true (for gpt-image-1), GeminiImageProvider returns false, and NoOpImageProvider returns false

### AC-008: Backward compatibility

- Given existing code using `GardenImageService.buildPrompt()` and `generateFromProject()`
- When no changes are made to the calling code
- Then the old methods continue to work unchanged

### AC-009: i18n support

- Given all new UI strings in the AI render panel
- When the interface language is set to en, nl, or fr
- Then all labels, options, and messages are properly translated

## Requirements

- REQ-PROMPT-01: MUST produce prompts that never contain raw JSON, array brackets, or object braces
- REQ-PROMPT-02: MUST include negative constraints to prevent unrealistic output
- REQ-SCENE-01: MUST normalize all garden elements into rich visual descriptions with position and size context
- REQ-SCENE-02: MUST support all 45 asset types from the asset library
- REQ-REF-01: MUST generate a reference image using headless Konva without requiring a mounted React component
- REQ-REF-02: SHOULD include north arrow, scale bar, and color-coded element types
- REQ-UI-01: MUST use i18n for all user-visible strings
- REQ-UI-02: MUST persist settings in localStorage
- REQ-PROVIDER-01: MUST not break existing provider implementations
- REQ-PROVIDER-02: SHOULD pass reference image to providers that support it

## Test IDs (for E2E)

| Element                   | data-testid               |
| ------------------------- | ------------------------- |
| AI Render panel container | ai-render-panel           |
| Generate button           | ai-render-generate-btn    |
| Generated image           | ai-render-generated-image |

## Success Metrics

- All 27 unit tests pass (assetDescriptions, sceneBuilder, promptBuilder)
- All packages typecheck cleanly (excluding pre-existing mobile issues)
- Generated prompts are >200 characters with structured sections
- Reference images render in <1s for typical gardens
