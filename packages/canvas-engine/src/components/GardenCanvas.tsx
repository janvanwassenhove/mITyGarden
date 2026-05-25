import React, { useRef, useCallback, useEffect, useState } from "react";
import { Stage, Layer, Rect, Text, Group, Transformer, Image as KonvaImage } from "react-konva";
import type Konva from "konva";
import { useStore } from "zustand";
import { getAssetById } from "@mity-garden/asset-library";
import type { GardenProject, GardenElement, UUID } from "@mity-garden/domain";
import {
  BASE_PIXELS_PER_METER,
  metersToPixels,
  pixelsToMeters,
  snapToGrid,
} from "@mity-garden/domain";
import { canvasStore } from "@mity-garden/domain";
import { projectStore } from "@mity-garden/domain";

export interface GardenCanvasProps {
  project: GardenProject;
  width: number;
  height: number;
  /** When set, clicking the canvas places this asset */
  pendingAssetId?: string | null;
  onAssetPlaced?: () => void;
}

// ─── Grid Lines ────────────────────────────────────────────────────────────────

function GridLines({
  offsetX,
  offsetY,
  scale,
  gridSize,
  ppm,
  stageW,
  stageH,
}: {
  offsetX: number;
  offsetY: number;
  scale: number;
  gridSize: number;
  ppm: number;
  stageW: number;
  stageH: number;
}): React.ReactElement {
  const cellPx = metersToPixels(gridSize, ppm) * scale;
  if (cellPx < 6) return <></>;

  const lines: React.ReactElement[] = [];
  const startX = (-offsetX % cellPx) - cellPx;
  const startY = (-offsetY % cellPx) - cellPx;

  for (let x = startX; x < stageW + cellPx; x += cellPx) {
    lines.push(
      <Rect key={`vg-${x}`} x={x} y={0} width={0.5} height={stageH} fill="rgba(0,0,0,0.08)" />,
    );
  }
  for (let y = startY; y < stageH + cellPx; y += cellPx) {
    lines.push(
      <Rect key={`hg-${y}`} x={0} y={y} width={stageW} height={0.5} fill="rgba(0,0,0,0.08)" />,
    );
  }
  return <>{lines}</>;
}

// ─── SVG image loader hook ────────────────────────────────────────────────────
//
// Converts an SVG string to an HTMLImageElement so Konva can render it.
// Returns null while loading (falls back to colored rect).

function useSvgImage(svgString: string | undefined): HTMLImageElement | null {
  const [img, setImg] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    if (!svgString) {
      setImg(null);
      return;
    }
    let cancelled = false;
    const image = new window.Image();
    image.onload = () => {
      if (!cancelled) setImg(image);
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    return () => {
      cancelled = true;
    };
  }, [svgString]);

  return img;
}

// ─── Single Element ────────────────────────────────────────────────────────────

