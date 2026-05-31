# mITyGarden Architecture

## Overview

mITyGarden is a cross-platform garden design application built as a **pnpm monorepo** with shared packages powering three deployment targets.

## Monorepo Structure

```
mITyGarden/
├── packages/                  # Shared libraries
│   ├── domain/                # Core types, stores, business logic
│   ├── i18n/                  # Internationalization (en/nl/fr)
│   ├── canvas-engine/         # Konva-based 2D canvas component
│   ├── asset-library/         # 60+ garden asset definitions
│   ├── persistence/           # Repository interfaces + IndexedDB adapter
│   ├── maps/                  # Modular maps adapter interface
│   ├── llm/                   # Multi-LLM provider abstraction + AI render pipeline
│   └── shared-ui/             # Shared React components (wizard, hooks)
├── apps/
│   ├── web/                   # Vite + React SPA
│   ├── desktop/               # Electron wrapping web bundle
│   └── mobile/                # Expo (React Native) with WebView canvas
└── tests/
    └── e2e/                   # Playwright end-to-end tests
```

## Package Dependencies

```
domain           ← standalone (Zustand stores, types)
i18n             ← standalone
asset-library    ← domain
canvas-engine    ← domain, react-konva
persistence      ← domain
maps             ← domain
llm              ← domain (AI render pipeline: scene builder, prompt builder, asset descriptions)
shared-ui        ← domain, llm, canvas-engine (wizard, hooks, AI render panel)
web              ← all packages
desktop          ← web (renderer) + llm (main process)
mobile           ← domain, i18n, asset-library, shared-ui
```

## State Management

All state lives in **Zustand vanilla stores** in `packages/domain`:

| Store          | Purpose                                       |
| -------------- | --------------------------------------------- |
| `projectStore` | Active `GardenProject`, undo/redo history     |
| `canvasStore`  | Viewport (pan/zoom), tool selection           |
| `uiStore`      | Locale, theme, wizard state, panel visibility |

React components consume stores via hooks in `packages/shared-ui`:

- `useProjectStore(selector?)`
- `useUiStore(selector?)`
- `useCanvasStore(selector?)` (canvas-engine)

## Canvas Architecture

**Web/Desktop**: `react-konva` renders directly on `<canvas>` via `Stage > Layer > Rect/Circle/Image` nodes.

**Mobile**: A `WebView` wraps the same Konva bundle served from the Vite build. Communication via `postMessage` / `window.ReactNativeWebView`.

Future upgrade path: `react-native-skia` for native mobile rendering.

## Persistence Strategy (Local-First)

| Platform | Adapter                                                       |
| -------- | ------------------------------------------------------------- |
| Web      | `IndexedDBRepository` (IndexedDB)                             |
| Desktop  | `ElectronRepository` (IPC → `better-sqlite3` in main process) |
| Mobile   | `AsyncStorageRepository` (MMKV) — _Milestone 8_               |

All adapters implement the `ProjectRepository` interface. Cloud sync is defined via `CloudSyncAdapter` interface but not implemented in v1 (uses `NoOpCloudSyncAdapter`).

## LLM Integration

mITyGarden supports LLM features on **both web and desktop**.

**Web / Desktop renderer**: API keys are supplied via `VITE_*` build-time env vars or persisted in `localStorage` through the `ApiKeySettingsModal`. The `packages/llm` factory (`createLLMProvider`) picks OpenAI → Anthropic → NoOp in priority order.

**Desktop main process (Electron)**: The `ipcMain` handler `llm:complete` is also available for future server-side key management. In this path API keys are read from `MITY_GARDEN_*` env vars and the HTTP request is made in the Node.js main process — the renderer only receives the text response.

Supported text providers: OpenAI (`gpt-4o-mini` default), Anthropic (`claude-3-haiku` default).
Supported image providers: DALL·E 3 (via `DalleProvider`), Gemini Imagen (via `GeminiImageProvider`). See [llm-integration.md](llm-integration.md) for full details.

## Internationalisation

`packages/i18n` uses **i18next** with three locale namespaces (`common`). All UI strings are keyed. The `createI18n(config?)` factory initialises the instance; `getSharedI18n()` returns the singleton for components.

## Development Milestones

| #   | Feature                                   | Spec                                                  | Status      |
| --- | ----------------------------------------- | ----------------------------------------------------- | ----------- |
| 0   | Foundation (monorepo, packages, CI)       | —                                                     | ✅ Complete |
| 1   | Project Creation Wizard                   | [spec 001](../specs/001-project-wizard/spec.md)       | ✅ Complete |
| 2   | Asset Library Panel                       | —                                                     | ✅ Complete |
| 3   | Garden Canvas (place/move/delete/undo)    | [spec 002](../specs/002-garden-canvas/spec.md)        | ✅ Complete |
| 4   | Desktop — Electron + SQLite               | —                                                     | ✅ Complete |
| 5   | Export (JSON + text proposal)             | —                                                     | ✅ Complete |
| 6   | Google Maps Boundary Drawing              | [spec 003](../specs/003-google-maps-boundary/spec.md) | ✅ Complete |
| 7   | LLM Garden Suggestions + Image Generation | —                                                     | ✅ Complete |
| 8   | Mobile (Expo)                             | —                                                     | 🔲 Planned  |
