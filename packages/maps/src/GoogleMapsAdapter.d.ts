import type { GeoCoordinates } from "@mity-garden/domain";
import type { MapsAdapter, PlaceSearchResult } from "./types.js";
export declare class GoogleMapsAdapter implements MapsAdapter {
    private readonly apiKey;
    constructor(apiKey: string);
    isConfigured(): boolean;
    searchPlace(query: string): Promise<PlaceSearchResult[]>;
    reverseGeocode(coords: GeoCoordinates): Promise<string>;
    /** Returns a Google Static Maps URL for the given coordinates. */
    getStaticMapUrl(coords: GeoCoordinates, width?: number, height?: number, zoom?: number): string;
}
//# sourceMappingURL=GoogleMapsAdapter.d.ts.map