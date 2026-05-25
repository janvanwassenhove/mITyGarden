import { v4 as uuidv4 } from "uuid";
import type {
  GardenProject,
  GardenElement,
  Layer,
  UnitSystem,
  GardenStyle,
  GardenGoal,
  Locale,
  Dimensions,
  ElementType,
  Position,
} from "./types.js";

export function createProject(overrides?: Partial<GardenProject>): GardenProject {
  const now = new Date().toISOString();
  const defaultLayerId = uuidv4();

  return {
    id: uuidv4(),
    name: "New Garden",
    createdAt: now,
    updatedAt: now,
    dimensions: { width: 20, height: 15 },
    unit: "metric",
    style: "modern",
    goals: [],
    layers: [
      {
        id: defaultLayerId,
        name: "Main Layer",
        visible: true,
        locked: false,
        order: 0,
        elements: [],
      },
    ],
    metadata: {
      language: "en",
    },
    history: { past: [], future: [] },
    ...overrides,
  };
}

export function createLayer(name: string, order: number): Layer {
  return {
    id: uuidv4(),
    name,
    visible: true,
    locked: false,
    order,
    elements: [],
  };
}

export function createElement(
  assetId: string,
  type: ElementType,
  position: Position,
  size: Dimensions,
  overrides?: Partial<GardenElement>
): GardenElement {
  return {
    id: uuidv4(),
    assetId,
    type,
    position,
    size,
    rotation: 0,
    zIndex: 0,
    locked: false,
    visible: true,
    properties: {},
    ...overrides,
  };
}

// Clamp rotation to 0–359 degrees
export function normalizeRotation(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

// Convert meters to pixels for canvas rendering
export function metersToPixels(meters: number, pixelsPerMeter: number): number {
  return meters * pixelsPerMeter;
}

// Convert pixels back to meters
export function pixelsToMeters(pixels: number, pixelsPerMeter: number): number {
  return pixels / pixelsPerMeter;
}

// Default pixels-per-meter for the canvas (can be adjusted by zoom)
export const BASE_PIXELS_PER_METER = 50;

// Default grid size in meters
export const DEFAULT_GRID_SIZE = 1.0;

// Snap a value to the nearest grid step
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

// Supported locales
export const SUPPORTED_LOCALES: Locale[] = ["en", "nl", "fr"];

export const UNIT_SYSTEMS: UnitSystem[] = ["metric", "imperial"];

export const GARDEN_STYLES: GardenStyle[] = [
  "modern",
  "classic",
  "japanese",
  "mediterranean",
  "english",
  "minimal",
  "custom",
];

export const GARDEN_GOALS: GardenGoal[] = [
  "pool",
  "playground",
  "terrace",
  "plants",
  "low-maintenance",
  "vegetable-garden",
  "outdoor-dining",
  "other",
];
