const DB_NAME = "mity-garden";
const DB_VERSION = 1;
const STORE_NAME = "projects";
function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
                store.createIndex("updatedAt", "updatedAt", { unique: false });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
function tx(db, mode, fn) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const req = fn(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
export class IndexedDBRepository {
    async listProjects() {
        const db = await openDB();
        const projects = await new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        return projects
            .map((p) => ({ id: p.id, name: p.name, updatedAt: p.updatedAt, createdAt: p.createdAt }))
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    async getProject(id) {
        const db = await openDB();
        const result = await tx(db, "readonly", (store) => store.get(id));
        return result ?? null;
    }
    async saveProject(project) {
        const db = await openDB();
        await tx(db, "readwrite", (store) => store.put(project));
    }
    async deleteProject(id) {
        const db = await openDB();
        await tx(db, "readwrite", (store) => store.delete(id));
    }
    async exportJSON(project) {
        return JSON.stringify(project, null, 2);
    }
    async importJSON(json) {
        const project = JSON.parse(json);
        // Basic validation
        if (!project.id || !project.name || !Array.isArray(project.layers)) {
            throw new Error("Invalid project file format");
        }
        return project;
    }
}
//# sourceMappingURL=IndexedDBRepository.js.map