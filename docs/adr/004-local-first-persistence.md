# ADR-004: Local-first persistence (IndexedDB + SQLite)

**Date:** 2026-02-01
**Status:** Accepted
**Deciders:** mITyGarden core team

## Context

Garden projects are large JSON documents (elements, positions, metadata). The app targets three surfaces with very different storage capabilities:

- **Web SPA** — runs in the browser; no filesystem access; must survive page reloads.
- **Electron desktop** — full Node.js access; users expect "save file" semantics and offline use.
- **Mobile (Expo)** — sandboxed; async key-value or SQLite via native modules.

Cloud sync is desirable long-term but should not be a prerequisite for v1.

## Decision

Adopt a **local-first, adapter-pattern persistence model**.

- Define a `ProjectRepository` interface in `packages/persistence` with `listProjects`, `getProject`, `saveProject`, `deleteProject`, `exportJSON`, `importJSON`.
- **Web**: `IndexedDBRepository` — stores serialised project JSON in IndexedDB, survives page reloads, no server required.
- **Desktop**: `ElectronRepository` — thin IPC bridge; the Electron main process runs `better-sqlite3` with WAL mode and exposes operations via `ipcMain`/`contextBridge` as `window.mityGardenDesktop.db.*`.
- **Mobile**: `AsyncStorageRepository` (MMKV) — deferred to Milestone 8.
- A `NoOpCloudSyncAdapter` satisfies the `CloudSyncAdapter` interface; real sync is planned post-v1.

All storage calls go through the `Repository` interface — no component may call `localStorage`, `fs`, or IndexedDB directly.

## Alternatives considered

| Alternative                          | Reason rejected                                                        |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `localStorage` (web)                 | 5 MB limit; synchronous; not suitable for project-sized JSON           |
| File System Access API (web)         | Requires user gesture for every save; poor UX; limited browser support |
| PouchDB / CouchDB sync               | Full cloud sync complexity too early; adds server dependency           |
| Electron `fs` directly from renderer | Violates contextIsolation; security anti-pattern                       |

## Consequences

**Positive:**

- `ProjectRepository` interface allows swapping adapters without touching components or stores.
- Desktop SQLite provides fast queries, WAL concurrency, and a path to relational features.
- Web IndexedDB is truly offline-capable with no backend.

**Negative / trade-offs:**

- IPC round-trips on desktop add latency for `listProjects` on large collections; mitigated by returning only `ProjectSummary` (id, name, dates) in the list query.
- IndexedDB API is notoriously verbose; `IndexedDBRepository` wraps it but adds a dependency on its correctness.
- Mobile adapter is deferred; mobile builds currently have no persistence.

## References

- `packages/persistence/src/repository.ts`
- `packages/persistence/src/adapters/`
- `apps/desktop/src/main/db.ts`
- `apps/web/src/repository.ts`
