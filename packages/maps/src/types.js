// ─── No-op adapter for use when no Maps API key is configured ─────────────────
export class NoOpMapsAdapter {
    isConfigured() {
        return false;
    }
    async searchPlace(_query) {
        return [];
    }
    async reverseGeocode(_coords) {
        return "";
    }
}
//# sourceMappingURL=types.js.map