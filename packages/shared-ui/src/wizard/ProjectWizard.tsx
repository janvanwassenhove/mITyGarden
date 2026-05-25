import React from "react";
import { useUiStore } from "../hooks/useUiStore.js";
import { useProjectStore } from "../hooks/useProjectStore.js";
import type { GardenStyle, GardenGoal, UnitSystem } from "@mity-garden/domain";
import { GARDEN_STYLES, GARDEN_GOALS, WIZARD_TOTAL_STEPS } from "@mity-garden/domain";

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
  const setAddress = useUiStore((s) => s.wizardSetMapAddress);

  return (
    <div data-testid="wizard-step-location">
      <h2>Garden Location</h2>
      <p>Optionally find your garden on the map to help with sizing.</p>
      <input
        type="text"
        placeholder="Enter your address..."
        value={address ?? ""}
        onChange={(e) => setAddress(e.target.value)}
        data-testid="wizard-address-input"
        style={{
          width: "100%",
          padding: "10px 14px",
          fontSize: 16,
          border: "2px solid #ccc",
          borderRadius: 8,
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          marginTop: 12,
          height: 200,
          background: "#e3f2fd",
          border: "2px dashed #90caf9",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
        }}
      >
        Map view — available after Google Maps integration (Milestone 6)
      </div>
      <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
        This step is optional. You can skip it and configure your garden dimensions manually.
      </p>
    </div>
  );
}

// ─── Wizard Shell ─────────────────────────────────────────────────────────────

const STEPS = [StepDimensions, StepStyle, StepStructures, StepGoals, StepLocation];

export interface ProjectWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function ProjectWizard({ onComplete, onCancel }: ProjectWizardProps): React.ReactElement {
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

  return (
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
  );
}
