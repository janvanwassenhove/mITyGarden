import type { GeoCoordinates, Polygon } from "@mity-garden/domain";

// ─── Modular Maps Interface ───────────────────────────────────────────────────
// This abstraction allows swapping between Google Maps, Mapbox, OpenStreetMap, etc.

export interface PlaceSearchResult {
  address: string;
  coordinates: GeoCoordinates;
  viewportBounds?: {
    northeast: GeoCoordinates;
    southwest: GeoCoordinates;
  };
}

export interface MapsAdapter {
  /** Search for a place by address string */
  searchPlace(query: string): Promise<PlaceSearchResult[]>;
  /** Reverse geocode coordinates to address */
  reverseGeocode(coords: GeoCoordinates): Promise<string>;
  /** Get the API status (configured / available) */
  isConfigured(): boolean;
}

export interface BoundaryEditorProps {
  center: GeoCoordinates;
  zoom: number;
  boundary?: Polygon;
  structures?: Polygon[];
  onBoundaryChange: (boundary: Polygon) => void;
  onStructureAdd: (structure: Polygon) => void;
  onStructureUpdate: (index: number, structure: Polygon) => void;
}

// ─── No-op adapter for use when no Maps API key is configured ─────────────────

export class NoOpMapsAdapter implements MapsAdapter {
  isConfigured(): boolean {
    return false;
  }
  async searchPlace(_query: string): Promise<PlaceSearchResult[]> {
    return [];
  }
  async reverseGeocode(_coords: GeoCoordinates): Promise<string> {
    return "";
  }
}

export type { GeoCoordinates, Polygon };
