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

// ─── Step: Dimensions ────────────────────────────────────────────────────────

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

  // Seed area from existing boundary on mount
  React.useEffect(() => {
    if (boundary && boundary.length > 2) {
      setArea(Math.round(computeBoundingBox(boundary).areaM2));
    }
  }, []);

  React.useEffect(() => {
    if (!apiKey) return;
    loadGoogleMapsScript(apiKey)
      .then(() => setMapsLoaded(true))
      .catch(() => setLoadError("Could not load Google Maps. Check your connection and API key."));
  }, [apiKey]);

  React.useEffect(() => {
    if (!mapsLoaded || !mapDivRef.current) return;
    const gm = window.google!.maps;
    const center = coordinates ?? { lat: 51.26, lng: 4.40 }; // default: Antwerp
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
    // Re-draw existing boundary
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
  }, [mapsLoaded]);

  const hasBoundary = (boundary?.length ?? 0) > 2;

  function handleClear(): void {
    setBoundary([]);
    setArea(null);
    // Reset map by toggling mapsLoaded
    setMapsLoaded(false);
    setTimeout(() => setMapsLoaded(true), 20);
  }

  if (!apiKey) {
    return (
      <div data-testid="wizard-step-boundary">
        <h2>Draw Your Garden</h2>
        <div style={{ padding: "24px", background: "#f5f5f5", borderRadius: 8, border: "2px dashed #ccc", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🗺️</div>
          <p style={{ fontWeight: 600, color: "#555", margin: "0 0 6px" }}>Google Maps not configured</p>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
            Set <code>GOOGLE_MAPS_API_KEY</code> to enable drawing your garden boundary on a satellite map and auto-calculating dimensions.
          </p>
        </div>
        <p style={{ fontSize: 13, color: "#888", marginTop: 12 }}>
          You can skip this step and enter your garden dimensions manually on the next step.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="wizard-step-boundary">
      <h2>Draw Your Garden</h2>
      <p style={{ marginTop: 0 }}>
        Trace your garden boundary on the map. Works for any shape — rectangular, irregular, multi-sided or curved.
      </p>

      {loadError && <p style={{ color: "#c62828", fontSize: 13 }}>{loadError}</p>}

      {!mapsLoaded && !loadError && (
        <div style={{ height: 320, background: "#e3f2fd", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
          Loading map…
        </div>
      )}

      <div ref={mapDivRef} style={{ height: mapsLoaded ? 320 : 0, borderRadius: 8, overflow: "hidden", border: mapsLoaded ? "2px solid #e0e0e0" : "none" }} />

      {hasBoundary && area !== null && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, padding: "8px 12px", background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 6 }}>
          <span style={{ fontSize: 13 }}>✅ Boundary drawn — area ≈ <strong>{area} m²</strong></span>
          <button onClick={handleClear} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
            Clear &amp; redraw
          </button>
        </div>
      )}

      <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
        Use the polygon tool to trace the outline. Add extra points to approximate curved edges.
        This step is optional — you can adjust dimensions on the next step.
      </p>
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
