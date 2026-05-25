import { useStore } from "zustand";
import { canvasStore } from "@mity-garden/domain";
import type { CanvasState } from "@mity-garden/domain";

export function useCanvasStore(): CanvasState;
export function useCanvasStore<T>(selector: (s: CanvasState) => T): T;
export function useCanvasStore<T>(selector?: (s: CanvasState) => T): T | CanvasState {
  if (selector) {
    return useStore(canvasStore, selector);
  }
  return useStore(canvasStore);
}
