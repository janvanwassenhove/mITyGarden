import type { GeoCoordinates } from "@mity-garden/domain";
import type { MapsAdapter, PlaceSearchResult } from "./types.js";

// ─── Nominatim API response shapes ───────────────────────────────────────────

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string]; // [minLat, maxLat, minLon, maxLon]
}

// ─── Adapter ──────────────────────────────────────────────────────────────────
//
// Uses the free OpenStreetMap Nominatim geocoding API.
// No API key required. Abide by the usage policy: ≤ 1 req/s, set User-Agent.
// https://operations.osmfoundation.org/policies/nominatim/

const USER_AGENT = "mITyGarden/1.0 (garden-design-app)";

export class NominatimMapsAdapter implements MapsAdapter {
  isConfigured(): boolean {
    return true; // always available
  }

  async searchPlace(query: string): Promise<PlaceSearchResult[]> {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0`;
    const resp = await fetch(url, {
      headers: { "Accept-Language": "en", "User-Agent": USER_AGENT },
    });
    if (!resp.ok) return [];
    const data = (await resp.json()) as NominatimResult[];
    return data.map((r) => {
      const lat = parseFloat(r.lat);
      const lng = parseFloat(r.lon);
      const bb = r.boundingbox;
      const result: PlaceSearchResult = {
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

  async reverseGeocode(coords: GeoCoordinates): Promise<string> {
    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?lat=${coords.lat}&lon=${coords.lng}&format=json`;
    const resp = await fetch(url, {
      headers: { "Accept-Language": "en", "User-Agent": USER_AGENT },
    });
    if (!resp.ok) return "";
    const data = (await resp.json()) as { display_name?: string };
    return data.display_name ?? "";
  }
}
