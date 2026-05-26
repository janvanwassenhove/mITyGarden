import type { CanvasViewState, CanvasTool, SelectionState, UUID } from "../models/types.js";
export interface CanvasState extends CanvasViewState, SelectionState {
    mapLayerVisible: boolean;
    setOffset: (x: number, y: number) => void;
    setScale: (scale: number) => void;
    resetView: () => void;
    toggleGrid: () => void;
    setGridSize: (size: number) => void;
    toggleSnap: () => void;
    setActiveTool: (tool: CanvasTool) => void;
    toggleMapLayer: () => void;
    selectElement: (id: UUID, multi?: boolean) => void;
    deselectElement: (id: UUID) => void;
    clearSelection: () => void;
    setActiveLayer: (layerId: UUID | null) => void;
}
export declare const canvasStore: import("zustand").StoreApi<CanvasState>;
//# sourceMappingURL=canvasStore.d.ts.map