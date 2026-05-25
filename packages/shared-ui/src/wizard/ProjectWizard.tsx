import React from "react";
import { useUiStore } from "../hooks/useUiStore.js";
import { useProjectStore } from "../hooks/useProjectStore.js";
import type { GardenStyle, GardenGoal, UnitSystem, GeoCoordinates, MapData } from "@mity-garden/domain";
import { GARDEN_STYLES, GARDEN_GOALS, WIZARD_TOTAL_STEPS } from "@mity-garden/domain";
import type { MapsAdapter, PlaceSearchResult } from "@mity-garden/maps";
import { NoOpMapsAdapter } from "@mity-garden/maps";

// ─── Google Maps minimal type declarations ────────────────────────────────────

interface GmLatLng { lat(): number; lng(): number; }
interface GmLatLngBounds { extend(point: { lat: number; lng: number }): void; }
interface GmMvcArray<T> { getArray(): T[]; }
interface GmPolygon { getPath(): GmMvcArray<GmLatLng>; setMap(map: GmMap | null): void; }
interface GmMap { fitBounds(bounds: GmLatLngBounds): void; }
interface GmDrawingManager { setMap(map: GmMap | null): void; setDrawingMode(mode: string | null): void; }

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: { center: { lat: number; lng: number }; zoom: number; mapTypeId?: string }) => GmMap;
        Polygon: new (opts: { paths?: { lat: number; lng: number }[]; fillColor?: string; fillOpacity?: number; strokeColor?: string; strokeWeight?: number; editable?: boolean }) => GmPolygon;
        LatLngBounds: new () => GmLatLngBounds;
        event: { addListener(target: GmDrawingManager, event: "polygoncomplete", handler: (polygon: GmPolygon) => void): unknown };
        drawing: {
          DrawingManager: new (opts: { drawingMode?: string; drawingControl?: boolean; drawingControlOptions?: { position: number; drawingModes: string[] }; polygonOptions?: { fillColor?: string; fillOpacity?: number; strokeColor?: string; strokeWeight?: number; editable?: boolean } }) => GmDrawingManager;
          OverlayType: { POLYGON: string };
        };
        ControlPosition: { TOP_CENTER: number };
      };
    };
  }
}

// ─── Maps adapter context (consumed by StepLocation) ─────────────────────────

const MapsAdapterContext = React.createContext<MapsAdapter>(new NoOpMapsAdapter());

// ─── Google Maps API key context (consumed by StepBoundary) ──────────────────

