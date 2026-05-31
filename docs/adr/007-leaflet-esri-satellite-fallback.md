# ADR-007: Leaflet + ESRI satellite imagery as map fallback

**Date:** 2026-05-20
**Status:** Accepted
**Deciders:** mITyGarden core team

## Context

Spec 003 (Garden Boundary Drawing) requires a satellite map view so users can trace their garden outline. The first implementation used the **Google Maps JavaScript API** with the `drawing` library.

This created a hard dependency on a Google Maps API key (`VITE_GOOGLE_MAPS_API_KEY`). Without the key, the Boundary step showed an error message and users were forced to skip to manual dimension entry — a significant UX gap for the majority of users without a Google Cloud account.

The requirement (REQ-BOUNDARY-02) explicitly states the step MUST work in degraded mode when no API key is configured.

## Decision

Introduce **Leaflet** with **ESRI World Imagery** tiles as a zero-key-required fallback:

- When `VITE_GOOGLE_MAPS_API_KEY` is set → use Google Maps JS API (satellite, Drawing Manager polygon tool).
- When no Google key is set → use Leaflet + `esri-leaflet` with `Esri.WorldImagery` tiles + Leaflet.draw for polygon drawing.

Both paths produce the same output: an array of `{ lat, lng }` coordinates stored in `uiStore.wizard.boundary`, which is then processed by the same bounding-box / area calculation logic.

ESRI World Imagery is a publicly accessible tile service that requires no API key for reasonable usage volumes.

## Alternatives considered

| Alternative                    | Reason rejected                                                         |
| ------------------------------ | ----------------------------------------------------------------------- |
| Google Maps only, no fallback  | Violates REQ-BOUNDARY-02; excludes users without a GCP account          |
| OpenStreetMap (standard tiles) | Street map only — no satellite imagery; insufficient for garden tracing |
| Mapbox GL JS                   | Requires an API key like Google; same problem                           |
| Static background image        | Cannot be centred on user's address; no real tracing possible           |
| Manual coordinate entry        | Very poor UX; defeats the purpose of the feature                        |

## Consequences

**Positive:**

- All users can draw a boundary without any API key configuration.
- ESRI World Imagery has global high-resolution satellite coverage.
- Leaflet is lightweight (~42 kB gzipped) and well-supported.
- The two paths share the same downstream boundary calculation — no duplication of math.

**Negative / trade-offs:**

- Two separate map library implementations to maintain (Google Maps path + Leaflet path).
- ESRI tile usage is subject to Esri's terms of service; heavy usage may require attribution or a commercial agreement.
- Leaflet.draw UX differs slightly from Google Maps Drawing Manager; visual consistency between the two paths is not guaranteed.
- The Leaflet bundle is always loaded even for users who have a Google Maps key (could be code-split in future).

## References

- [Leaflet](https://leafletjs.com/)
- [esri-leaflet](https://developers.arcgis.com/esri-leaflet/)
- [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw)
- [spec 003 — Google Maps Boundary Drawing](../../specs/003-google-maps-boundary/spec.md)
