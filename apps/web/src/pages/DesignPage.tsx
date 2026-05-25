import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GardenCanvas } from "@mity-garden/canvas-engine";
import { useProjectStore, useUiStore, AssetLibraryPanel } from "@mity-garden/shared-ui";
import type { AssetDefinition } from "@mity-garden/domain";
import { getRepoInstance } from "../repository.js";
import { exportProjectAsJSON, exportProjectAsText } from "../export.js";

const repo = getRepoInstance();

export function DesignPage(): React.ReactElement {
  const project = useProjectStore((s) => s.project);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const isDirty = useProjectStore((s) => s.isDirty);
  const setSaving = useProjectStore((s) => s.setSaving);
  const markClean = useProjectStore((s) => s.markClean);
  const openWizard = useUiStore((s) => s.openWizard);
  const locale = useUiStore((s) => s.locale);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = React.useState({ width: 800, height: 600 });
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Wire up Electron File → Export JSON menu item
  useEffect(() => {
    const desktop = (window as { mityGardenDesktop?: { on?: (ch: string, cb: () => void) => void } }).mityGardenDesktop;
    if (!desktop?.on || !project) return;
    const handler = (): void => { void exportProjectAsJSON(project, repo); };
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
        <div style={{ fontSize: 64 }}>🌱</div>
        <h2>No garden open</h2>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={openWizard}
            style={{ padding: "10px 20px", borderRadius: 8, background: "#4caf50", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            Create New Garden
          </button>
          <button
            onClick={() => void navigate("/")}
            style={{ padding: "10px 20px", borderRadius: 8, background: "#fff", border: "2px solid #ccc", cursor: "pointer" }}
          >
            Open Project
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
            style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", cursor: "pointer", background: "#fff" }}
          >
            ↩ Undo
          </button>
          <button
            onClick={redo}
            title="Redo (Ctrl+Shift+Z)"
            data-testid="toolbar-redo"
            style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", cursor: "pointer", background: "#fff" }}
          >
            ↪ Redo
          </button>
          <div style={{ width: 1, background: "#e0e0e0", margin: "0 4px" }} />
          <span style={{ fontSize: 13, color: isDirty ? "#f57c00" : "#4caf50" }}>
            {isDirty ? "● Unsaved" : "✓ Saved"}
          </span>
          {selectedAssetId && (
            <>
              <div style={{ width: 1, background: "#e0e0e0", margin: "0 4px" }} />
              <span style={{ fontSize: 12, color: "#1565c0", background: "#e3f2fd", padding: "2px 8px", borderRadius: 4 }}>
                🖊 Click canvas to place asset
              </span>
              <button
                onClick={() => setSelectedAssetId(null)}
                style={{ padding: "2px 8px", borderRadius: 4, border: "1px solid #ccc", cursor: "pointer", background: "#fff", fontSize: 12 }}
              >
                ✕ Cancel
              </button>
            </>
          )}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => void exportProjectAsJSON(project, repo)}
            title="Export project as JSON"
            data-testid="toolbar-export-json"
            style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", cursor: "pointer", background: "#fff", fontSize: 12 }}
          >
            ⬇ JSON
          </button>
          <button
            onClick={() => exportProjectAsText(project)}
            title="Export project proposal as text"
            data-testid="toolbar-export-text"
            style={{ padding: "4px 10px", borderRadius: 4, border: "1px solid #ccc", cursor: "pointer", background: "#fff", fontSize: 12 }}
          >
            📄 Proposal
          </button>
        </div>

        {/* Canvas Area */}
        <div ref={containerRef} style={{ flex: 1, overflow: "hidden", position: "relative" }} data-testid="canvas-area">
          <GardenCanvas
            project={project}
            width={canvasSize.width}
            height={canvasSize.height}
            pendingAssetId={selectedAssetId}
            onAssetPlaced={() => setSelectedAssetId(null)}
          />
        </div>
      </div>
    </div>
  );
}
