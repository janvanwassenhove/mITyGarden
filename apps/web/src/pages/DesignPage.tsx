import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore } from "zustand";
import { GardenCanvas } from "@mity-garden/canvas-engine";
import {
  useProjectStore,
  useUiStore,
  AssetLibraryPanel,
  LLMSuggestionsPanel,
} from "@mity-garden/shared-ui";
import type { AssetDefinition } from "@mity-garden/domain";
import { canvasStore } from "@mity-garden/domain";
import { getRepoInstance } from "../repository.js";
import { exportProjectAsJSON, exportProjectAsText } from "../export.js";
import {
  getLLMProvider,
  getImageProvider,
  resetProviders,
  createLLMProvider,
  createImageProvider,
  setDefaultLLMProviderName,
  setDefaultImageProviderName,
  getAvailableLLMProviders,
  getAvailableImageProviders,
} from "../llm.js";
import type { LLMProviderName, ImageProviderName } from "../llm.js";
import type { GardenLayoutSuggestion } from "@mity-garden/llm";
import { getAssetById } from "@mity-garden/asset-library";

const repo = getRepoInstance();

export function DesignPage(): React.ReactElement {
  const project = useProjectStore((s) => s.project);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const isDirty = useProjectStore((s) => s.isDirty);
  const setSaving = useProjectStore((s) => s.setSaving);
  const markClean = useProjectStore((s) => s.markClean);
  const addElement = useProjectStore((s) => s.addElement);
  const openWizard = useUiStore((s) => s.openWizard);
  const locale = useUiStore((s) => s.locale);
  const openSettings = useUiStore((s) => s.openSettings);
  const settingsOpen = useUiStore((s) => s.settingsOpen);
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = React.useState({ width: 800, height: 600 });
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [llmPanelOpen, setLlmPanelOpen] = useState(false);
  const [llmProvider, setLlmProvider] = useState(() => getLLMProvider());
  const [imageProvider, setImageProvider] = useState(() => getImageProvider());
  const mapLayerVisible = useStore(canvasStore, (s) => s.mapLayerVisible);
  const prevSettingsOpenRef = useRef(false);

  // Reset providers when the settings panel closes (in case API keys changed)
  React.useEffect(() => {
    if (prevSettingsOpenRef.current && !settingsOpen) {
      resetProviders();
      setLlmProvider(getLLMProvider());
      setImageProvider(getImageProvider());
    }
    prevSettingsOpenRef.current = settingsOpen;
  }, [settingsOpen]);

  function handleLLMProviderChange(id: string): void {
    const name = id as LLMProviderName;
    setDefaultLLMProviderName(name);
    resetProviders();
    const provider = createLLMProvider(name);
    setLlmProvider(provider);
  }

  function handleImageProviderChange(id: string): void {
    const name = id as ImageProviderName;
    setDefaultImageProviderName(name);
    resetProviders();
    const provider = createImageProvider(name);
    setImageProvider(provider);
  }

  function handleApplySuggestion(suggestion: GardenLayoutSuggestion): void {
    if (!project || !suggestion.placements?.length) return;
    const layerId = project.layers[0]?.id;
    if (!layerId) return;
    for (const placement of suggestion.placements) {
      const asset = getAssetById(placement.assetId);
      if (!asset) continue;
      addElement(layerId, placement.assetId, asset.type, placement.position, placement.size);
    }
  }

  // Wire up Electron File → Export JSON menu item
  useEffect(() => {
    const desktop = (
      window as { mityGardenDesktop?: { on?: (ch: string, cb: () => void) => void } }
    ).mityGardenDesktop;
    if (!desktop?.on || !project) return;
    const handler = (): void => {
      void exportProjectAsJSON(project, repo);
    };
    desktop.on("menu:export", handler);
    // ipcRenderer.on returns a cleanup only in some versions; fall back gracefully
    return undefined;
  }, [project]);

  // Update canvas size on container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setCanvasSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (!project || !isDirty) return;
    const timer = setTimeout(async () => {
      setSaving(true);
      await repo.saveProject(project);
      markClean();
      setSaving(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [project, isDirty, setSaving, markClean]);

  if (!project) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 64 }}>🌱</div>
        <h2>{t("project.noGardenOpen")}</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={openWizard}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              background: "#4caf50",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {t("project.createNew")}
          </button>
          <button
            onClick={() => void navigate("/")}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              background: "#fff",
              border: "2px solid #ccc",
              cursor: "pointer",
            }}
          >
            {t("project.openProject")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", position: "relative" }}>
      {/* Left: Asset Library Panel */}
      <AssetLibraryPanel
        locale={locale}
        selectedAssetId={selectedAssetId}
        onAssetSelect={(asset: AssetDefinition) => {
          setSelectedAssetId((prev) => (prev === asset.id ? null : asset.id));
        }}
      />

      {/* Center: Canvas + Toolbar */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Canvas Toolbar */}
        <div
          data-testid="canvas-toolbar"
          style={{
            display: "flex",
            gap: 8,
            padding: "6px 12px",
            background: "#fff",
            borderBottom: "1px solid #e0e0e0",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <button
            onClick={undo}
            title="Undo (Ctrl+Z)"
            data-testid="toolbar-undo"
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            ↩ {t("canvas.undo")}
          </button>
          <button
            onClick={redo}
            title="Redo (Ctrl+Shift+Z)"
            data-testid="toolbar-redo"
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            ↪ {t("canvas.redo")}
          </button>
          <div style={{ width: 1, background: "#e0e0e0", margin: "0 4px" }} />
          <span style={{ fontSize: 13, color: isDirty ? "#f57c00" : "#4caf50" }}>
            {isDirty ? `● ${t("canvas.status.unsaved")}` : `✓ ${t("canvas.status.saved")}`}
          </span>
          {selectedAssetId && (
            <>
              <div style={{ width: 1, background: "#e0e0e0", margin: "0 4px" }} />
              <span
                style={{
                  fontSize: 12,
                  color: "#1565c0",
                  background: "#e3f2fd",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                🖊 {t("canvas.placement.hint")}
              </span>
              <button
                onClick={() => setSelectedAssetId(null)}
                style={{
                  padding: "2px 8px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  background: "#fff",
                  fontSize: 12,
                }}
              >
                ✕ {t("canvas.placement.cancel")}
              </button>
            </>
          )}
          {/* Map layer toggle — always visible; disabled when project has no map data */}
          <div style={{ width: 1, background: "#e0e0e0", margin: "0 4px" }} />
          <button
            onClick={() =>
              (project.mapBoundingBox ?? project.mapImageUrl)
                ? canvasStore.getState().toggleMapLayer()
                : undefined
            }
            title={
              (project.mapBoundingBox ?? project.mapImageUrl)
                ? t("canvas.mapLayer.toggle")
                : t("canvas.mapLayer.noImage")
            }
            data-testid="toolbar-toggle-map-layer"
            disabled={!(project.mapBoundingBox ?? project.mapImageUrl)}
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              border:
                (project.mapBoundingBox ?? project.mapImageUrl) && mapLayerVisible
                  ? "1px solid #4caf50"
                  : "1px solid #ccc",
              cursor: (project.mapBoundingBox ?? project.mapImageUrl) ? "pointer" : "not-allowed",
              background:
                (project.mapBoundingBox ?? project.mapImageUrl) && mapLayerVisible
                  ? "#e8f5e9"
                  : "#fff",
              fontSize: 12,
              fontWeight:
                (project.mapBoundingBox ?? project.mapImageUrl) && mapLayerVisible ? 700 : 400,
              opacity: (project.mapBoundingBox ?? project.mapImageUrl) ? 1 : 0.45,
            }}
          >
            🛰 {t("canvas.mapLayer.label")}
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => void exportProjectAsJSON(project, repo)}
            title="Export project as JSON"
            data-testid="toolbar-export-json"
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#fff",
              fontSize: 12,
            }}
          >
            ⬇ JSON
          </button>
          <button
            onClick={() => exportProjectAsText(project)}
            title="Export project proposal as text"
            data-testid="toolbar-export-text"
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#fff",
              fontSize: 12,
            }}
          >
            📄 Proposal
          </button>
          <div style={{ width: 1, background: "#e0e0e0", margin: "0 4px" }} />
          <button
            onClick={() => setLlmPanelOpen((v) => !v)}
            title="Toggle AI suggestions panel"
            data-testid="toolbar-ai-panel"
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              border: llmPanelOpen ? "1px solid #4caf50" : "1px solid #ccc",
              cursor: "pointer",
              background: llmPanelOpen ? "#e8f5e9" : "#fff",
              fontSize: 12,
              fontWeight: llmPanelOpen ? 700 : 400,
            }}
          >
            ✨ AI
          </button>
        </div>

        {/* Canvas Area */}
        <div
          ref={containerRef}
          style={{ flex: 1, overflow: "hidden", position: "relative" }}
          data-testid="canvas-area"
        >
          <GardenCanvas
            project={project}
            width={canvasSize.width}
            height={canvasSize.height}
            pendingAssetId={selectedAssetId}
            onAssetPlaced={() => setSelectedAssetId(null)}
          />
        </div>
      </div>

      {/* Right: LLM Suggestions Panel */}
      {llmPanelOpen && (
        <LLMSuggestionsPanel
          project={project}
          llmProvider={llmProvider}
          imageProvider={imageProvider}
          onOpenSettings={openSettings}
          llmProviderOptions={getAvailableLLMProviders()}
          imageProviderOptions={getAvailableImageProviders()}
          onLLMProviderChange={handleLLMProviderChange}
          onImageProviderChange={handleImageProviderChange}
          onApplySuggestion={handleApplySuggestion}
        />
      )}
    </div>
  );
}
