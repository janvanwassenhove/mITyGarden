import React, { useRef, useCallback, useEffect } from "react";
import { Stage, Layer, Rect, Text, Group, Transformer } from "react-konva";
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

// ─── Single Element ────────────────────────────────────────────────────────────

function ElementShape({
  el,
  ppm,
  selected,
  onClick,
  onDragEnd,
}: {
  el: GardenElement;
  ppm: number;
  selected: boolean;
  onClick: (id: UUID, evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (id: UUID, x: number, y: number) => void;
}): React.ReactElement {
  const w = el.size.width * ppm;
  const h = el.size.height * ppm;
  const x = el.position.x * ppm;
  const y = el.position.y * ppm;

  // Pick fill color based on element type
  const fill = FILL_BY_TYPE[el.type] ?? "#90a4ae";
  const stroke = selected ? "#1565c0" : "#616161";

  return (
    <Group
      x={x}
      y={y}
      width={w}
      height={h}
      rotation={el.rotation}
      draggable
      onClick={(e) => onClick(el.id, e)}
      onDragEnd={(e) => {
        onDragEnd(el.id, e.target.x() / ppm, e.target.y() / ppm);
      }}
      id={el.id}
    >
      <Rect
        width={w}
        height={h}
        fill={fill}
        stroke={stroke}
        strokeWidth={selected ? 2 : 1}
        cornerRadius={el.type === "tree" || el.type === "pool" ? Math.min(w, h) / 2 : 4}
        opacity={0.85}
      />
      <Text
        text={el.assetId.split("-").slice(1).join(" ")}
        fontSize={Math.max(9, Math.min(12, Math.min(w, h) * 0.2))}
        fill={selected ? "#0d47a1" : "#212121"}
        align="center"
        verticalAlign="middle"
        width={w}
        height={h}
        listening={false}
        ellipsis
      />
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

  return (
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
  );
}
