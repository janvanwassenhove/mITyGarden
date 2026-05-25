# Development Guide

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 22.0.0 |
| pnpm | ≥ 10.7.0 |
| Python | ≥ 3.12 (for Spec Kit) |
| uv | ≥ 0.11 (for Spec Kit) |
| Git | any recent |

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

## Creating a New Package

1. Create `packages/<name>/` with `package.json`, `tsconfig.json`, `src/index.ts`
2. Name it `@mity-garden/<name>` in `package.json`
3. Extend `../../tsconfig.base.json` in tsconfig
4. Add `"workspace:*"` dependency in consumer packages

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
