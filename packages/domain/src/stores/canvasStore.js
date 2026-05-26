import { createStore } from "zustand/vanilla";
const DEFAULT_VIEW = {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    gridEnabled: true,
    gridSize: 1.0,
    snapEnabled: true,
    activeTool: "select",
};
export const canvasStore = createStore()((set, get) => ({
    ...DEFAULT_VIEW,
    mapLayerVisible: true,
    selectedElementIds: [],
    activeLayerId: null,
    setOffset: (x, y) => set({ offsetX: x, offsetY: y }),
    setScale: (scale) => set({ scale: Math.max(0.1, Math.min(10, scale)) }),
    resetView: () => set({ offsetX: 0, offsetY: 0, scale: 1 }),
    toggleGrid: () => set((s) => ({ gridEnabled: !s.gridEnabled })),
    setGridSize: (size) => set({ gridSize: Math.max(0.25, size) }),
    toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
    setActiveTool: (tool) => set({ activeTool: tool }),
    toggleMapLayer: () => set((s) => ({ mapLayerVisible: !s.mapLayerVisible })),
    selectElement: (id, multi = false) => {
        const { selectedElementIds } = get();
        if (multi) {
            set({
                selectedElementIds: selectedElementIds.includes(id)
                    ? selectedElementIds.filter((eid) => eid !== id)
                    : [...selectedElementIds, id],
            });
        }
        else {
            set({ selectedElementIds: [id] });
        }
    },
    deselectElement: (id) => {
        set((s) => ({ selectedElementIds: s.selectedElementIds.filter((eid) => eid !== id) }));
    },
    clearSelection: () => set({ selectedElementIds: [] }),
    setActiveLayer: (layerId) => set({ activeLayerId: layerId }),
}));
//# sourceMappingURL=canvasStore.js.map