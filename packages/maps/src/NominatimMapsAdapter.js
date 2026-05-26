// ─── Adapter ──────────────────────────────────────────────────────────────────
//
// Uses the free OpenStreetMap Nominatim geocoding API.
// No API key required. Abide by the usage policy: ≤ 1 req/s, set User-Agent.
// https://operations.osmfoundation.org/policies/nominatim/
const USER_AGENT = "mITyGarden/1.0 (garden-design-app)";
export class NominatimMapsAdapter {
    isConfigured() {
        return true; // always available
    }
    async searchPlace(query) {
        const url = `https://nominatim.openstreetmap.org/search` +
            `?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0`;
        const resp = await fetch(url, {
            headers: { "Accept-Language": "en", "User-Agent": USER_AGENT },
        });
        if (!resp.ok)
            return [];
        const data = (await resp.json());
        return data.map((r) => {
            const lat = parseFloat(r.lat);
            const lng = parseFloat(r.lon);
            const bb = r.boundingbox;
            const result = {
                address: r.display_name,
                coordinates: { lat, lng },
            };
            if (bb) {
                result.viewportBounds = {
                    northeast: { lat: parseFloat(bb[1] ?? "0"), lng: parseFloat(bb[3] ?? "0") },
                    southwest: { lat: parseFloat(bb[0] ?? "0"), lng: parseFloat(bb[2] ?? "0") },
                };
            }
            return result;
        });
    }
    async reverseGeocode(coords) {
        const url = `https://nominatim.openstreetmap.org/reverse` +
            `?lat=${coords.lat}&lon=${coords.lng}&format=json`;
        const resp = await fetch(url, {
            headers: { "Accept-Language": "en", "User-Agent": USER_AGENT },
        });
        if (!resp.ok)
            return "";
        const data = (await resp.json());
        return data.display_name ?? "";
    }
}
//# sourceMappingURL=NominatimMapsAdapter.js.map