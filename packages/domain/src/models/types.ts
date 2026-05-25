// Core domain model types for mITyGarden

export type UUID = string;
export type Locale = "en" | "nl" | "fr";

// ─── Units ───────────────────────────────────────────────────────────────────

export type UnitSystem = "metric" | "imperial";

export interface Dimensions {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

// ─── Garden Style ─────────────────────────────────────────────────────────────

export type GardenStyle =
  | "modern"
  | "classic"
  | "japanese"
  | "mediterranean"
  | "english"
  | "minimal"
  | "custom";

// ─── Garden Goals ─────────────────────────────────────────────────────────────

export type GardenGoal =
  | "pool"
  | "playground"
  | "terrace"
  | "plants"
  | "low-maintenance"
  | "vegetable-garden"
  | "outdoor-dining"
  | "other";

// ─── Element Types ────────────────────────────────────────────────────────────

export type ElementType =
  | "pool"
  | "tree"
  | "plant"
  | "terrace-tile"
  | "grass-zone"
  | "playground"
  | "path"
  | "building"
  | "fence-wall-border"
  | "furniture"
  | "custom";

// ─── Asset Definition ─────────────────────────────────────────────────────────

export interface LocalizedLabel {
  name: string;
  description: string;
}

export interface AssetConstraints {
  snapToGrid: boolean;
  allowOverlap: boolean;
}

export interface AssetModel {
  id: string;
  label: Record<Locale, string>;
  dimensions: Dimensions;
}

export interface AssetDefinition {
  id: string;
  type: ElementType;
  category: string;
  defaultSize: Dimensions;
  minSize?: Dimensions;
  maxSize?: Dimensions;
  customSizable: boolean;
  resizable: boolean;
  rotatable: boolean;
  tags: string[];
  labels: Record<Locale, LocalizedLabel>;
  thumbnail: string; // SVG string or data URI
  models?: AssetModel[];
  constraints?: AssetConstraints;
}

// ─── Garden Element ───────────────────────────────────────────────────────────

export interface GardenElement {
  id: UUID;
  assetId: string;
  type: ElementType;
  position: Position;
  size: Dimensions;
  rotation: number; // degrees 0–359
  zIndex: number;
  locked: boolean;
  visible: boolean;
  properties: Record<string, unknown>;
  customLabel?: string;
}

// ─── Layer ───────────────────────────────────────────────────────────────────

export interface Layer {
  id: UUID;
  name: string;
  visible: boolean;
  locked: boolean;
  order: number;
  elements: GardenElement[];
}

// ─── Map Data ─────────────────────────────────────────────────────────────────

export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export type Polygon = GeoCoordinates[];

export interface MapData {
  address: string;
  coordinates: GeoCoordinates;
  zoom: number;
  boundary: Polygon;
  detectedStructures: Polygon[];
  userCorrectedStructures: Polygon[];
}

// ─── Project Metadata ─────────────────────────────────────────────────────────

export interface ProjectMetadata {
  clientName?: string;
  address?: string;
  notes?: string;
  createdBy?: string;
  language: Locale;
}

// ─── Undo/Redo History ────────────────────────────────────────────────────────

export type HistoryAction =
  | { type: "ADD_ELEMENT"; layerId: UUID; element: GardenElement }
  | { type: "REMOVE_ELEMENT"; layerId: UUID; elementId: UUID; element: GardenElement }
  | { type: "UPDATE_ELEMENT"; layerId: UUID; before: GardenElement; after: GardenElement }
  | { type: "ADD_LAYER"; layer: Layer }
  | { type: "REMOVE_LAYER"; layer: Layer }
  | { type: "UPDATE_LAYER"; before: Omit<Layer, "elements">; after: Omit<Layer, "elements"> }
  | { type: "BATCH"; actions: HistoryAction[] };

export interface HistoryStack {
  past: HistoryAction[];
  future: HistoryAction[];
}

// ─── Garden Project ───────────────────────────────────────────────────────────

export interface GardenProject {
  id: UUID;
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  dimensions: Dimensions;
  unit: UnitSystem;
  style: GardenStyle;
  goals: GardenGoal[];
  layers: Layer[];
  metadata: ProjectMetadata;
  mapData?: MapData;
  /** Polygon boundary vertices in metres, origin at top-left of bounding box. */
  boundaryVertices?: Position[];
  history: HistoryStack;
}

// ─── Wizard State ─────────────────────────────────────────────────────────────

export interface WizardState {
  step: number;
  dimensions: Dimensions;
  unit: UnitSystem;
  style: GardenStyle;
  goals: GardenGoal[];
  existingStructures: Polygon[];
  mapAddress?: string;
  mapCoordinates?: GeoCoordinates;
  mapBoundary?: Polygon;
  /** Polygon boundary in metres (computed from map or image trace). */
  boundaryVertices?: Position[];
}

export const WIZARD_TOTAL_STEPS = 5;

// ─── Canvas View State ────────────────────────────────────────────────────────

export interface CanvasViewState {
  offsetX: number;
  offsetY: number;
  scale: number;
  gridEnabled: boolean;
  gridSize: number; // in domain units (meters)
  snapEnabled: boolean;
  activeTool: CanvasTool;
}

export type CanvasTool = "select" | "pan" | "place";

// ─── Selection State ──────────────────────────────────────────────────────────

export interface SelectionState {
  selectedElementIds: UUID[];
  activeLayerId: UUID | null;
}
