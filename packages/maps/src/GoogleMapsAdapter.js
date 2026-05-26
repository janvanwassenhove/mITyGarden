// ─── Adapter ──────────────────────────────────────────────────────────────────
export class GoogleMapsAdapter {
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    isConfigured() {
        return this.apiKey.length > 0;
    }
    async searchPlace(query) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json` +
            `?address=${encodeURIComponent(query)}&key=${encodeURIComponent(this.apiKey)}`;
        const resp = await fetch(url);
        if (!resp.ok)
            return [];
        const data = (await resp.json());
        if (data.status !== "OK")
            return [];
        return data.results.slice(0, 5).map((r) => ({
            address: r.formatted_address,
            coordinates: { lat: r.geometry.location.lat, lng: r.geometry.location.lng },
            viewportBounds: {
                northeast: r.geometry.viewport.northeast,
                southwest: r.geometry.viewport.southwest,
            },
        }));
    }
    async reverseGeocode(coords) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json` +
            `?latlng=${coords.lat},${coords.lng}&key=${encodeURIComponent(this.apiKey)}`;
        const resp = await fetch(url);
        if (!resp.ok)
            return "";
        const data = (await resp.json());
        return data.results[0]?.formatted_address ?? "";
    }
    /** Returns a Google Static Maps URL for the given coordinates. */
    getStaticMapUrl(coords, width = 500, height = 200, zoom = 15) {
        return (`https://maps.googleapis.com/maps/api/staticmap` +
            `?center=${coords.lat},${coords.lng}` +
            `&zoom=${zoom}&size=${width}x${height}` +
            `&markers=color:green%7C${coords.lat},${coords.lng}` +
            `&key=${encodeURIComponent(this.apiKey)}`);
    }
}
//# sourceMappingURL=GoogleMapsAdapter.js.map