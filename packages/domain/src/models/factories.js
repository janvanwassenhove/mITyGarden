import { v4 as uuidv4 } from "uuid";
export function createProject(overrides) {
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
export function createLayer(name, order) {
    return {
        id: uuidv4(),
        name,
        visible: true,
        locked: false,
        order,
        elements: [],
    };
}
export function createElement(assetId, type, position, size, overrides) {
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
export function normalizeRotation(degrees) {
    return ((degrees % 360) + 360) % 360;
}
// Convert meters to pixels for canvas rendering
export function metersToPixels(meters, pixelsPerMeter) {
    return meters * pixelsPerMeter;
}
// Convert pixels back to meters
export function pixelsToMeters(pixels, pixelsPerMeter) {
    return pixels / pixelsPerMeter;
}
// Default pixels-per-meter for the canvas (can be adjusted by zoom)
export const BASE_PIXELS_PER_METER = 50;
// Default grid size in meters
export const DEFAULT_GRID_SIZE = 1.0;
// Snap a value to the nearest grid step
export function snapToGrid(value, gridSize) {
    return Math.round(value / gridSize) * gridSize;
}
// Supported locales
export const SUPPORTED_LOCALES = ["en", "nl", "fr"];
export const UNIT_SYSTEMS = ["metric", "imperial"];
export const GARDEN_STYLES = [
    "modern",
    "classic",
    "japanese",
    "mediterranean",
    "english",
    "minimal",
    "custom",
];
export const GARDEN_GOALS = [
    "pool",
    "playground",
    "terrace",
    "plants",
    "low-maintenance",
    "vegetable-garden",
    "outdoor-dining",
    "other",
];
//# sourceMappingURL=factories.js.map