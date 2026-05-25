import { useStore } from "zustand";
import { projectStore } from "@mity-garden/domain";
import type { ProjectStore } from "@mity-garden/domain";

export function useProjectStore(): ProjectStore;
export function useProjectStore<T>(selector: (s: ProjectStore) => T): T;
export function useProjectStore<T>(selector?: (s: ProjectStore) => T): T | ProjectStore {
  if (selector) return useStore(projectStore, selector);
  return useStore(projectStore);
}
