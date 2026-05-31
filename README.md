# mITyGarden 🌿

**Cross-platform garden design application** — design your garden in 2D with an intuitive drag-and-drop canvas, smart asset library, and AI-powered suggestions.

[![CI](https://github.com/your-org/mITyGarden/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/mITyGarden/actions/workflows/ci.yml)
[![Deploy Web](https://github.com/your-org/mITyGarden/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/your-org/mITyGarden/actions/workflows/deploy-web.yml)

## Screenshots

_Screenshots coming in Milestone 3 (interactive canvas)._

<!-- docs/screenshots/home.png -->
<!-- docs/screenshots/wizard.png -->
<!-- docs/screenshots/canvas.png -->

## Features

- 🗺️ **2D Garden Canvas** — Konva-based drag-and-drop design surface
- 📐 **Project Wizard** — 5-step guided setup (dimensions, style, structures, goals, location)
- 🌱 **30+ Assets** — Pools, trees, plants, terraces, furniture, paths, buildings and more
- 🤖 **AI Suggestions** — Multi-LLM (OpenAI / Anthropic) layout recommendations (desktop-only)
- 🗺️ **Google Maps** — Import garden boundary from satellite view (Milestone 6)
- 💾 **Local-First** — IndexedDB (web), SQLite (desktop) — works offline
- 🌍 **Multilingual** — English, Nederlands, Français
- 📦 **Export** — PNG, JSON, PDF proposal (Milestone 5)

## Platforms

| Platform   | Tech                          | Status         |
| ---------- | ----------------------------- | -------------- |
| 🌐 Web     | Vite + React + react-konva    | Milestone 0 ✅ |
| 🖥️ Desktop | Electron + better-sqlite3     | Milestone 4    |
| 📱 Mobile  | Expo (React Native + WebView) | Milestone 8    |

## Quick Start

```bash
# Prerequisites: Node.js ≥ 22, pnpm ≥ 10
git clone https://github.com/your-org/mITyGarden.git
cd mITyGarden
pnpm install

# Start web dev server
pnpm --filter @mity-garden/web dev
# Open http://localhost:5173
```

## Tech Stack

| Layer       | Technology                             |
| ----------- | -------------------------------------- |
| Frontend    | React 19, Vite 6, React Router 7       |
| Canvas      | react-konva 18, Konva 9                |
| State       | Zustand 5 (vanilla + React hooks)      |
| i18n        | i18next 24, react-i18next 15           |
| Desktop     | Electron 34, electron-builder          |
| Mobile      | Expo SDK 53, React Native 0.79         |
| Persistence | IndexedDB (web), SQLite (desktop)      |
| LLM         | OpenAI API, Anthropic API              |
| Testing     | Vitest 3 (unit), Playwright 1.50 (E2E) |
| CI/CD       | GitHub Actions, GitHub Pages           |
| Monorepo    | pnpm 10 workspaces, Turborepo 2        |

## Monorepo Structure

```
mITyGarden/
├── packages/
│   ├── domain/          # Types, factories, Zustand stores
│   ├── i18n/            # en/nl/fr translations + i18next setup
│   ├── canvas-engine/   # GardenCanvas component (react-konva)
│   ├── asset-library/   # 30+ garden asset definitions
│   ├── persistence/     # ProjectRepository + IndexedDB adapter
│   ├── maps/            # MapsAdapter interface + NoOp
│   ├── llm/             # OpenAI + Anthropic providers
│   └── shared-ui/       # ProjectWizard + React store hooks
├── apps/
│   ├── web/             # Vite SPA
│   ├── desktop/         # Electron wrapper
│   └── mobile/          # Expo app
├── tests/
│   └── e2e/             # Playwright specs
├── specs/
│   ├── 001-project-wizard/
│   └── 002-garden-canvas/
└── docs/
    ├── architecture.md
    ├── development.md
    ├── i18n.md
    └── llm-integration.md
```

## Development

See [docs/development.md](docs/development.md) for the full guide.

```bash
pnpm build        # Build all
pnpm test         # Run unit tests
pnpm typecheck    # Type-check all packages
pnpm lint         # Lint
pnpm format       # Format with Prettier
```

## Desktop LLM Setup (Optional)

```bash
export MITY_GARDEN_OPENAI_API_KEY=sk-...
export MITY_GARDEN_LLM_PROVIDER=openai
pnpm --filter @mity-garden/desktop dev
```

See [docs/llm-integration.md](docs/llm-integration.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes, run `pnpm typecheck && pnpm test && pnpm lint`
4. Open a Pull Request — CI will run automatically

## License

MIT — see [LICENSE](LICENSE)
