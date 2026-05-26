import { createStore } from "zustand/vanilla";
import { WIZARD_TOTAL_STEPS } from "../models/types.js";
const defaultWizard = {
    step: 1,
    dimensions: { width: 20, height: 15 },
    unit: "metric",
    style: "modern",
    goals: [],
    existingStructures: [],
};
export const uiStore = createStore()((set, get) => ({
    locale: "en",
    theme: "system",
    sidebarOpen: true,
    propertiesPanelOpen: true,
    layersPanelOpen: true,
    assetLibraryOpen: true,
    wizardOpen: false,
    settingsOpen: false,
    wizard: defaultWizard,
    setLocale: (locale) => set({ locale }),
    setTheme: (theme) => set({ theme }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    togglePropertiesPanel: () => set((s) => ({ propertiesPanelOpen: !s.propertiesPanelOpen })),
    toggleLayersPanel: () => set((s) => ({ layersPanelOpen: !s.layersPanelOpen })),
    toggleAssetLibrary: () => set((s) => ({ assetLibraryOpen: !s.assetLibraryOpen })),
    openWizard: () => set({ wizardOpen: true }),
    closeWizard: () => set({ wizardOpen: false }),
    openSettings: () => set({ settingsOpen: true }),
    closeSettings: () => set({ settingsOpen: false }),
    wizardSetStep: (step) => {
        const clamped = Math.max(1, Math.min(WIZARD_TOTAL_STEPS, step));
        set((s) => ({ wizard: { ...s.wizard, step: clamped } }));
    },
    wizardNextStep: () => {
        const { wizard } = get();
        if (wizard.step < WIZARD_TOTAL_STEPS) {
            set((s) => ({ wizard: { ...s.wizard, step: s.wizard.step + 1 } }));
        }
    },
    wizardPrevStep: () => {
        const { wizard } = get();
        if (wizard.step > 1) {
            set((s) => ({ wizard: { ...s.wizard, step: s.wizard.step - 1 } }));
        }
    },
    wizardSetDimensions: (width, height) => {
        set((s) => ({ wizard: { ...s.wizard, dimensions: { width, height } } }));
    },
    wizardSetUnit: (unit) => {
        set((s) => ({ wizard: { ...s.wizard, unit } }));
    },
    wizardSetStyle: (style) => {
        set((s) => ({ wizard: { ...s.wizard, style } }));
    },
    wizardToggleGoal: (goal) => {
        const { wizard } = get();
        const goals = wizard.goals.includes(goal)
            ? wizard.goals.filter((g) => g !== goal)
            : [...wizard.goals, goal];
        set((s) => ({ wizard: { ...s.wizard, goals } }));
    },
    wizardSetMapAddress: (address) => {
        set((s) => ({ wizard: { ...s.wizard, mapAddress: address } }));
    },
    wizardSetMapCoordinates: (coords) => {
        set((s) => ({ wizard: { ...s.wizard, mapCoordinates: coords } }));
    },
    wizardSetMapBoundary: (boundary) => {
        set((s) => ({ wizard: { ...s.wizard, mapBoundary: boundary } }));
    },
    wizardSetBoundaryVertices: (vertices) => {
        set((s) => ({ wizard: { ...s.wizard, boundaryVertices: vertices } }));
    },
    wizardSetMapImageUrl: (url) => {
        set((s) => ({ wizard: { ...s.wizard, mapImageUrl: url } }));
    },
    wizardSetMapBoundingBox: (bbox) => {
        set((s) => {
            if (bbox === undefined) {
                const { mapBoundingBox: _removed, ...wizardRest } = s.wizard;
                return { wizard: wizardRest };
            }
            return { wizard: { ...s.wizard, mapBoundingBox: bbox } };
        });
    },
    wizardAddStructure: (polygon) => {
        set((s) => ({
            wizard: {
                ...s.wizard,
                existingStructures: [...s.wizard.existingStructures, polygon],
            },
        }));
    },
    wizardReset: () => set({ wizard: defaultWizard }),
}));
//# sourceMappingURL=uiStore.js.map