const GoogleMapsApiKeyContext = React.createContext<string | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeBoundingBox(vertices: GeoCoordinates[]): { width: number; height: number; areaM2: number } {
  const lats = vertices.map((v) => v.lat);
  const lngs = vertices.map((v) => v.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const avgLatRad = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const mPerDegLat = 111_320;
  const mPerDegLng = 111_320 * Math.cos(avgLatRad);
  const height = (maxLat - minLat) * mPerDegLat;
  const width = (maxLng - minLng) * mPerDegLng;
  // Shoelace formula in local metric coordinates
  const pts = vertices.map((v) => ({ x: v.lng * mPerDegLng, y: v.lat * mPerDegLat }));
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    const pi = pts[i];
    const pj = pts[j];
    if (pi !== undefined && pj !== undefined) {
      area += pi.x * pj.y - pj.x * pi.y;
    }
  }
  return { width, height, areaM2: Math.abs(area) / 2 };
}

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.drawing) { resolve(); return; }
    const existing = document.getElementById("gmaps-js") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google Maps script failed")));
      return;
    }
    const script = document.createElement("script");
    script.id = "gmaps-js";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=drawing&loading=async`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps API"));
    document.head.appendChild(script);
  });
}

// ─── Leaflet minimal type declarations ────────────────────────────────────────

interface LMap {
  on(event: "click", handler: (e: { latlng: { lat: number; lng: number } }) => void): void;
  remove(): void;
  setView(center: [number, number], zoom: number): LMap;
}
interface LCircleMarker { addTo(map: LMap): LCircleMarker; remove(): void; }
interface LPolyline { addTo(map: LMap): LPolyline; remove(): void; }
interface LPolygon { addTo(map: LMap): LPolygon; remove(): void; }
interface LTileLayer { addTo(map: LMap): LTileLayer; }
interface LeafletStatic {
  map(el: HTMLElement, opts?: object): LMap;
  tileLayer(url: string, opts?: object): LTileLayer;
  circleMarker(latlng: [number, number], opts?: object): LCircleMarker;
  polyline(latlngs: [number, number][], opts?: object): LPolyline;
  polygon(latlngs: [number, number][], opts?: object): LPolygon;
}

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: { center: { lat: number; lng: number }; zoom: number; mapTypeId?: string }) => GmMap;
        Polygon: new (opts: { paths?: { lat: number; lng: number }[]; fillColor?: string; fillOpacity?: number; strokeColor?: string; strokeWeight?: number; editable?: boolean }) => GmPolygon;
        LatLngBounds: new () => GmLatLngBounds;
        event: { addListener(target: GmDrawingManager, event: "polygoncomplete", handler: (polygon: GmPolygon) => void): unknown };
        drawing: {
          DrawingManager: new (opts: { drawingMode?: string; drawingControl?: boolean; drawingControlOptions?: { position: number; drawingModes: string[] }; polygonOptions?: { fillColor?: string; fillOpacity?: number; strokeColor?: string; strokeWeight?: number; editable?: boolean } }) => GmDrawingManager;
          OverlayType: { POLYGON: string };
        };
        ControlPosition: { TOP_CENTER: number };
      };
    };
    L?: LeafletStatic;
  }
}

// ─── Leaflet CDN loader ───────────────────────────────────────────────────────

function loadLeafletScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) { resolve(); return; }
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css";
      document.head.appendChild(link);
    }
    const existing = document.getElementById("leaflet-js") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Leaflet script failed")));
      return;
    }
    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.head.appendChild(script);
  });
}

// ─── Leaflet boundary editor (no API key required) ────────────────────────────

function LeafletBoundaryEditor({
  center,
  initialBoundary,
  onBoundaryComplete,
  onClear,
}: {
  center?: GeoCoordinates;
  initialBoundary?: GeoCoordinates[];
  onBoundaryComplete: (verts: GeoCoordinates[], width: number, height: number, areaM2: number) => void;
  onClear: () => void;
}): React.ReactElement {
  const mapDivRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<LMap | null>(null);
  const vertsRef = React.useRef<GeoCoordinates[]>([]);
  const markersRef = React.useRef<LCircleMarker[]>([]);
  const polylineRef = React.useRef<LPolyline | null>(null);
  const polygonRef = React.useRef<LPolygon | null>(null);

  const [loaded, setLoaded] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [vertCount, setVertCount] = React.useState(0);
  const [closed, setClosed] = React.useState(false);

  React.useEffect(() => {
    loadLeafletScript()
      .then(() => setLoaded(true))
      .catch(() => setLoadError("Could not load map. Check your connection."));
  }, []);

  React.useEffect(() => {
    if (!loaded || !mapDivRef.current) return;
    const L = window.L!;
    const c: [number, number] = center ? [center.lat, center.lng] : [51.26, 4.40];
    const map = L.map(mapDivRef.current, { zoomControl: true }).setView(c, center ? 18 : 13);
    mapRef.current = map;

    // ESRI World Imagery — free satellite tiles, no API key required
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP", maxZoom: 21 },
    ).addTo(map);

    // Restore existing boundary if present
    if (initialBoundary && initialBoundary.length > 2) {
      vertsRef.current = initialBoundary;
      setVertCount(initialBoundary.length);
      setClosed(true);
      const latlngs = initialBoundary.map((v): [number, number] => [v.lat, v.lng]);
      L.polygon(latlngs, { color: "#388e3c", fillColor: "#4caf50", fillOpacity: 0.25, weight: 2 }).addTo(map);
    }

    map.on("click", (e) => {
      if (closed) return;
      const latlng = { lat: e.latlng.lat, lng: e.latlng.lng };
      vertsRef.current = [...vertsRef.current, latlng];
      setVertCount(vertsRef.current.length);

      // Vertex dot
      const marker = L.circleMarker([latlng.lat, latlng.lng], { radius: 6, color: "#388e3c", fillColor: "#fff", fillOpacity: 1, weight: 2 });
      marker.addTo(map);
      markersRef.current.push(marker);

      // Preview polyline
      if (polylineRef.current) polylineRef.current.remove();
      if (vertsRef.current.length > 1) {
        polylineRef.current = L.polyline(
          vertsRef.current.map((v): [number, number] => [v.lat, v.lng]),
          { color: "#388e3c", weight: 2, dashArray: "6 4" },
        ).addTo(map);
      }
    });

    return () => { map.remove(); };
  }, [loaded]);

  function handleClose(): void {
    if (vertsRef.current.length < 3) return;
    const L = window.L!;
    const map = mapRef.current!;
    if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; }
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const latlngs = vertsRef.current.map((v): [number, number] => [v.lat, v.lng]);
    polygonRef.current = L.polygon(latlngs, { color: "#388e3c", fillColor: "#4caf50", fillOpacity: 0.25, weight: 2 }).addTo(map);
    setClosed(true);
    const { width, height, areaM2 } = computeBoundingBox(vertsRef.current);
    onBoundaryComplete(
      vertsRef.current,
      Math.max(1, Math.round(width * 10) / 10),
      Math.max(1, Math.round(height * 10) / 10),
      Math.round(areaM2),
    );
  }

  function handleClearLocal(): void {
    vertsRef.current = [];
    setVertCount(0);
    setClosed(false);
    if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; }
    if (polygonRef.current) { polygonRef.current.remove(); polygonRef.current = null; }
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    onClear();
  }

  if (loadError) return <p style={{ color: "#c62828", fontSize: 13 }}>{loadError}</p>;

  return (
    <div>
      {!loaded && (
        <div style={{ height: 320, background: "#e3f2fd", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
          Loading map…
        </div>
      )}
      <div
        ref={mapDivRef}
        style={{ height: loaded ? 320 : 0, borderRadius: 8, overflow: "hidden", border: loaded ? "2px solid #e0e0e0" : "none" }}
      />
      {loaded && !closed && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: "#888", flex: 1 }}>
            {vertCount === 0
              ? "Click on the satellite map to start tracing your garden outline."
              : vertCount < 3
              ? `${vertCount} point${vertCount > 1 ? "s" : ""} — add at least 3 to close the shape.`
              : `${vertCount} points — press "Close shape" when done.`}
          </span>
          <button
            onClick={handleClose}
            disabled={vertCount < 3}
            style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: vertCount >= 3 ? "#4caf50" : "#e0e0e0", color: vertCount >= 3 ? "#fff" : "#aaa", fontWeight: 600, fontSize: 12, cursor: vertCount >= 3 ? "pointer" : "not-allowed" }}
          >
            Close shape
          </button>
          {vertCount > 0 && (
            <button onClick={handleClearLocal} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", fontSize: 12, cursor: "pointer" }}>
              Clear
            </button>
          )}
        </div>
      )}
      {loaded && closed && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={handleClearLocal} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
            Clear &amp; redraw
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Step: Dimensions ─────────────────────────────────────────────────────────

function StepDimensions(): React.ReactElement {
  const wizard = useUiStore((s) => s.wizard);
  const setDimensions = useUiStore((s) => s.wizardSetDimensions);
  const setUnit = useUiStore((s) => s.wizardSetUnit);
  const hasBoundary = (wizard.mapBoundary?.length ?? 0) > 2;

  return (
    <div data-testid="wizard-step-dimensions">
      <h2>Garden Dimensions</h2>
      {hasBoundary ? (
        <p style={{ color: "#2e7d32", fontSize: 13, background: "#e8f5e9", borderRadius: 6, padding: "8px 12px", border: "1px solid #a5d6a7", marginBottom: 16 }}>
          ✅ Dimensions auto-calculated from your drawn boundary (bounding box). You can fine-tune them below.
        </p>
      ) : (
        <p>Enter the size of your garden and choose your measurement unit.</p>
      )}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <label>
          Width
          <input
            type="number"
            min={1}
            max={500}
            value={wizard.dimensions.width}
            data-testid="wizard-width"
            onChange={(e) => setDimensions(Number(e.target.value), wizard.dimensions.height)}
          />
          {wizard.unit === "metric" ? " m" : " ft"}
        </label>
        <label>
          Depth
          <input
            type="number"
            min={1}
            max={500}
            value={wizard.dimensions.height}
            data-testid="wizard-height"
            onChange={(e) => setDimensions(wizard.dimensions.width, Number(e.target.value))}
          />
          {wizard.unit === "metric" ? " m" : " ft"}
        </label>
      </div>
      <fieldset>
        <legend>Unit System</legend>
        {(["metric", "imperial"] as UnitSystem[]).map((u) => (
          <label key={u} style={{ marginRight: 16 }}>
            <input
              type="radio"
              name="unit"
              value={u}
              checked={wizard.unit === u}
              onChange={() => setUnit(u)}
            />
            {u === "metric" ? "Metric (meters)" : "Imperial (feet)"}
          </label>
        ))}
      </fieldset>
    </div>
  );
}

// ─── Step 2: Style ────────────────────────────────────────────────────────────

const STYLE_LABELS: Record<GardenStyle, string> = {
  modern: "Modern",
  classic: "Classic",
  japanese: "Japanese",
  mediterranean: "Mediterranean",
  english: "English",
  minimal: "Minimal",
  custom: "Custom / Mixed",
};

function StepStyle(): React.ReactElement {
  const style = useUiStore((s) => s.wizard.style);
  const setStyle = useUiStore((s) => s.wizardSetStyle);

  return (
    <div data-testid="wizard-step-style">
      <h2>Garden Style</h2>
      <p>Choose the overall style that best reflects your vision.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {GARDEN_STYLES.map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            data-testid={`wizard-style-${s}`}
            style={{
              padding: "12px 16px",
              border: style === s ? "2px solid #4caf50" : "2px solid #ccc",
              borderRadius: 8,
              background: style === s ? "#e8f5e9" : "#fff",
              cursor: "pointer",
              fontWeight: style === s ? 700 : 400,
            }}
          >
            {STYLE_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step: Boundary Drawing ───────────────────────────────────────────────────

type BoundaryMode = "map" | "image";

function StepBoundary(): React.ReactElement {
  const apiKey = React.useContext(GoogleMapsApiKeyContext);
  const coordinates = useUiStore((s) => s.wizard.mapCoordinates);
  const boundary = useUiStore((s) => s.wizard.mapBoundary);
  const setDimensions = useUiStore((s) => s.wizardSetDimensions);
  const setBoundary = useUiStore((s) => s.wizardSetMapBoundary);

  const mapDivRef = React.useRef<HTMLDivElement>(null);
  const [mapsLoaded, setMapsLoaded] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [area, setArea] = React.useState<number | null>(null);
  const [mode, setMode] = React.useState<BoundaryMode>("map");

  // Seed area from existing boundary on mount
  React.useEffect(() => {
    if (boundary && boundary.length > 2) {
      setArea(Math.round(computeBoundingBox(boundary).areaM2));
    }
  }, []);

  React.useEffect(() => {
    if (mode !== "map" || !apiKey) return;
    loadGoogleMapsScript(apiKey)
      .then(() => setMapsLoaded(true))
      .catch(() => setLoadError("Could not load Google Maps. Check your connection and API key."));
  }, [apiKey, mode]);

  React.useEffect(() => {
    if (mode !== "map" || !mapsLoaded || !mapDivRef.current) return;
    const gm = window.google!.maps;
    const center = coordinates ?? { lat: 51.26, lng: 4.40 };
    const map = new gm.Map(mapDivRef.current, {
      center,
      zoom: coordinates ? 18 : 13,
      mapTypeId: "satellite",
    });
    const dm = new gm.drawing.DrawingManager({
      drawingMode: gm.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: gm.ControlPosition.TOP_CENTER,
        drawingModes: [gm.drawing.OverlayType.POLYGON],
      },
      polygonOptions: {
        fillColor: "#4caf50",
        fillOpacity: 0.25,
        strokeColor: "#388e3c",
        strokeWeight: 2,
        editable: true,
      },
    });
    dm.setMap(map);
    if (boundary && boundary.length > 2) {
      const paths = boundary.map((p) => ({ lat: p.lat, lng: p.lng }));
      const poly = new gm.Polygon({ paths, fillColor: "#4caf50", fillOpacity: 0.25, strokeColor: "#388e3c", strokeWeight: 2 });
      poly.setMap(map);
      dm.setDrawingMode(null);
      const bounds = new gm.LatLngBounds();
      paths.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds);
    }
    gm.event.addListener(dm, "polygoncomplete", (polygon) => {
      dm.setDrawingMode(null);
      const verts = polygon.getPath().getArray().map((ll) => ({ lat: ll.lat(), lng: ll.lng() }));
      setBoundary(verts);
      const { width, height, areaM2 } = computeBoundingBox(verts);
      setDimensions(Math.max(1, Math.round(width * 10) / 10), Math.max(1, Math.round(height * 10) / 10));
      setArea(Math.round(areaM2));
    });
  }, [mapsLoaded, mode]);

  const hasBoundary = (boundary?.length ?? 0) > 2;

  function handleClearGmaps(): void {
    setBoundary([]);
    setArea(null);
    setMapsLoaded(false);
    setTimeout(() => setMapsLoaded(true), 20);
  }

  const modeTabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "7px 4px", border: "none",
    borderBottom: active ? "2px solid #4caf50" : "2px solid transparent",
    background: "none", cursor: "pointer", fontSize: 13,
    fontWeight: active ? 700 : 400,
    color: active ? "#2e7d32" : "#666",
  });

  return (
    <div data-testid="wizard-step-boundary">
      <h2>Draw Your Garden</h2>

      {/* Mode tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0", marginBottom: 14 }}>
        <button style={modeTabStyle(mode === "map")} onClick={() => setMode("map")}>
          🗺️ Satellite Map
        </button>
        <button style={modeTabStyle(mode === "image")} onClick={() => setMode("image")}>
          🖼️ Trace Image
        </button>
      </div>

      {/* ── MAP MODE ── */}
      {mode === "map" && (
        <>
          <p style={{ marginTop: 0 }}>
            Trace your garden boundary on the satellite map. Works for any shape — rectangular, irregular, or curved.
          </p>
          {!apiKey && (
            <div style={{ fontSize: 12, color: "#666", marginBottom: 8, padding: "4px 8px", background: "#f5f5f5", borderRadius: 4, display: "inline-block" }}>
              📡 Free satellite imagery (no API key required)
            </div>
          )}

          {apiKey ? (
            <>
              {loadError && <p style={{ color: "#c62828", fontSize: 13 }}>{loadError}</p>}
              {!mapsLoaded && !loadError && (
                <div style={{ height: 320, background: "#e3f2fd", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
                  Loading Google Maps…
                </div>
              )}
              <div ref={mapDivRef} style={{ height: mapsLoaded ? 320 : 0, borderRadius: 8, overflow: "hidden", border: mapsLoaded ? "2px solid #e0e0e0" : "none" }} />
              {hasBoundary && area !== null && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, padding: "8px 12px", background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 6 }}>
                  <span style={{ fontSize: 13 }}>✅ Boundary drawn — area ≈ <strong>{area} m²</strong></span>
                  <button onClick={handleClearGmaps} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
                    Clear &amp; redraw
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <LeafletBoundaryEditor
                {...(coordinates ? { center: coordinates } : {})}
                {...(boundary && boundary.length > 0 ? { initialBoundary: boundary } : {})}
                onBoundaryComplete={(verts, width, height, areaM2) => {
                  setBoundary(verts);
                  setDimensions(width, height);
                  setArea(areaM2);
                }}
                onClear={() => { setBoundary([]); setArea(null); }}
              />
              {hasBoundary && area !== null && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 6 }}>
                  <span style={{ fontSize: 13 }}>✅ Boundary drawn — area ≈ <strong>{area} m²</strong></span>
                </div>
              )}
            </>
          )}

          <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
            Use the polygon tool to trace the outline. Add extra points to approximate curves.
            This step is optional — you can adjust dimensions on the next step.
          </p>
        </>
      )}

      {/* ── IMAGE TRACE MODE ── */}
      {mode === "image" && (
        <>
          <p style={{ marginTop: 0 }}>
            Upload any aerial photo, map screenshot, or garden plan. Trace the outline by clicking, then enter one known measurement to set the scale.
          </p>
          <ImageTraceBoundaryEditor
            onBoundaryComplete={(widthM, heightM, areaM2) => {
              // Store pixel-derived dimensions (no geo-coordinates in this mode)
              setDimensions(widthM, heightM);
              setArea(areaM2);
            }}
            onClear={() => { setDimensions(10, 10); setArea(null); }}
          />
          {area !== null && (
            <div style={{ marginTop: 8, padding: "8px 12px", background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 6 }}>
              <span style={{ fontSize: 13 }}>✅ Dimensions calculated — area ≈ <strong>{area} m²</strong></span>
            </div>
          )}
          <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
            Tip: for a Google Maps screenshot, zoom in until you can see a recognisable feature (car, door, path) whose real-world size you know.
            This step is optional — you can adjust dimensions on the next step.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Image trace boundary editor ─────────────────────────────────────────────

function ImageTraceBoundaryEditor({
  onBoundaryComplete,
  onClear,
}: {
  onBoundaryComplete: (widthM: number, heightM: number, areaM2: number) => void;
  onClear: () => void;
}): React.ReactElement {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  // pixel coordinates of traced polygon (relative to displayed image)
  const vertsRef = React.useRef<Array<{ x: number; y: number }>>([]);
  const [vertCount, setVertCount] = React.useState(0);
  const [closed, setClosed] = React.useState(false);
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [canvasSize, setCanvasSize] = React.useState({ w: 0, h: 0 });

  // Scale calibration
  const [refWidthM, setRefWidthM] = React.useState("");
  const [calculated, setCalculated] = React.useState(false);

  // ── helpers ──────────────────────────────────────────────────────────────

  function redraw(): void {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const verts = vertsRef.current;
    if (verts.length === 0) return;

    ctx.strokeStyle = "#388e3c";
    ctx.fillStyle = "rgba(76,175,80,0.2)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    const first = verts[0]!;
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i]!.x, verts[i]!.y);
    if (closed) { ctx.closePath(); ctx.fill(); ctx.setLineDash([]); }
    ctx.stroke();

    // Vertex dots
    ctx.setLineDash([]);
    verts.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(v.x, v.y, i === 0 ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? "#1b5e20" : "#fff";
      ctx.strokeStyle = "#388e3c";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      // Number labels
      ctx.fillStyle = "#1b5e20";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText(String(i + 1), v.x + 8, v.y - 4);
    });
  }

  function pixelPolygonStats(): { widthPx: number; heightPx: number; areaPx: number } {
    const verts = vertsRef.current;
    const xs = verts.map((v) => v.x);
    const ys = verts.map((v) => v.y);
    const widthPx = Math.max(...xs) - Math.min(...xs);
    const heightPx = Math.max(...ys) - Math.min(...ys);
    // Shoelace
    let area = 0;
    for (let i = 0; i < verts.length; i++) {
      const j = (i + 1) % verts.length;
      area += verts[i]!.x * verts[j]!.y - verts[j]!.x * verts[i]!.y;
    }
    return { widthPx, heightPx, areaPx: Math.abs(area) / 2 };
  }

  // ── image upload ─────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      // Scale to max 640px wide
      const maxW = Math.min(640, img.naturalWidth);
      const scale = maxW / img.naturalWidth;
      const dispW = Math.round(img.naturalWidth * scale);
      const dispH = Math.round(img.naturalHeight * scale);
      imgRef.current = img;
      setCanvasSize({ w: dispW, h: dispH });
      setImgLoaded(true);
      // draw image on next tick after state update
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0, dispW, dispH);
      });
    };
    img.src = url;
    // reset state
    vertsRef.current = [];
    setVertCount(0);
    setClosed(false);
    setCalculated(false);
    setRefWidthM("");
  }

  // ── canvas click ─────────────────────────────────────────────────────────

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>): void {
    if (closed) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    vertsRef.current = [...vertsRef.current, { x, y }];
    setVertCount(vertsRef.current.length);
    redraw();
  }

  function handleClose(): void {
    if (vertsRef.current.length < 3) return;
    setClosed(true);
    redraw();
  }

  function handleReset(): void {
    vertsRef.current = [];
    setVertCount(0);
    setClosed(false);
    setCalculated(false);
    setRefWidthM("");
    if (canvasRef.current && imgRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);
        ctx.drawImage(imgRef.current, 0, 0, canvasSize.w, canvasSize.h);
      }
    }
    onClear();
  }

  function handleCalculate(): void {
    const widthM = parseFloat(refWidthM);
    if (!isFinite(widthM) || widthM <= 0) return;
    const { widthPx, heightPx, areaPx } = pixelPolygonStats();
    if (widthPx === 0) return;
    const mPerPx = widthM / widthPx;
    const heightM = Math.max(0.1, Math.round(heightPx * mPerPx * 10) / 10);
    const areaM2 = Math.round(areaPx * mPerPx * mPerPx);
    setCalculated(true);
    onBoundaryComplete(Math.max(0.1, Math.round(widthM * 10) / 10), heightM, areaM2);
  }

  // ── redraw when canvas size changes (image loaded) ────────────────────────

  React.useEffect(() => {
    if (!imgLoaded || !canvasRef.current || !imgRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) ctx.drawImage(imgRef.current, 0, 0, canvasSize.w, canvasSize.h);
  }, [imgLoaded, canvasSize]);

  const { widthPx, heightPx } = imgLoaded && closed ? pixelPolygonStats() : { widthPx: 0, heightPx: 0 };

  return (
    <div>
      {/* Upload button */}
      <label
        style={{
          display: "inline-block", padding: "8px 16px", borderRadius: 6,
          border: "1px solid #ccc", background: "#fafafa", cursor: "pointer",
          fontSize: 13, marginBottom: 10,
        }}
      >
        📂 Upload image (photo, screenshot, plan…)
        <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
      </label>

      {!imgLoaded && (
        <div style={{ padding: "28px 0", background: "#f5f5f5", borderRadius: 8, border: "2px dashed #ccc", textAlign: "center", color: "#999", fontSize: 13 }}>
          Upload an aerial photo, map screenshot, or garden plan to trace the boundary
        </div>
      )}

      {/* Canvas overlay on image */}
      {imgLoaded && (
        <div
          ref={wrapperRef}
          style={{ position: "relative", display: "inline-block", borderRadius: 8, overflow: "hidden", border: "2px solid #e0e0e0" }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            onClick={handleCanvasClick}
            style={{ display: "block", cursor: closed ? "default" : "crosshair" }}
          />
        </div>
      )}

      {/* Controls row */}
      {imgLoaded && !closed && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: "#888", flex: 1 }}>
            {vertCount === 0
              ? "Click on the image to place vertices around your garden."
              : vertCount < 3
              ? `${vertCount} point${vertCount > 1 ? "s" : ""} placed — add at least 3 to close.`
              : `${vertCount} points — press "Close shape" when the outline is complete.`}
          </span>
          <button
            onClick={handleClose}
            disabled={vertCount < 3}
            style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: vertCount >= 3 ? "#4caf50" : "#e0e0e0", color: vertCount >= 3 ? "#fff" : "#aaa", fontWeight: 600, fontSize: 12, cursor: vertCount >= 3 ? "pointer" : "not-allowed" }}
          >
            Close shape
          </button>
          {vertCount > 0 && (
            <button onClick={handleReset} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", fontSize: 12, cursor: "pointer" }}>
              Clear
            </button>
          )}
        </div>
      )}

      {/* Scale calibration */}
      {imgLoaded && closed && !calculated && (
        <div style={{ marginTop: 12, padding: "12px 14px", background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 8 }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#795548" }}>
            📏 Set scale — how wide is your traced outline in real life?
          </p>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "#888" }}>
            The width of your polygon is <strong>{widthPx.toFixed(0)} px</strong>. Enter the real-world width
            (e.g. look up the width of a recognisable feature like a house or driveway).
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="number"
              min={0.1}
              step={0.1}
              placeholder="e.g. 15"
              value={refWidthM}
              onChange={(e) => setRefWidthM(e.target.value)}
              style={{ width: 90, padding: "6px 8px", border: "1px solid #ccc", borderRadius: 6, fontSize: 13 }}
            />
            <span style={{ fontSize: 13, color: "#555" }}>meters wide</span>
            <button
              onClick={handleCalculate}
              disabled={!refWidthM || parseFloat(refWidthM) <= 0}
              style={{ padding: "7px 16px", borderRadius: 6, border: "none", background: refWidthM && parseFloat(refWidthM) > 0 ? "#4caf50" : "#e0e0e0", color: refWidthM && parseFloat(refWidthM) > 0 ? "#fff" : "#aaa", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              Calculate
            </button>
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button onClick={handleReset} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
              ← Redraw
            </button>
          </div>
        </div>
      )}

      {imgLoaded && calculated && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={handleReset} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
            Clear &amp; redraw
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Goals ────────────────────────────────────────────────────────────

const GOAL_LABELS: Record<GardenGoal, string> = {
  pool: "Swimming Pool",
  playground: "Children's Playground",
  terrace: "Terrace / Patio",
  plants: "Plants & Flowers",
  "low-maintenance": "Low Maintenance",
  "vegetable-garden": "Vegetable Garden",
  "outdoor-dining": "Outdoor Dining Area",
  other: "Other",
};

function StepGoals(): React.ReactElement {
  const goals = useUiStore((s) => s.wizard.goals);
  const toggleGoal = useUiStore((s) => s.wizardToggleGoal);

  return (
    <div data-testid="wizard-step-goals">
      <h2>Garden Goals</h2>
      <p>What do you want to achieve? Select all that apply.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {GARDEN_GOALS.map((goal) => (
          <label
            key={goal}
            data-testid={`wizard-goal-${goal}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              border: goals.includes(goal) ? "2px solid #4caf50" : "2px solid #ccc",
              borderRadius: 8,
              cursor: "pointer",
              background: goals.includes(goal) ? "#e8f5e9" : "#fff",
            }}
          >
            <input
              type="checkbox"
              checked={goals.includes(goal)}
              onChange={() => toggleGoal(goal)}
            />
            {GOAL_LABELS[goal]}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Step 5: Location ─────────────────────────────────────────────────────────

