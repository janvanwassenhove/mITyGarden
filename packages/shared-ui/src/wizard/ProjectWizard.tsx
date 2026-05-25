import React from "react";
import { useUiStore } from "../hooks/useUiStore.js";
import { useProjectStore } from "../hooks/useProjectStore.js";
import type { GardenStyle, GardenGoal, UnitSystem } from "@mity-garden/domain";
import { GARDEN_STYLES, GARDEN_GOALS, WIZARD_TOTAL_STEPS } from "@mity-garden/domain";
import type { MapsAdapter, PlaceSearchResult } from "@mity-garden/maps";
import { NoOpMapsAdapter } from "@mity-garden/maps";

// ─── Maps adapter context (consumed by StepLocation) ─────────────────────────

const MapsAdapterContext = React.createContext<MapsAdapter>(new NoOpMapsAdapter());

// ─── Step 1: Dimensions ───────────────────────────────────────────────────────

function StepDimensions(): React.ReactElement {
  const wizard = useUiStore((s) => s.wizard);
  const setDimensions = useUiStore((s) => s.wizardSetDimensions);
  const setUnit = useUiStore((s) => s.wizardSetUnit);

  return (
    <div data-testid="wizard-step-dimensions">
      <h2>Garden Dimensions</h2>
      <p>Enter the size of your garden and choose your measurement unit.</p>
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

// ─── Step 3: Existing Structures ──────────────────────────────────────────────

function StepStructures(): React.ReactElement {
  const structureCount = useUiStore((s) => s.wizard.existingStructures.length);

  return (
    <div data-testid="wizard-step-structures">
      <h2>Existing Structures</h2>
      <p>Mark any existing buildings, walls or structures in your garden.</p>
      <div
        style={{
          height: 240,
          background: "#e8f5e9",
          border: "2px dashed #4caf50",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
        }}
      >
        {structureCount > 0
          ? `${structureCount} structure(s) marked`
          : "Google Maps integration available in Milestone 6.\nYou can skip this step for now."}
      </div>
      <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
        Full map integration available in a future update. You can draw structures manually on the canvas after creating your garden.
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

const STEPS = [StepDimensions, StepStyle, StepStructures, StepGoals, StepLocation];

export interface ProjectWizardProps {
  onComplete: () => void;
  onCancel: () => void;
  mapsAdapter?: MapsAdapter;
}

export function ProjectWizard({ onComplete, onCancel, mapsAdapter }: ProjectWizardProps): React.ReactElement {
  const wizard = useUiStore((s) => s.wizard);
  const nextStep = useUiStore((s) => s.wizardNextStep);
  const prevStep = useUiStore((s) => s.wizardPrevStep);
  const wizardReset = useUiStore((s) => s.wizardReset);
  const newProject = useProjectStore((s) => s.newProject);
  const openWizard = useUiStore((s) => s.openWizard);

  const StepComponent = STEPS[wizard.step - 1] ?? StepDimensions;
  const isLastStep = wizard.step === WIZARD_TOTAL_STEPS;
  const isFirstStep = wizard.step === 1;

  function handleFinish(): void {
    newProject({
      name: wizard.mapAddress ? `Garden at ${wizard.mapAddress}` : "My Garden",
      dimensions: wizard.dimensions,
      unit: wizard.unit,
      style: wizard.style,
      goals: wizard.goals,
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
    </MapsAdapterContext.Provider>
  );
}
