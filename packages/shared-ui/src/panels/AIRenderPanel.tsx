import React from "react";
import { useTranslation } from "react-i18next";
import type { GardenProject } from "@mity-garden/domain";
import type { ImageGenerationProvider, GeneratedImage } from "@mity-garden/llm";
import {
  GardenImageService,
  DEFAULT_VIEW,
  DEFAULT_ENHANCEMENTS,
  DEFAULT_STRICTNESS,
} from "@mity-garden/llm";
import type {
  SceneView,
  SceneEnhancements,
  StrictnessLevel,
  ViewMode,
  RealismLevel,
  Lens,
  TimeOfDay,
  Season,
  CompassDirection,
  SceneOptions,
} from "@mity-garden/llm";
import { generateReferenceImage } from "@mity-garden/canvas-engine";
import type { ProviderOption } from "./LLMSuggestionsPanel.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIRenderPanelProps {
  project: GardenProject;
  imageProvider: ImageGenerationProvider;
  imageProviderOptions?: ProviderOption[] | undefined;
  onImageProviderChange?: ((id: string) => void) | undefined;
  onOpenSettings?: (() => void) | undefined;
}

type WizardStep = "view" | "camera" | "enhancements" | "generate";

// ─── Helper ───────────────────────────────────────────────────────────────────

function resolveImageSrc(img: GeneratedImage): string {
  if (img.url) return img.url;
  if (img.base64) return `data:${img.mimeType};base64,${img.base64}`;
  return "";
}

// ─── Saved settings key ───────────────────────────────────────────────────────

const SETTINGS_KEY = "mityGarden.aiRender.settings";

interface SavedSettings {
  view: SceneView;
  enhancements: SceneEnhancements;
  strictness: StrictnessLevel;
}

function loadSettings(): SavedSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as SavedSettings) : null;
  } catch {
    return null;
  }
}