function StepLocation(): React.ReactElement {
  const address = useUiStore((s) => s.wizard.mapAddress);
  const coordinates = useUiStore((s) => s.wizard.mapCoordinates);
  const setAddress = useUiStore((s) => s.wizardSetMapAddress);
  const setCoordinates = useUiStore((s) => s.wizardSetMapCoordinates);
  const adapter = React.useContext(MapsAdapterContext);

  const [query, setQuery] = React.useState(address ?? "");
  const [results, setResults] = React.useState<PlaceSearchResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSearch(): Promise<void> {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setError(null);
    setResults([]);
    try {
      const found = await adapter.searchPlace(q);
      if (found.length === 0) {
        setError("No results found. Try a more specific address.");
      } else {
        setResults(found);
      }
    } catch {
      setError("Search failed. Please check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }

  function handleSelect(result: PlaceSearchResult): void {
    setAddress(result.address);
    setCoordinates(result.coordinates);
    setQuery(result.address);
    setResults([]);
    setError(null);
  }

  // OSM embed URL when coordinates are available
  const mapEmbedUrl = coordinates
    ? `https://www.openstreetmap.org/export/embed.html` +
      `?bbox=${coordinates.lng - 0.012},${coordinates.lat - 0.007},` +
      `${coordinates.lng + 0.012},${coordinates.lat + 0.007}` +
      `&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`
    : null;

  return (
    <div data-testid="wizard-step-location">
      <h2>Garden Location</h2>
      <p>Find your garden on the map to help with orientation. This step is optional.</p>

      {/* Search row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        <input
          type="text"
          placeholder="Enter your address…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { void handleSearch(); } }}
          data-testid="wizard-address-input"
          style={{
            flex: 1,
            padding: "10px 14px",
            fontSize: 15,
            border: "2px solid #ccc",
            borderRadius: 8,
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={() => void handleSearch()}
          disabled={searching || !query.trim()}
          data-testid="wizard-address-search"
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "#4caf50",
            color: "#fff",
            fontWeight: 600,
            cursor: searching ? "wait" : "pointer",
            opacity: searching || !query.trim() ? 0.6 : 1,
          }}
        >
          {searching ? "…" : "Search"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: "#c62828", fontSize: 13, marginTop: 4 }}>{error}</p>
      )}

      {/* Results dropdown */}
      {results.length > 0 && (
        <ul
          data-testid="wizard-address-results"
          style={{
            margin: "0 0 8px 0",
            padding: 0,
            listStyle: "none",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            background: "#fff",
            maxHeight: 180,
            overflowY: "auto",
          }}
        >
          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => handleSelect(r)}
              style={{
                padding: "9px 14px",
                cursor: "pointer",
                fontSize: 14,
                borderBottom: i < results.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLLIElement).style.background = "#f5f5f5"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLLIElement).style.background = ""; }}
            >
              {r.address}
            </li>
          ))}
        </ul>
      )}

      {/* Selected address badge */}
      {coordinates && address && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            background: "#e8f5e9",
            border: "1px solid #a5d6a7",
            borderRadius: 6,
            marginBottom: 8,
            fontSize: 13,
          }}
        >
          <span>📍</span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {address}
          </span>
          <span style={{ color: "#888", flexShrink: 0 }}>
            {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </span>
        </div>
      )}

      {/* Map preview */}
      <div
        style={{
          height: 200,
          borderRadius: 8,
          overflow: "hidden",
          border: "2px solid #e0e0e0",
          background: "#e3f2fd",
        }}
      >
        {mapEmbedUrl ? (
          <iframe
            title="Garden location map"
            src={mapEmbedUrl}
            data-testid="wizard-map-preview"
            style={{ width: "100%", height: "100%", border: "none" }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 32 }}>🗺️</span>
            <span style={{ fontSize: 13 }}>Search for an address to see it on the map</span>
          </div>
        )}
      </div>
      <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
        This step is optional — you can skip it and configure dimensions manually on the canvas.
      </p>
    </div>
  );
}

