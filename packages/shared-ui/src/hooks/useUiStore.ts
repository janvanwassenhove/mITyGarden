import { useStore } from "zustand";
import { uiStore } from "@mity-garden/domain";
import type { UiStore } from "@mity-garden/domain";

export function useUiStore(): UiStore;
export function useUiStore<T>(selector: (s: UiStore) => T): T;
export function useUiStore<T>(selector?: (s: UiStore) => T): T | UiStore {
  if (selector) return useStore(uiStore, selector);
  return useStore(uiStore);
}
