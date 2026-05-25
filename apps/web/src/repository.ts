import { IndexedDBRepository } from "@mity-garden/persistence";
import { ElectronRepository } from "@mity-garden/persistence";
import type { ProjectRepository } from "@mity-garden/persistence";

/**
 * Returns the appropriate repository implementation for the current runtime:
 * - Electron desktop → ElectronRepository (SQLite via IPC)
 * - Web browser      → IndexedDBRepository
 */
export function getRepository(): ProjectRepository {
  if (
    typeof window !== "undefined" &&
    (window as { mityGardenDesktop?: { isDesktop?: boolean } }).mityGardenDesktop?.isDesktop
  ) {
    return new ElectronRepository();
  }
  return new IndexedDBRepository();
}

// Singleton for the lifetime of the app session
let _repo: ProjectRepository | null = null;
export function getRepoInstance(): ProjectRepository {
  if (!_repo) _repo = getRepository();
  return _repo;
}
