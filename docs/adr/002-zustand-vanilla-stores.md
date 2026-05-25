# ADR-002: Zustand vanilla stores for state management

**Date:** 2026-01-15
**Status:** Accepted
**Deciders:** mITyGarden core team

## Context

The application has three distinct state concerns:
1. **Project data** — the active `GardenProject`, element mutations, undo/redo history.
2. **Canvas viewport** — pan offset, zoom scale, selected elements, tool mode, grid settings.
3. **UI shell** — locale, theme, wizard step, panel visibility.

State must be:
- Accessible from React components (hooks) *and* from non-React code (store actions called from event handlers, IPC callbacks, export helpers).
- Testable in isolation without mounting a component tree.
- Serialisable for undo/redo without framework overhead.

## Decision

Use **Zustand vanilla stores** (`createStore` from `zustand/vanilla`) in `packages/domain`, with thin React hook wrappers in `packages/shared-ui`.

One store per concern:
- `projectStore` — project data + history
- `canvasStore` — viewport + selection
- `uiStore` — locale + UI state

Components subscribe via `useStore(store, selector)` or the pre-built hooks `useProjectStore`, `useUiStore`, `useCanvasStore`.

## Alternatives considered

| Alternative | Reason rejected |
|-------------|----------------|
| React Context + useReducer | Context re-renders all consumers on every update; no selector-based optimisation without extra libraries |
| Redux Toolkit | Excellent but heavyweight for a focused app; boilerplate (slices, selectors, thunks) outweighs benefit at this scale |
| Jotai / Recoil | Atom model works well for fine-grained UI state but awkward for complex nested project data with undo/redo |
| MobX | Observable mutation model conflicts with immutable history snapshots required by undo/redo |

## Consequences

**Positive:**
- Stores can be read/written from anywhere (event listeners, IPC handlers, test setup) without React.
- Zustand's selector subscription means components only re-render when their slice changes.
- Vanilla stores are trivially unit-testable: import, call an action, assert state.
- Very small bundle footprint (~1 kB gzipped).

**Negative / trade-offs:**
- No built-in devtools integration as ergonomic as Redux DevTools (requires `zustand/middleware`).
- Sharing state across Electron renderer + main process requires explicit IPC serialisation — stores live only in one process.
- Developers unfamiliar with Zustand may try to put business logic in components; must be enforced by convention (see `.github/copilot-instructions.md`).

## References

- [Zustand vanilla docs](https://docs.pmnd.rs/zustand/guides/initialize-state-with-props#using-vanilla-zustand-without-react)
- `packages/domain/src/stores/`
