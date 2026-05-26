import type { GeoCoordinates, Polygon } from "@mity-garden/domain";
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
export declare class NoOpMapsAdapter implements MapsAdapter {
    isConfigured(): boolean;
    searchPlace(_query: string): Promise<PlaceSearchResult[]>;
    reverseGeocode(_coords: GeoCoordinates): Promise<string>;
}
export type { GeoCoordinates, Polygon };
//# sourceMappingURL=types.d.ts.map