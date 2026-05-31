# ADR-001: Monorepo with pnpm workspaces + Turborepo

**Date:** 2026-01-01
**Status:** Accepted
**Deciders:** mITyGarden core team

## Context

mITyGarden targets three deployment surfaces — web SPA, Electron desktop, and Expo mobile — that share substantial business logic (stores, types, i18n, asset definitions, canvas engine). Without a shared code strategy, the same logic would be duplicated across three separate repositories, creating a maintenance burden and risk of drift.

The project also needs a single CI pipeline that can build, lint, type-check, and test all surfaces together.

## Decision

Use a **pnpm workspace monorepo** with **Turborepo** for task orchestration.

- All shared code lives in `packages/` as named workspace packages (`@mity-garden/*`).
- Apps in `apps/` reference packages via `"workspace:*"` dependencies.
- Turborepo provides cached, parallelised builds with a dependency-aware pipeline (`turbo.json`).
- pnpm is the only permitted package manager (never `npm` or `yarn`).

## Alternatives considered

| Alternative               | Reason rejected                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| Separate repos (polyrepo) | No code sharing without publishing to npm; version skew risk                                 |
| Yarn workspaces + Nx      | Nx adds significant config overhead; pnpm has superior disk efficiency via hard-linked store |
| Lerna                     | Primarily a publish tool; Turborepo covers the build pipeline better                         |
| npm workspaces            | Slower installs, no lockfile content-addressing                                              |

## Consequences

**Positive:**

- Single `pnpm install` bootstraps all surfaces.
- Changes to shared packages are immediately visible to all apps without a publish step.
- Turborepo cache means unchanged packages are never rebuilt.

**Negative / trade-offs:**

- All contributors must use pnpm; muscle memory for npm/yarn is a friction point.
- Large workspace means a cold `pnpm install` fetches more packages than a single-purpose repo.
- Turborepo remote caching requires additional setup for CI savings beyond local caching.

## References

- [pnpm workspaces](https://pnpm.io/workspaces)
- [Turborepo docs](https://turbo.build/repo/docs)
