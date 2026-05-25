import type { MapsAdapter } from "@mity-garden/maps";
import { GoogleMapsAdapter, NominatimMapsAdapter } from "@mity-garden/maps";

/**
 * Returns the appropriate MapsAdapter for the current environment:
 * - If VITE_GOOGLE_MAPS_API_KEY is set → GoogleMapsAdapter
 * - Otherwise                           → NominatimMapsAdapter (free OSM)
 *
 * The Google Maps API key should be restricted to HTTP referrers in
 * Google Cloud Console to prevent unauthorised use.
 */
export function createMapsAdapter(): MapsAdapter {
  const googleKey = import.meta.env["VITE_GOOGLE_MAPS_API_KEY"];
  if (googleKey && googleKey.length > 0) {
    return new GoogleMapsAdapter(googleKey);
  }
  return new NominatimMapsAdapter();
}

let _mapsAdapter: MapsAdapter | null = null;
export function getMapsAdapter(): MapsAdapter {
  if (!_mapsAdapter) _mapsAdapter = createMapsAdapter();
  return _mapsAdapter;
}
