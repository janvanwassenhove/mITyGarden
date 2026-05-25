# Architecture Decision Records

This directory records significant architectural and technology decisions made in mITyGarden. Each ADR captures the context, decision, and consequences so future contributors can understand *why* the codebase is the way it is — not just *what* it does.

## Status legend

| Status | Meaning |
|--------|---------|
| **Accepted** | Decision is in effect |
| **Deprecated** | Decision was reversed or superseded |
| **Superseded** | Replaced by a newer ADR (linked) |

## Index

| # | Title | Status |
|---|-------|--------|
| [ADR-001](001-monorepo-pnpm-turborepo.md) | Monorepo with pnpm workspaces + Turborepo | Accepted |
| [ADR-002](002-zustand-vanilla-stores.md) | Zustand vanilla stores for state management | Accepted |
| [ADR-003](003-react-konva-canvas.md) | react-konva for 2D canvas rendering | Accepted |
| [ADR-004](004-local-first-persistence.md) | Local-first persistence (IndexedDB + SQLite) | Accepted |
| [ADR-005](005-llm-in-web-renderer.md) | LLM providers available in web renderer | Accepted |
| [ADR-006](006-i18next.md) | i18next for internationalisation | Accepted |
| [ADR-007](007-leaflet-esri-satellite-fallback.md) | Leaflet + ESRI as satellite map fallback | Accepted |

## Creating a new ADR

1. Copy [000-template.md](000-template.md).
2. Name it `NNN-short-title.md` (next sequential number).
3. Fill in all sections — leave nothing as "TBD" before merging.
4. Add a row to the index above.
5. If the ADR supersedes an earlier one, update the older ADR's status.
