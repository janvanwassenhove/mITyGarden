import type { GeoCoordinates } from "@mity-garden/domain";
import type { MapsAdapter, PlaceSearchResult } from "./types.js";
export declare class NominatimMapsAdapter implements MapsAdapter {
  isConfigured(): boolean;
  searchPlace(query: string): Promise<PlaceSearchResult[]>;
  reverseGeocode(coords: GeoCoordinates): Promise<string>;
}
//# sourceMappingURL=NominatimMapsAdapter.d.ts.map
