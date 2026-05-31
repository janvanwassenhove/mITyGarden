import type {
  Locale,
  WizardState,
  UnitSystem,
  GardenStyle,
  GardenGoal,
  Polygon,
  GeoCoordinates,
  Position,
  MapBoundingBox,
} from "../models/types.js";
export interface UiState {
  locale: Locale;
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  propertiesPanelOpen: boolean;
  layersPanelOpen: boolean;
  assetLibraryOpen: boolean;
  wizardOpen: boolean;
  settingsOpen: boolean;
  wizard: WizardState;
}
export interface UiActions {
  setLocale: (locale: Locale) => void;
  setTheme: (theme: UiState["theme"]) => void;
  toggleSidebar: () => void;
  togglePropertiesPanel: () => void;
  toggleLayersPanel: () => void;
  toggleAssetLibrary: () => void;
  openWizard: () => void;
  closeWizard: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  wizardSetStep: (step: number) => void;
  wizardNextStep: () => void;
  wizardPrevStep: () => void;
  wizardSetDimensions: (width: number, height: number) => void;
  wizardSetUnit: (unit: UnitSystem) => void;
  wizardSetStyle: (style: GardenStyle) => void;
  wizardToggleGoal: (goal: GardenGoal) => void;
  wizardSetMapAddress: (address: string) => void;
  wizardSetMapCoordinates: (coords: GeoCoordinates) => void;
  wizardSetMapBoundary: (boundary: Polygon) => void;
  wizardSetBoundaryVertices: (vertices: Position[]) => void;
  wizardSetMapImageUrl: (url: string) => void;
  wizardSetMapBoundingBox: (bbox: MapBoundingBox | undefined) => void;
  wizardAddStructure: (polygon: Polygon) => void;
  wizardReset: () => void;
}
export type UiStore = UiState & UiActions;
export declare const uiStore: import("zustand").StoreApi<UiStore>;
//# sourceMappingURL=uiStore.d.ts.map
