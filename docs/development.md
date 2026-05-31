# Development Guide

## Key documentation

| Doc                                           | Purpose                                                 |
| --------------------------------------------- | ------------------------------------------------------- |
| [docs/architecture.md](architecture.md)       | Monorepo layout, stores, persistence, milestones        |
| [docs/glossary.md](glossary.md)               | Definitions for all domain and technical terms          |
| [docs/adr/](adr/README.md)                    | Architecture Decision Records — why decisions were made |
| [docs/llm-integration.md](llm-integration.md) | LLM + image providers, env vars, adding providers       |
| [docs/i18n.md](i18n.md)                       | Supported locales, adding translations                  |
| [specs/](../specs/)                           | Feature specs (ACs, REQs, test IDs)                     |

## Prerequisites

| Tool    | Version               |
| ------- | --------------------- |
| Node.js | ≥ 22.0.0              |
| pnpm    | ≥ 10.7.0              |
| Python  | ≥ 3.12 (for Spec Kit) |
| uv      | ≥ 0.11 (for Spec Kit) |
| Git     | any recent            |

## Quick Start

```bash
# Clone and install
git clone https://github.com/your-org/mITyGarden.git
cd mITyGarden
pnpm install

# Start web dev server
pnpm dev --filter @mity-garden/web

# Run all tests
pnpm test

# Type-check all packages
pnpm typecheck

# Format code
pnpm format
```

## Monorepo Commands

```bash
pnpm build          # Build all packages/apps via Turborepo
pnpm dev            # Start all dev servers (parallel)
pnpm test           # Run Vitest unit tests in all packages
pnpm lint           # Run ESLint across the workspace
pnpm typecheck      # Run tsc --noEmit in all packages
pnpm format         # Prettier write
pnpm format:check   # Prettier check (CI)
pnpm clean          # Remove all dist/ and node_modules/
```

## Package-Scoped Commands

```bash
pnpm --filter @mity-garden/domain test
pnpm --filter @mity-garden/web dev
pnpm --filter @mity-garden/desktop dev
```

## E2E Tests

```bash
# Install Playwright browsers (first time only)
cd tests/e2e
node_modules/.bin/playwright install chromium

# Run all E2E tests
cd tests/e2e
node_modules/.bin/playwright test --project=chromium

# Run a single E2E file
pnpm exec playwright test tests/e2e/wizard.spec.ts --project=chromium

# Open the Playwright HTML report
node_modules/.bin/playwright show-report
```

E2E tests require the web dev server to be running on `http://localhost:5173`.

## Spec-Kit Workflow

Every feature is governed by a spec file under `specs/<NNN>-<slug>/spec.md`.

### Starting a new feature

1. Find the next available ID (`ls specs/` and increment).
2. Create `specs/<NNN>-<slug>/spec.md` from the template in [`.github/copilot-instructions.md`](../.github/copilot-instructions.md).
3. Write Acceptance Criteria, Requirements, and Test IDs **before** coding.
4. Implement code to satisfy the ACs.
5. Add E2E tests that use the `data-testid` values from the spec's Test IDs table.
6. Update the spec if implementation reveals new ACs or requirements.

### Updating an existing spec

- If you change behaviour covered by an AC or REQ, update the spec in the same commit.
- Spec IDs (`AC-xxx`, `REQ-xxx`) are never deleted — add a `> Deprecated:` note if superseded.

### Current specs

| ID  | Feature                      | Spec                                                                                |
| --- | ---------------------------- | ----------------------------------------------------------------------------------- |
| 001 | Project Creation Wizard      | [specs/001-project-wizard/spec.md](../specs/001-project-wizard/spec.md)             |
| 002 | Garden Design Canvas         | [specs/002-garden-canvas/spec.md](../specs/002-garden-canvas/spec.md)               |
| 003 | Google Maps Boundary Drawing | [specs/003-google-maps-boundary/spec.md](../specs/003-google-maps-boundary/spec.md) |

## Creating a New Package

1. Create `packages/<name>/` with `package.json`, `tsconfig.json`, `src/index.ts`
2. Name it `@mity-garden/<name>` in `package.json`
3. Extend `../../tsconfig.base.json` in tsconfig
4. Add `"workspace:*"` dependency in consumer packages
5. Update `docs/architecture.md` — package table and dependency graph

## Environment Variables (Desktop)

Set in your shell or `.env.local` (never committed):

```bash
MITY_GARDEN_OPENAI_API_KEY=sk-...
MITY_GARDEN_ANTHROPIC_API_KEY=sk-ant-...
MITY_GARDEN_LLM_PROVIDER=openai   # or: anthropic
MITY_GARDEN_LLM_MODEL=gpt-4o-mini # optional override
```

Keys are consumed by the Electron main process only — they never reach the renderer.

## Code Style

- **ESLint** v9 flat config (`eslint.config.mjs`) with `typescript-eslint/strictTypeChecked`
- **Prettier** for formatting
- **TypeScript** strict mode + `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess`
- Use `void` operator to explicitly discard floating promises
- Prefer named exports over default exports
- No `any` — use `unknown` and narrow explicitly

## Testing

Unit tests: **Vitest** in `packages/domain/tests/`

```bash
pnpm --filter @mity-garden/domain test
pnpm --filter @mity-garden/domain test --watch
```

E2E tests: **Playwright** in `tests/e2e/`

```bash
pnpm --filter @mity-garden/e2e test
pnpm --filter @mity-garden/e2e test --ui
```

## Git Workflow

- Branch from `main` for features: `feat/canvas-drag-drop`
- Branch from `main` for fixes: `fix/wizard-step-3`
- CI must pass before merge
- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `test:`
