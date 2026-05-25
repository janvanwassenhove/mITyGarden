import type { GeoCoordinates } from "@mity-garden/domain";
import type { MapsAdapter, PlaceSearchResult } from "./types.js";

// ─── Google Geocoding API response shapes ─────────────────────────────────────

interface GLatLng {
  lat: number;
  lng: number;
}

interface GViewport {
  northeast: GLatLng;
  southwest: GLatLng;
}

interface GGeocodeResult {
  formatted_address: string;
  geometry: {
    location: GLatLng;
    viewport: GViewport;
  };
}

interface GGeocodeResponse {
  status: string;
  results: GGeocodeResult[];
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

export class GoogleMapsAdapter implements MapsAdapter {
  constructor(private readonly apiKey: string) {}

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async searchPlace(query: string): Promise<PlaceSearchResult[]> {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?address=${encodeURIComponent(query)}&key=${encodeURIComponent(this.apiKey)}`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = (await resp.json()) as GGeocodeResponse;
    if (data.status !== "OK") return [];
    return data.results.slice(0, 5).map((r) => ({
      address: r.formatted_address,
      coordinates: { lat: r.geometry.location.lat, lng: r.geometry.location.lng },
      viewportBounds: {
        northeast: r.geometry.viewport.northeast,
        southwest: r.geometry.viewport.southwest,
      },
    }));
  }

  async reverseGeocode(coords: GeoCoordinates): Promise<string> {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?latlng=${coords.lat},${coords.lng}&key=${encodeURIComponent(this.apiKey)}`;
    const resp = await fetch(url);
    if (!resp.ok) return "";
    const data = (await resp.json()) as GGeocodeResponse;
    return data.results[0]?.formatted_address ?? "";
  }

  /** Returns a Google Static Maps URL for the given coordinates. */
  getStaticMapUrl(coords: GeoCoordinates, width = 500, height = 200, zoom = 15): string {
    return (
      `https://maps.googleapis.com/maps/api/staticmap` +
      `?center=${coords.lat},${coords.lng}` +
      `&zoom=${zoom}&size=${width}x${height}` +
      `&markers=color:green%7C${coords.lat},${coords.lng}` +
      `&key=${encodeURIComponent(this.apiKey)}`
    );
  }
}
