function getDb() {
    const db = window
        .mityGardenDesktop?.db;
    if (!db)
        throw new Error("ElectronRepository: mityGardenDesktop.db is not available");
    return db;
}
export class ElectronRepository {
    async listProjects() {
        return getDb().listProjects();
    }
    async getProject(id) {
        const result = await getDb().getProject(id);
        return result ?? null;
    }
    async saveProject(project) {
        await getDb().saveProject(project);
    }
    async deleteProject(id) {
        await getDb().deleteProject(id);
    }
    async exportJSON(project) {
        const result = await getDb().exportJSON(project.id);
        return result ?? JSON.stringify(project, null, 2);
    }
    async importJSON(json) {
        const result = await getDb().importJSON(json);
        if (!result)
            throw new Error("Failed to import project JSON");
        return result;
    }
}
//# sourceMappingURL=ElectronRepository.js.map