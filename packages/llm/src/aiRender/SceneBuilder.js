// ─── Scene Builder ────────────────────────────────────────────────────────────
// Converts a GardenProject into an ImageGenerationScene — the normalized
// intermediate model consumed by the prompt builder and reference renderer.
import { DEFAULT_VIEW, DEFAULT_ENHANCEMENTS, DEFAULT_NEGATIVE_PROMPT, DEFAULT_STRICTNESS, } from "./types.js";
import { getAssetVisualDescription, getPositionDescription, getSizeDescription, getAssetLabel, } from "./assetDescriptions.js";
/**
 * Build a normalized ImageGenerationScene from a GardenProject and optional overrides.
 */
export function buildScene(project, options = {}) {
    const { dimensions, style, goals, layers, unit, mapData, boundaryVertices } = project;
    // Location
    const location = mapData?.address ?? "";
    // Merge view with defaults
    const view = { ...DEFAULT_VIEW, ...options.view };
    // Merge enhancements with defaults
    const enhancements = { ...DEFAULT_ENHANCEMENTS, ...options.enhancements };
    // Strictness
    const strictness = options.strictness ?? DEFAULT_STRICTNESS;
    // Boundary
    const boundary = buildBoundary(boundaryVertices, dimensions);
    // Collect visible elements from all visible layers
    const allElements = layers
        .filter((l) => l.visible)
        .flatMap((l) => l.elements)
        .filter((e) => e.visible);
    const elements = allElements.map((e) => buildSceneElement(e, dimensions));
    // Goals as human-readable strings
    const goalLabels = goals.map((g) => g.replace(/-/g, " "));
    return {
        location,
        dimensions: {
            width: dimensions.width,
            height: dimensions.height,
            unit,
        },
        style: style ?? "modern",
        goals: goalLabels,
        view,
        strictness,
        enhancements,
        boundary,
        elements,
        negativePrompt: [...DEFAULT_NEGATIVE_PROMPT],
        ...(options.cameraMarker !== undefined ? { cameraMarker: options.cameraMarker } : {}),
    };
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildBoundary(vertices, dimensions) {
    if (vertices && vertices.length >= 3) {
        const n = vertices.length;
        const coords = vertices
            .map((v) => `(${v.x.toFixed(1)}, ${v.y.toFixed(1)})`)
            .join(", ");
        return {
            shapeDescription: `irregular ${n}-sided polygon with vertices in metres: ${coords}`,
            vertices: vertices.map((v) => ({ x: v.x, y: v.y })),
        };
    }
    return {
        shapeDescription: `rectangular plot, ${dimensions.width}m wide by ${dimensions.height}m deep`,
        vertices: [
            { x: 0, y: 0 },
            { x: dimensions.width, y: 0 },
            { x: dimensions.width, y: dimensions.height },
            { x: 0, y: dimensions.height },
        ],
    };
}
function buildSceneElement(element, gardenDimensions) {
    return {
        id: element.id,
        category: element.type,
        assetId: element.assetId,
        label: element.customLabel ?? getAssetLabel(element.assetId),
        position: { x: element.position.x, y: element.position.y },
        size: { width: element.size.width, height: element.size.height },
        rotation: element.rotation,
        positionDescription: getPositionDescription(element.position, gardenDimensions),
        sizeDescription: getSizeDescription(element.size),
        visualDescription: getAssetVisualDescription(element.assetId),
        mustKeep: true,
    };
}
//# sourceMappingURL=SceneBuilder.js.map