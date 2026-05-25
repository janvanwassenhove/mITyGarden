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
│   ├── asset-library/         # 30+ garden asset definitions
│   ├── persistence/           # Repository interfaces + IndexedDB adapter
│   ├── maps/                  # Modular maps adapter interface
│   ├── llm/                   # Multi-LLM provider abstraction
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
llm              ← (standalone, desktop-only)
shared-ui        ← domain (wizard, hooks)
web              ← all packages
desktop          ← web (renderer) + llm (main process)
mobile           ← domain, i18n, asset-library, shared-ui
```

## State Management

All state lives in **Zustand vanilla stores** in `packages/domain`:

| Store | Purpose |
|-------|---------|
| `projectStore` | Active `GardenProject`, undo/redo history |
| `canvasStore` | Viewport (pan/zoom), tool selection |
| `uiStore` | Locale, theme, wizard state, panel visibility |

React components consume stores via hooks in `packages/shared-ui`:
- `useProjectStore(selector?)` 
- `useUiStore(selector?)`
- `useCanvasStore(selector?)` (canvas-engine)

## Canvas Architecture

**Web/Desktop**: `react-konva` renders directly on `<canvas>` via `Stage > Layer > Rect/Circle/Image` nodes.

**Mobile**: A `WebView` wraps the same Konva bundle served from the Vite build. Communication via `postMessage` / `window.ReactNativeWebView`.

Future upgrade path: `react-native-skia` for native mobile rendering.

## Persistence Strategy (Local-First)

| Platform | Adapter |
|----------|---------|
| Web | `IndexedDBRepository` (IndexedDB) |
| Desktop | `SQLiteRepository` (better-sqlite3) — _Milestone 4_ |
| Mobile | `AsyncStorageRepository` (MMKV) — _Milestone 8_ |

All adapters implement the `ProjectRepository` interface. Cloud sync is defined via `CloudSyncAdapter` interface but not implemented in v1 (uses `NoOpCloudSyncAdapter`).

## LLM Integration (Desktop-Only)

API keys are **never sent to the renderer process**. The flow:
1. Electron reads `MITY_GARDEN_OPENAI_API_KEY` / `MITY_GARDEN_ANTHROPIC_API_KEY` from env
2. `ipcMain` handles `llm:complete` — makes the HTTP request in the Node.js main process
3. Only the text response is sent back via IPC

Supported providers: OpenAI (gpt-4o-mini default), Anthropic (claude-3-haiku default).

## Internationalisation

`packages/i18n` uses **i18next** with three locale namespaces (`common`). All UI strings are keyed. The `createI18n(config?)` factory initialises the instance; `getSharedI18n()` returns the singleton for components.

## Development Milestones

| # | Feature | Status |
|---|---------|--------|
| 0 | Foundation (monorepo, packages, CI) | ✅ Complete |
| 1 | Project Wizard | 🔄 In Progress |
| 2 | Asset Library Panel | 🔲 Planned |
| 3 | Konva Canvas (place/move/delete) | 🔲 Planned |
| 4 | Desktop (Electron + SQLite) | 🔲 Planned |
| 5 | Export (PNG/JSON/PDF proposal) | 🔲 Planned |
| 6 | Google Maps Integration | 🔲 Planned |
| 7 | LLM Garden Suggestions | 🔲 Planned |
| 8 | Mobile (Expo) | 🔲 Planned |
