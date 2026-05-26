/** Stub cloud adapter — always unavailable in v1 */
export class NoOpCloudSyncAdapter {
    isAvailable() {
        return false;
    }
    async push(_project) {
        // Not implemented in v1
    }
    async pull(_id) {
        return null;
    }
    async listRemote() {
        return [];
    }
}
//# sourceMappingURL=repository.js.map