function ElementShape({
  el,
  ppm,
  selected,
  onClick,
  onDragEnd,
  onContextMenu,
}: {
  el: GardenElement;
  ppm: number;
  selected: boolean;
  onClick: (id: UUID, evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (id: UUID, x: number, y: number) => void;
  onContextMenu: (id: UUID, evt: Konva.KonvaEventObject<MouseEvent>) => void;
}): React.ReactElement {
  const w = el.size.width * ppm;
  const h = el.size.height * ppm;
  const x = el.position.x * ppm;
  const y = el.position.y * ppm;

  const asset = getAssetById(el.assetId);
  const thumbnailImg = useSvgImage(asset?.thumbnail);

  // Fallback appearance (shown while SVG loads or if no asset found)
  const fill = FILL_BY_TYPE[el.type] ?? "#90a4ae";
  const assetName = el.customLabel ?? asset?.labels.en.name ?? el.assetId.split("-").slice(1).join(" ");
  const minDim = Math.min(w, h);
  const showLabel = minDim >= 40;
  const labelFontSize = Math.max(9, Math.min(13, minDim * 0.18));

  return (
    <Group
      x={x}
      y={y}
      width={w}
      height={h}
      rotation={el.rotation}
      draggable
      onClick={(e) => onClick(el.id, e)}
      onContextMenu={(e) => onContextMenu(el.id, e)}
      onDragEnd={(e) => {
        onDragEnd(el.id, e.target.x() / ppm, e.target.y() / ppm);
      }}
      id={el.id}
    >
      {thumbnailImg ? (
        // Render the asset's own SVG thumbnail scaled to the element size
        <KonvaImage image={thumbnailImg} width={w} height={h} />
      ) : (
        // Fallback: colored rect while image loads
        <Rect
          width={w}
          height={h}
          fill={fill}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={1}
          cornerRadius={el.type === "tree" || el.type === "pool" ? minDim / 2 : 4}
          opacity={0.85}
        />
      )}

      {/* Name label — always rendered on top of both SVG and fallback */}
      {showLabel && (
        <Text
          text={assetName}
          fontSize={labelFontSize}
          fill="#1a1a1a"
          shadowColor="rgba(255,255,255,0.9)"
          shadowBlur={4}
          shadowOffsetX={0}
          shadowOffsetY={0}
          align="center"
          verticalAlign="middle"
          width={w}
          height={h}
          listening={false}
          ellipsis
          wrap="word"
        />
      )}

      {/* Selection border overlay */}
      {selected && (
        <Rect
          width={w}
          height={h}
          fill="transparent"
          stroke="#1565c0"
          strokeWidth={2}
          dash={[5, 3]}
        />
      )}
    </Group>
  );
}

const FILL_BY_TYPE: Record<string, string> = {
  pool: "#81d4fa",
  tree: "#a5d6a7",
  plant: "#c8e6c9",
  "terrace-tile": "#d7ccc8",
  "grass-zone": "#dcedc8",
  playground: "#ffe082",
  path: "#bcaaa4",
  building: "#ef9a9a",
  "fence-wall-border": "#b0bec5",
  furniture: "#ffe0b2",
  custom: "#e1bee7",
};

// ─── Context menu item ─────────────────────────────────────────────────────────

function CtxItem({
  icon,
  label,
  testId,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: string;
  label: string;
  testId: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}): React.ReactElement {
  return (
    <button
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "8px 14px",
        border: "none",
        background: "transparent",
        cursor: disabled ? "default" : "pointer",
        fontSize: 13,
        color: disabled ? "#bdbdbd" : danger ? "#c62828" : "#212121",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.background = danger ? "#ffebee" : "#f5f5f5";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
      {label}
    </button>
  );
}

// ─── GardenCanvas ──────────────────────────────────────────────────────────────

export function GardenCanvas({
  project,
  width,
  height,
  pendingAssetId = null,
  onAssetPlaced,
}: GardenCanvasProps): React.ReactElement {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Context menu
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  // Clipboard for copy / paste
  const [clipboard, setClipboard] = useState<GardenElement[]>([]);

  const ppm = BASE_PIXELS_PER_METER;
  const gardenW = project.dimensions.width * ppm;
  const gardenH = project.dimensions.height * ppm;

  // Canvas state
  const offsetX = useStore(canvasStore, (s) => s.offsetX);
  const offsetY = useStore(canvasStore, (s) => s.offsetY);
  const scale = useStore(canvasStore, (s) => s.scale);
  const gridEnabled = useStore(canvasStore, (s) => s.gridEnabled);
  const gridSize = useStore(canvasStore, (s) => s.gridSize);
  const snapEnabled = useStore(canvasStore, (s) => s.snapEnabled);
  const selectedElementIds = useStore(canvasStore, (s) => s.selectedElementIds);
  const { setOffset, setScale, selectElement, clearSelection } = canvasStore.getState();

  // Project actions
  const { addElement, updateElement, removeElement } = projectStore.getState();

  // Collect all elements across layers
  const allElements = project.layers.flatMap((l) => l.elements);
  const layerById = new Map(project.layers.map((l) => [l.id, l]));
  const elementLayerMap = new Map<UUID, UUID>();
  for (const layer of project.layers) {
    for (const el of layer.elements) {
      elementLayerMap.set(el.id, layer.id);
    }
  }

  const defaultLayerId = project.layers[0]?.id ?? "";

  // Attach Transformer to selected nodes
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr || !stageRef.current) return;
    const stage = stageRef.current;
    const nodes = selectedElementIds
      .map((id) => stage.findOne(`#${id}`))
      .filter(Boolean) as Konva.Node[];
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selectedElementIds]);

  // Delete key removes selected elements
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") { setCtxMenu(null); return; }
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      for (const id of canvasStore.getState().selectedElementIds) {
        const layerId = elementLayerMap.get(id);
        if (layerId) removeElement(layerId, id);
      }
      clearSelection();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [allElements, removeElement, clearSelection, elementLayerMap]);

  // Dismiss context menu on outside click
  useEffect(() => {
    if (!ctxMenu) return;
    function onOutsideClick(): void { setCtxMenu(null); }
    window.addEventListener("mousedown", onOutsideClick);
    return () => window.removeEventListener("mousedown", onOutsideClick);
  }, [ctxMenu]);

  // Right-click on element → select + show context menu
  const handleElementContextMenu = useCallback(
    (id: UUID, e: Konva.KonvaEventObject<MouseEvent>) => {
      e.evt.preventDefault();
      e.cancelBubble = true;
      // Ensure the right-clicked element is selected
      if (!canvasStore.getState().selectedElementIds.includes(id)) {
        selectElement(id, false);
      }
      // Position relative to canvas container
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCtxMenu({ x: e.evt.clientX - rect.left, y: e.evt.clientY - rect.top });
    },
    [selectElement],
  );

  // Copy selected elements to clipboard
  const handleCopy = useCallback(() => {
    const ids = canvasStore.getState().selectedElementIds;
    setClipboard(allElements.filter((el) => ids.includes(el.id)));
    setCtxMenu(null);
  }, [allElements]);

  // Paste clipboard elements with a small offset
  const handlePaste = useCallback(() => {
    const OFFSET = 0.5;
    for (const el of clipboard) {
      const newPos = { x: el.position.x + OFFSET, y: el.position.y + OFFSET };
      const newId = addElement(defaultLayerId, el.assetId, el.type, newPos, el.size);
      if (el.rotation !== 0 && newId) {
        updateElement(defaultLayerId, newId, { rotation: el.rotation });
      }
    }
    setCtxMenu(null);
  }, [clipboard, defaultLayerId, addElement, updateElement]);

  // Delete selected elements
  const handleDeleteSelected = useCallback(() => {
    const ids = canvasStore.getState().selectedElementIds;
    for (const id of ids) {
      const layerId = elementLayerMap.get(id);
      if (layerId) removeElement(layerId, id);
    }
    clearSelection();
    setCtxMenu(null);
  }, [elementLayerMap, removeElement, clearSelection]);

  // Pan: drag the stage background
  const handleStageDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target !== stageRef.current) return;
      setOffset(e.target.x(), e.target.y());
    },
    [setOffset],
  );

  // Zoom: mouse wheel
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const oldScale = scale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const direction = e.evt.deltaY < 0 ? 1 : -1;
      const newScale = Math.max(0.1, Math.min(10, oldScale * (1 + direction * 0.1)));
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      setScale(newScale);
      setOffset(pointer.x - mousePointTo.x * newScale, pointer.y - mousePointTo.y * newScale);
    },
    [scale, setScale, setOffset],
  );

  // Click on stage background: clear selection OR place asset
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target !== stageRef.current) return; // clicked on an element

      if (pendingAssetId) {
        // Place asset at clicked position
        const stage = stageRef.current;
        if (!stage) return;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;
        // Convert screen → world coords
        const worldX = pixelsToMeters((pointer.x - stage.x()) / scale, ppm);
        const worldY = pixelsToMeters((pointer.y - stage.y()) / scale, ppm);
        const pos = snapEnabled
          ? { x: snapToGrid(worldX, gridSize), y: snapToGrid(worldY, gridSize) }
          : { x: worldX, y: worldY };

        // Find asset definition for default size
        const asset = getAssetById(pendingAssetId);
        if (!asset) return;
        addElement(defaultLayerId, asset.id, asset.type, pos, asset.defaultSize);
        onAssetPlaced?.();
        return;
      }

      clearSelection();
    },
    [pendingAssetId, scale, snapEnabled, gridSize, defaultLayerId, addElement, clearSelection, onAssetPlaced],
  );

  // Click on element: select it
  const handleElementClick = useCallback(
    (id: UUID, e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      setCtxMenu(null);
      selectElement(id, e.evt.shiftKey);
    },
    [selectElement],
  );

  // Drag element: update position
  const handleElementDragEnd = useCallback(
    (id: UUID, worldX: number, worldY: number) => {
      const layerId = elementLayerMap.get(id);
      if (!layerId) return;
      const snapped = snapEnabled
        ? { x: snapToGrid(worldX, gridSize), y: snapToGrid(worldY, gridSize) }
        : { x: worldX, y: worldY };
      updateElement(layerId, id, { position: snapped });
    },
    [elementLayerMap, snapEnabled, gridSize, updateElement],
  );

  // Center view: start with garden centered
  const initOffsetX = (width - gardenW) / 2;
  const initOffsetY = (height - gardenH) / 2;

  const selectedCount = selectedElementIds.length;

  return (
    <div ref={containerRef} style={{ position: "relative", width, height, flexShrink: 0 }}>
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      x={offsetX !== 0 ? offsetX : initOffsetX}
      y={offsetY !== 0 ? offsetY : initOffsetY}
      scaleX={scale}
      scaleY={scale}
      draggable
      onDragEnd={handleStageDragEnd}
      onWheel={handleWheel}
      onClick={handleStageClick}
      style={{ background: "#e8f5e9", cursor: pendingAssetId ? "crosshair" : "default" }}
      data-testid="garden-canvas-stage"
    >
      {/* Background / grid layer */}
      <Layer>
        {/* Outer background */}
        <Rect
          x={-width}
          y={-height}
          width={width * 3}
          height={height * 3}
          fill="#f0f4e8"
          listening={false}
        />
        {/* Grid */}
        {gridEnabled && (
          <GridLines
            offsetX={offsetX !== 0 ? offsetX : initOffsetX}
            offsetY={offsetY !== 0 ? offsetY : initOffsetY}
            scale={scale}
            gridSize={gridSize}
            ppm={ppm}
            stageW={width / scale}
            stageH={height / scale}
          />
        )}
      </Layer>

      {/* Garden area layer */}
      <Layer>
        {/* Garden boundary fill */}
        <Rect
          x={0}
          y={0}
          width={gardenW}
          height={gardenH}
          fill="#c8e6c9"
          stroke="#4caf50"
          strokeWidth={2 / scale}
          listening={false}
        />
        {/* Garden name label */}
        <Text
          x={8 / scale}
          y={8 / scale}
          text={`${project.name}  ${project.dimensions.width}m × ${project.dimensions.height}m`}
          fontSize={Math.max(10, 14 / scale)}
          fill="#2e7d32"
          listening={false}
        />
      </Layer>

      {/* Elements layer */}
      <Layer>
        {allElements.map((el) => (
          <ElementShape
            key={el.id}
            el={el}
            ppm={ppm}
            selected={selectedElementIds.includes(el.id)}
            onClick={handleElementClick}
            onDragEnd={handleElementDragEnd}
            onContextMenu={handleElementContextMenu}
          />
        ))}
        <Transformer
          ref={transformerRef}
          rotateEnabled
          keepRatio={false}
          onTransformEnd={(e) => {
            const node = e.target;
            const id = node.id() as UUID;
            const layerId = elementLayerMap.get(id);
            if (!layerId) return;
            updateElement(layerId, id, {
              position: { x: node.x() / ppm, y: node.y() / ppm },
              size: { width: (node.width() * node.scaleX()) / ppm, height: (node.height() * node.scaleY()) / ppm },
              rotation: node.rotation(),
            });
            node.scaleX(1);
            node.scaleY(1);
          }}
        />
      </Layer>
    </Stage>

    {/* Context menu — HTML overlay so it can overflow the canvas */}
    {ctxMenu && (
      <div
        data-testid="canvas-context-menu"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: ctxMenu.x,
          top: ctxMenu.y,
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          padding: "4px 0",
          zIndex: 200,
          minWidth: 160,
          userSelect: "none",
        }}
      >
        <CtxItem icon="📋" label="Copy" testId="ctx-copy" onClick={handleCopy} />
        <CtxItem
          icon="📌"
          label={clipboard.length > 0 ? `Paste (${clipboard.length})` : "Paste"}
          testId="ctx-paste"
          onClick={handlePaste}
          disabled={clipboard.length === 0}
        />
        <div style={{ height: 1, background: "#f0f0f0", margin: "4px 0" }} />
        <CtxItem
          icon="🗑"
          label={selectedCount > 1 ? `Delete (${selectedCount})` : "Delete"}
          testId="ctx-delete"
          onClick={handleDeleteSelected}
          danger
        />
      </div>
    )}
  </div>
  );
}
