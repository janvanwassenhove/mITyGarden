import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GardenCanvas } from "@mity-garden/canvas-engine";
import { useProjectStore, useUiStore } from "@mity-garden/shared-ui";
import { IndexedDBRepository } from "@mity-garden/persistence";

const repo = new IndexedDBRepository();

export function DesignPage(): React.ReactElement {
  const project = useProjectStore((s) => s.project);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const isDirty = useProjectStore((s) => s.isDirty);
  const setSaving = useProjectStore((s) => s.setSaving);
  const markClean = useProjectStore((s) => s.markClean);
  const openWizard = useUiStore((s) => s.openWizard);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = React.useState({ width: 800, height: 600 });

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
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Canvas Toolbar */}
      <div
        data-testid="canvas-toolbar"
        style={{
          position: "absolute",
          top: 64,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          padding: "6px 12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          zIndex: 10,
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
        <span style={{ fontSize: 13, color: isDirty ? "#f57c00" : "#4caf50", alignSelf: "center" }}>
          {isDirty ? "● Unsaved" : "✓ Saved"}
        </span>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} style={{ flex: 1, overflow: "hidden", position: "relative" }} data-testid="canvas-area">
        <GardenCanvas
          project={project}
          width={canvasSize.width}
          height={canvasSize.height}
        />
      </div>
    </div>
  );
}
