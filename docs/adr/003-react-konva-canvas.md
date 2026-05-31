# ADR-003: react-konva for 2D canvas rendering

**Date:** 2026-01-20
**Status:** Accepted
**Deciders:** mITyGarden core team

## Context

The garden canvas requires:

- Placing, dragging, rotating, and resizing arbitrary shapes (rects, circles, images, text).
- Hit-testing for click and context-menu interactions.
- A Transformer widget for multi-handle resize/rotate.
- SVG asset thumbnails rendered inside canvas elements.
- Grid overlay rendering.
- Compatibility with React's component model so elements map naturally to JSX.
- A path to WebView embedding for mobile (Expo).

## Decision

Use **react-konva** (`Stage / Layer / Rect / Group / Image / Text / Transformer`) for web and desktop canvas rendering.

On mobile, the same Konva bundle is served via a Vite build and embedded in an Expo **WebView**, communicating via `postMessage`.

## Alternatives considered

| Alternative          | Reason rejected                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| Raw HTML5 `<canvas>` | Full custom hit-testing, drag, transform logic — significant dev effort                                |
| Fabric.js            | Not React-native; requires manual reconciliation with React state; heavier bundle                      |
| Pixi.js              | Excellent for games/animation; WebGL adds complexity for a vector design tool; no built-in transformer |
| SVG DOM              | Easy to manipulate but degrades badly above ~200 elements; no WebView path for mobile                  |
| react-native-skia    | Strong candidate for native mobile performance; deferred to Milestone 8 as an upgrade path             |

## Consequences

**Positive:**

- React JSX maps directly to canvas nodes — familiar mental model.
- Built-in `Transformer` handles resize/rotate handles out of the box.
- `KonvaImage` renders `HTMLImageElement` (including SVG-as-data-URI) without custom code.
- Same bundle works in WebView for mobile.

**Negative / trade-offs:**

- Canvas scale is fixed at 50 px/m (REQ-CNV-02); high-DPI screens require explicit `pixelRatio` handling.
- `Transformer` does not produce immutable React state — `onTransformEnd` must write back to `projectStore` manually.
- WebView postMessage bridge introduces latency on mobile; targeted for replacement with react-native-skia in Milestone 8.

## References

- [react-konva docs](https://konvajs.org/docs/react/)
- `packages/canvas-engine/src/components/GardenCanvas.tsx`
- [spec 002 — Garden Canvas](../../specs/002-garden-canvas/spec.md)
