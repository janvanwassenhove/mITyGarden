import type { GardenProject } from "@mity-garden/domain";
import type { ProjectRepository, ProjectSummary } from "../repository.js";

const DB_NAME = "mity-garden";
const DB_VERSION = 1;
const STORE_NAME = "projects";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(db: IDBDatabase, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export class IndexedDBRepository implements ProjectRepository {
  async listProjects(): Promise<ProjectSummary[]> {
    const db = await openDB();
    const projects = await new Promise<GardenProject[]>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as GardenProject[]);
      req.onerror = () => reject(req.error);
    });
    return projects
      .map((p) => ({ id: p.id, name: p.name, updatedAt: p.updatedAt, createdAt: p.createdAt }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getProject(id: string): Promise<GardenProject | null> {
    const db = await openDB();
    const result = await tx(db, "readonly", (store) => store.get(id));
    return (result as GardenProject | undefined) ?? null;
  }

  async saveProject(project: GardenProject): Promise<void> {
    const db = await openDB();
    await tx(db, "readwrite", (store) => store.put(project));
  }

  async deleteProject(id: string): Promise<void> {
    const db = await openDB();
    await tx(db, "readwrite", (store) => store.delete(id));
  }

  async exportJSON(project: GardenProject): Promise<string> {
    return JSON.stringify(project, null, 2);
  }

  async importJSON(json: string): Promise<GardenProject> {
    const project = JSON.parse(json) as GardenProject;
    // Basic validation
    if (!project.id || !project.name || !Array.isArray(project.layers)) {
      throw new Error("Invalid project file format");
    }
    return project;
  }
}
