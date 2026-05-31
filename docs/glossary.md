# mITyGarden Glossary

Terms used in specs, ADRs, code, and documentation. When in doubt, use these definitions — do not introduce synonyms.

---

## Domain terms

### Asset

A named, typed, reusable **definition** of a garden element — e.g. "Oak Tree", "Swimming Pool", "Wooden Deck". An asset carries default dimensions, an SVG thumbnail, localised labels, and type/category metadata. Assets are defined in `packages/asset-library` and are never mutated at runtime.

> Contrast with **Element** (a placed instance of an asset).

### Boundary

A closed polygon (series of `{ lat, lng }` coordinates) traced on a satellite map to represent the real-world outline of the garden. Stored in `GardenProject.mapData.boundary`. May be irregular or many-sided. See [spec 003](../specs/003-google-maps-boundary/spec.md).

### Bounding Box

The smallest axis-aligned rectangle that contains the **Boundary** polygon. Used to auto-calculate the **Dimensions** (width = east–west extent in metres, height = north–south extent in metres).

### Custom Label

A user-overridden display name for a placed **Element** (`GardenElement.customLabel`). When set (non-empty string), it replaces the asset's default localised name on the canvas. When empty or absent, the asset's default label is shown.

### Dimensions

The width and height of a garden in the active **Unit System**. Stored as `GardenProject.dimensions: { width, height }` always in the user's chosen unit (metric = metres, imperial = feet).

### Dirty

A project that has unsaved changes — `projectStore.isDirty === true`. The auto-save debounce triggers 2 seconds after the last mutation. Visual indicator: a dot or "Unsaved" label in the toolbar.

### Element

A placed **instance** of an **Asset** on the canvas. Each element has a unique `id`, `position`, `size`, `rotation`, `zIndex`, and optional `customLabel`. Elements live inside **Layers**. Mutations go through `projectStore` actions.

### Garden Goal

One of eight user-selected purposes for the garden: `pool`, `playground`, `terrace`, `plants`, `low-maintenance`, `vegetable-garden`, `outdoor-dining`, `other`. Stored in `GardenProject.goals`.

### Garden Project

The top-level entity representing one garden design. Contains: name, dimensions, unit system, style, goals, layers (with elements), and map data. Identified by a UUID. Serialised to JSON for persistence and export.

### Garden Style

One of seven aesthetic presets: `modern`, `classic`, `japanese`, `mediterranean`, `english`, `minimal`, `custom`. Influences LLM suggestions and future style-based asset filtering.

### Grid Snap

A mode where elements automatically align to the nearest grid point during placement and drag. Grid size defaults to 1 metre. Controlled by `canvasStore.snapEnabled` and `canvasStore.gridSize`.

### Layer

A named, ordered group of **Elements** within a **Garden Project**. Layers have `visible` and `locked` flags. Analogous to layers in image-editing software. Stored in `GardenProject.layers[]`.

### Map Data

Geographic metadata attached to a **Garden Project**: address string, centre coordinates `{ lat, lng }`, and the **Boundary** polygon. Stored in `GardenProject.mapData`.

### PPM (Pixels Per Metre)

The base canvas scale factor: **50 px per metre** at 100% zoom. All world-coordinate ↔ pixel conversions use `metersToPixels(m, ppm)` and `pixelsToMeters(px, ppm)` from `packages/domain`. Defined as `BASE_PIXELS_PER_METER = 50`.

### Unit System

`"metric"` (metres) or `"imperial"` (feet). Stored on the project and used for display and input. Internal calculations always operate in metres regardless of display unit.

---

## Technical terms

### AC (Acceptance Criterion)

A testable condition in a **Spec** file, written in Given/When/Then format. Identified as `AC-NNN`. Every AC that can be automated must have a corresponding E2E test.

### ADR (Architecture Decision Record)

A document in `docs/adr/` recording a significant technical or architectural decision — its context, what was decided, alternatives considered, and consequences. See [docs/adr/README.md](adr/README.md).

### contextBridge

The Electron API that safely exposes main-process functions to the renderer via `window.mityGardenDesktop.*`. Defined in `apps/desktop/src/preload/index.ts`. Nothing may be exposed through it without an explicit allow-list.

### IPC (Inter-Process Communication)

The channel between the Electron main process (Node.js) and the renderer (browser context). Used for database operations (`window.mityGardenDesktop.db.*`) and the optional LLM path (`ipcMain` handler `llm:complete`).

### NoOp Provider

A fallback implementation of `LLMProvider` or `ImageGenerationProvider` that is used when no API key is configured. Throws a descriptive error that the UI catches and displays as a user-friendly message.

### PPM

See **Pixels Per Metre**.

### Preload

The Electron preload script (`apps/desktop/src/preload/index.ts`) that runs in a sandboxed context with access to both Node.js and the DOM. Its only job is to expose a curated API to the renderer via `contextBridge`.

### REQ (Requirement)

A must/should/may statement in a **Spec** file. Identified as `REQ-<TAG>-NN`. Requirements govern _how_ the feature is built; ACs govern _what_ it does.

### Repository

The `ProjectRepository` interface in `packages/persistence`. All storage operations go through this interface. Concrete adapters: `IndexedDBRepository` (web), `ElectronRepository` (desktop IPC → SQLite), `AsyncStorageRepository` (mobile, Milestone 8).

### Spec

A feature specification file at `specs/<NNN>-<slug>/spec.md`. Contains user story, acceptance criteria, requirements, test IDs, and success metrics. Specs are the source of truth; code is the implementation.

### Store

A Zustand vanilla store (`createStore` from `zustand/vanilla`). There are three stores: `projectStore`, `canvasStore`, `uiStore` — all in `packages/domain`. React components access them through selector hooks; non-React code calls `store.getState()` directly.

### Transformer

The react-konva `<Transformer>` component that renders resize handles and a rotation handle around the selected canvas **Element**. On `onTransformEnd`, the new position/size/rotation must be written back to `projectStore`.