// ─── Wizard Shell ─────────────────────────────────────────────────────────────

const STEPS = [StepLocation, StepBoundary, StepDimensions, StepStyle, StepGoals];

export interface ProjectWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  mapsAdapter?: MapsAdapter;
  googleMapsApiKey?: string;
}

export function ProjectWizard({ onComplete, onCancel, mapsAdapter, googleMapsApiKey }: ProjectWizardProps): React.ReactElement {
  const wizard = useUiStore((s) => s.wizard);
  const nextStep = useUiStore((s) => s.wizardNextStep);
  const prevStep = useUiStore((s) => s.wizardPrevStep);
  const wizardReset = useUiStore((s) => s.wizardReset);
  const newProject = useProjectStore((s) => s.newProject);

  const StepComponent = STEPS[wizard.step - 1] ?? StepDimensions;
  const isLastStep = wizard.step === WIZARD_TOTAL_STEPS;
  const isFirstStep = wizard.step === 1;

  function handleFinish(): void {
    const mapData: MapData | undefined = wizard.mapCoordinates
      ? {
          address: wizard.mapAddress ?? "",
          coordinates: wizard.mapCoordinates,
          zoom: 18,
          boundary: wizard.mapBoundary ?? [],
          detectedStructures: [],
          userCorrectedStructures: [],
        }
      : undefined;
    newProject({
      name: wizard.mapAddress ? `Garden at ${wizard.mapAddress}` : "My Garden",
      dimensions: wizard.dimensions,
      unit: wizard.unit,
      style: wizard.style,
      goals: wizard.goals,
      ...(mapData !== undefined ? { mapData } : {}),
    });
    wizardReset();
    onComplete();
  }

  function handleCancel(): void {
    wizardReset();
    onCancel();
  }

  const adapter = mapsAdapter ?? new NoOpMapsAdapter();

  return (
    <MapsAdapterContext.Provider value={adapter}>
    <GoogleMapsApiKeyContext.Provider value={googleMapsApiKey}>
    <div
      data-testid="project-wizard"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 32,
          width: 540,
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ marginBottom: 8, color: "#888", fontSize: 13 }}>
          Step {wizard.step} of {WIZARD_TOTAL_STEPS}
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 24,
          }}
        >
          {Array.from({ length: WIZARD_TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i < wizard.step ? "#4caf50" : "#e0e0e0",
                transition: "background 0.2s",
              }}
            />
          ))}
        </div>

        <StepComponent />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
          <button onClick={handleCancel} style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
            Cancel
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {!isFirstStep && (
              <button onClick={prevStep} data-testid="wizard-back" style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
                Back
              </button>
            )}
            {isLastStep ? (
              <button onClick={handleFinish} data-testid="wizard-finish" style={{ padding: "8px 24px", borderRadius: 6, border: "none", background: "#4caf50", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                Create Garden
              </button>
            ) : (
              <button onClick={nextStep} data-testid="wizard-next" style={{ padding: "8px 24px", borderRadius: 6, border: "none", background: "#4caf50", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </GoogleMapsApiKeyContext.Provider>
    </MapsAdapterContext.Provider>
  );
}