function saveSettings(s: SavedSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // localStorage may be unavailable
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AIRenderPanel({
  project,
  imageProvider,
  imageProviderOptions,
  onImageProviderChange,
  onOpenSettings,
}: AIRenderPanelProps): React.ReactElement {
  const { t } = useTranslation("common");
  const imageService = React.useMemo(
    () => new GardenImageService(imageProvider),
    [imageProvider],
  );

  // ── State ─────────────────────────────────────────────────────────────────

  const saved = React.useMemo(() => loadSettings(), []);

  const [step, setStep] = React.useState<WizardStep>("view");

  // View settings
  const [viewMode, setViewMode] = React.useState<ViewMode>(saved?.view.mode ?? DEFAULT_VIEW.mode);
  const [realism, setRealism] = React.useState<RealismLevel>(saved?.view.realism ?? DEFAULT_VIEW.realism);
  const [lens, setLens] = React.useState<Lens>(saved?.view.lens ?? DEFAULT_VIEW.lens);
  const [cameraHeight, setCameraHeight] = React.useState(saved?.view.cameraHeightMeters ?? DEFAULT_VIEW.cameraHeightMeters);
  const [cameraAngle, setCameraAngle] = React.useState(saved?.view.cameraAngleDegrees ?? DEFAULT_VIEW.cameraAngleDegrees);
  const [direction, setDirection] = React.useState<CompassDirection>(saved?.view.direction ?? DEFAULT_VIEW.direction);
  const [timeOfDay, setTimeOfDay] = React.useState<TimeOfDay>(saved?.view.timeOfDay ?? DEFAULT_VIEW.timeOfDay);
  const [season, setSeason] = React.useState<Season>(saved?.view.season ?? DEFAULT_VIEW.season);

  // Strictness
  const [strictness, setStrictness] = React.useState<StrictnessLevel>(saved?.strictness ?? DEFAULT_STRICTNESS);

  // Enhancements
  const [enhancements, setEnhancements] = React.useState<SceneEnhancements>(saved?.enhancements ?? { ...DEFAULT_ENHANCEMENTS });

  // Generation state
  const [generatedImage, setGeneratedImage] = React.useState<GeneratedImage | null>(null);
  const [promptPreview, setPromptPreview] = React.useState<string | null>(null);
  const [imageLoading, setImageLoading] = React.useState(false);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [referencePreview, setReferencePreview] = React.useState<string | null>(null);

  const imageAvailable = imageProvider.isConfigured();

  // ── Persist settings ──────────────────────────────────────────────────────

  React.useEffect(() => {
    const view: SceneView = {
      mode: viewMode,
      realism,
      lens,
      cameraHeightMeters: cameraHeight,
      cameraAngleDegrees: cameraAngle,
      direction,
      timeOfDay,
      season,
    };
    saveSettings({ view, enhancements, strictness });
  }, [viewMode, realism, lens, cameraHeight, cameraAngle, direction, timeOfDay, season, enhancements, strictness]);

  // ── Build scene options ───────────────────────────────────────────────────

  function buildOptions(): SceneOptions {
    return {
      view: {
        mode: viewMode,
        realism,
        lens,
        cameraHeightMeters: cameraHeight,
        cameraAngleDegrees: cameraAngle,
        direction,
        timeOfDay,
        season,
      },
      enhancements,
      strictness,
    };
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handlePreviewPrompt(): void {
    const { prompt } = imageService.buildScenePrompt(project, buildOptions());
    setPromptPreview(prompt);
  }

  async function handleGenerateReference(): Promise<void> {
    try {
      const blob = await generateReferenceImage(project, {
        showLabels: true,
        showNorthArrow: true,
        showScaleBar: true,
      });
      const url = URL.createObjectURL(blob);
      setReferencePreview(url);
    } catch (err) {
      console.error("[mITyGarden] Reference image error:", err);
    }
  }

  async function handleGenerate(): Promise<void> {
    setImageLoading(true);
    setImageError(null);
    try {
      // Generate reference image for providers that support it
      let refBlob: Blob | undefined;
      if (imageService.supportsReferenceImage()) {
        refBlob = await generateReferenceImage(project, {
          showLabels: true,
          showNorthArrow: true,
          showScaleBar: true,
        });
      }

      const img = await imageService.generateFromScene(project, buildOptions(), refBlob);
      setGeneratedImage(img);
      setStep("generate");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Image generation failed.";
      console.error("[mITyGarden] AI render error:", msg);
      setImageError(msg);
    } finally {
      setImageLoading(false);
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "#555",
    display: "block",
    marginBottom: 4,
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 12,
    background: "#fff",
    marginBottom: 10,
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "5px 10px",
    borderRadius: 16,
    border: active ? "2px solid #4caf50" : "1px solid #ccc",
    background: active ? "#e8f5e9" : "#fff",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: active ? 700 : 400,
  });

  const primaryBtnStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: imageAvailable ? "#1565c0" : "#e0e0e0",
    color: imageAvailable ? "#fff" : "#999",
    fontWeight: 600,
    cursor: imageAvailable && !imageLoading ? "pointer" : "not-allowed",
    fontSize: 13,
  };

  const stepBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "6px 4px",
    border: "none",
    borderBottom: active ? "2px solid #1565c0" : "2px solid transparent",
    background: "none",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: active ? 700 : 400,
    color: active ? "#1565c0" : "#888",
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div data-testid="ai-render-panel">
      {/* Step navigation */}
      <div style={{ display: "flex", marginBottom: 12 }}>
        {(["view", "camera", "enhancements", "generate"] as WizardStep[]).map((s) => (
          <button key={s} style={stepBtnStyle(step === s)} onClick={() => setStep(s)}>
            {t(`llm.aiRender.steps.${s}`)}
          </button>
        ))}
      </div>

      {!imageAvailable && (
        <div
          style={{
            padding: 10,
            background: "#fff3e0",
            border: "1px solid #ffe0b2",
            borderRadius: 8,
            fontSize: 12,
            color: "#e65100",
            marginBottom: 12,
          }}
        >
          {t("llm.imageNotConfigured")}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              style={{
                marginTop: 6,
                padding: "3px 8px",
                borderRadius: 4,
                border: "1px solid #e65100",
                background: "#fff",
                color: "#e65100",
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              {t("llm.configureKeys")}
            </button>
          )}
        </div>
      )}

      {/* ── Step: View ── */}
      {step === "view" && (
        <div>
          <label style={labelStyle}>{t("llm.aiRender.viewMode")}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {(["oblique_drone", "eye_level", "top_down", "cinematic"] as ViewMode[]).map((m) => (
              <button key={m} style={chipStyle(viewMode === m)} onClick={() => setViewMode(m)}>
                {t(`llm.aiRender.viewModes.${m}`)}
              </button>
            ))}
          </div>

          <label style={labelStyle}>{t("llm.aiRender.realism")}</label>
          <select
            value={realism}
            onChange={(e) => setRealism(e.target.value as RealismLevel)}
            style={selectStyle}
          >
            <option value="photorealistic">{t("llm.aiRender.realismOptions.photorealistic")}</option>
            <option value="architectural_visualization">{t("llm.aiRender.realismOptions.architectural")}</option>
            <option value="concept_render">{t("llm.aiRender.realismOptions.concept")}</option>
          </select>

          <label style={labelStyle}>{t("llm.aiRender.strictness")}</label>
          <select
            value={strictness}
            onChange={(e) => setStrictness(e.target.value as StrictnessLevel)}
            style={selectStyle}
          >
            <option value="creative">{t("llm.aiRender.strictnessOptions.creative")}</option>
            <option value="balanced">{t("llm.aiRender.strictnessOptions.balanced")}</option>
            <option value="strict">{t("llm.aiRender.strictnessOptions.strict")}</option>
            <option value="very_strict">{t("llm.aiRender.strictnessOptions.veryStrict")}</option>
          </select>

          <button
            style={{ ...primaryBtnStyle, background: "#4caf50", marginTop: 4 }}
            onClick={() => setStep("camera")}
          >
            {t("common.next")} →
          </button>
        </div>
      )}

      {/* ── Step: Camera ── */}
      {step === "camera" && (
        <div>
          <label style={labelStyle}>{t("llm.aiRender.cameraHeight")}</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={cameraHeight}
              onChange={(e) => setCameraHeight(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 12, minWidth: 32 }}>{cameraHeight}m</span>
          </div>

          <label style={labelStyle}>{t("llm.aiRender.cameraAngle")}</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={cameraAngle}
              onChange={(e) => setCameraAngle(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 12, minWidth: 32 }}>{cameraAngle}°</span>
          </div>

          <label style={labelStyle}>{t("llm.aiRender.direction")}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {(["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as CompassDirection[]).map((d) => (
              <button key={d} style={chipStyle(direction === d)} onClick={() => setDirection(d)}>
                {d}
              </button>
            ))}
          </div>

          <label style={labelStyle}>{t("llm.aiRender.lens")}</label>
          <select
            value={lens}
            onChange={(e) => setLens(e.target.value as Lens)}
            style={selectStyle}
          >
            <option value="wide_angle">{t("llm.aiRender.lensOptions.wide")}</option>
            <option value="natural">{t("llm.aiRender.lensOptions.natural")}</option>
            <option value="telephoto">{t("llm.aiRender.lensOptions.telephoto")}</option>
          </select>

          <label style={labelStyle}>{t("llm.aiRender.timeOfDay")}</label>
          <select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
            style={selectStyle}
          >
            <option value="morning">{t("llm.aiRender.timeOptions.morning")}</option>
            <option value="summer_afternoon">{t("llm.aiRender.timeOptions.afternoon")}</option>
            <option value="golden_hour">{t("llm.aiRender.timeOptions.goldenHour")}</option>
            <option value="overcast">{t("llm.aiRender.timeOptions.overcast")}</option>
          </select>

          <label style={labelStyle}>{t("llm.aiRender.season")}</label>
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value as Season)}
            style={selectStyle}
          >
            <option value="spring">{t("llm.aiRender.seasonOptions.spring")}</option>
            <option value="summer">{t("llm.aiRender.seasonOptions.summer")}</option>
            <option value="autumn">{t("llm.aiRender.seasonOptions.autumn")}</option>
            <option value="winter">{t("llm.aiRender.seasonOptions.winter")}</option>
          </select>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{ flex: 1, ...primaryBtnStyle, background: "#757575" }}
              onClick={() => setStep("view")}
            >
              ← {t("common.back")}
            </button>
            <button
              style={{ flex: 1, ...primaryBtnStyle, background: "#4caf50" }}
              onClick={() => setStep("enhancements")}
            >
              {t("common.next")} →
            </button>
          </div>
        </div>
      )}

      {/* ── Step: Enhancements ── */}
      {step === "enhancements" && (
        <div>
          {(Object.keys(enhancements) as (keyof SceneEnhancements)[]).map((key) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={enhancements[key]}
                onChange={(e) => setEnhancements({ ...enhancements, [key]: e.target.checked })}
              />
              {t(`llm.aiRender.enhancements.${key}`)}
            </label>
          ))}

          {/* Provider chooser */}
          {imageProviderOptions && imageProviderOptions.filter((p) => p.available).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>{t("llm.aiRender.imageProvider")}</label>
              <select
                value={imageProvider.name}
                onChange={(e) => onImageProviderChange?.(e.target.value)}
                style={selectStyle}
              >
                {imageProviderOptions.filter((p) => p.available).map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              style={{ flex: 1, ...primaryBtnStyle, background: "#757575" }}
              onClick={() => setStep("camera")}
            >
              ← {t("common.back")}
            </button>
            <button
              style={{ flex: 1, ...primaryBtnStyle, background: "#4caf50" }}
              onClick={() => setStep("generate")}
            >
              {t("common.next")} →
            </button>
          </div>
        </div>
      )}

      {/* ── Step: Generate ── */}
      {step === "generate" && (
        <div>
          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button
              onClick={() => void handleGenerate()}
              disabled={!imageAvailable || imageLoading}
              data-testid="ai-render-generate-btn"
              style={{ flex: 1, ...primaryBtnStyle }}
            >
              {imageLoading ? t("llm.generating") : `🖼 ${t("llm.aiRender.generate")}`}
            </button>
            <button
              onClick={handlePreviewPrompt}
              title={t("llm.previewPrompt")}
              style={{
                padding: "10px 10px",
                borderRadius: 8,
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              💬
            </button>
          </div>

          {/* Reference preview */}
          <button
            onClick={() => void handleGenerateReference()}
            style={{
              width: "100%",
              padding: "7px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            {t("llm.aiRender.previewReference")}
          </button>

          {referencePreview && (
            <div style={{ marginBottom: 12 }}>
              <img
                src={referencePreview}
                alt="Reference layout"
                style={{ width: "100%", borderRadius: 6, border: "1px solid #e0e0e0" }}
              />
              <p style={{ fontSize: 10, color: "#888", margin: "4px 0 0" }}>
                {t("llm.aiRender.referenceHint")}
              </p>
            </div>
          )}

          {/* Prompt preview */}
          {promptPreview && (
            <details open style={{ marginBottom: 12 }}>
              <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>
                {t("llm.previewPrompt")}
              </summary>
              <p
                style={{
                  fontSize: 11,
                  color: "#666",
                  background: "#f5f5f5",
                  padding: 8,
                  borderRadius: 4,
                  marginTop: 4,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {promptPreview}
              </p>
            </details>
          )}

          {imageError && (
            <p style={{ color: "#c62828", fontSize: 13, marginBottom: 12 }}>{imageError}</p>
          )}

          {/* Generated image */}
          {generatedImage && (
            <div>
              <img
                src={resolveImageSrc(generatedImage)}
                alt="AI-generated garden render"
                data-testid="ai-render-generated-image"
                style={{
                  width: "100%",
                  borderRadius: 8,
                  border: "1px solid #e0e0e0",
                  display: "block",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <a
                  href={resolveImageSrc(generatedImage)}
                  download={`${project.name.replace(/\s+/g, "-")}-ai-render.png`}
                  style={{
                    flex: 1,
                    display: "block",
                    textAlign: "center",
                    padding: "7px 10px",
                    borderRadius: 6,
                    background: "#4caf50",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 12,
                    textDecoration: "none",
                  }}
                >
                  ⬇ {t("common.save")}
                </a>
                <button
                  onClick={() => setGeneratedImage(null)}
                  style={{
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  ✕
                </button>
              </div>
              {generatedImage.revisedPrompt && (
                <p style={{ fontSize: 11, color: "#888", marginTop: 6, lineHeight: 1.4 }}>
                  <em>{generatedImage.revisedPrompt}</em>
                </p>
              )}
            </div>
          )}

          <button
            style={{ ...primaryBtnStyle, background: "#757575", marginTop: 12 }}
            onClick={() => setStep("enhancements")}
          >
            ← {t("common.back")}
          </button>
        </div>
      )}
    </div>
  );
}
