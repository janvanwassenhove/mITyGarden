export type ViewMode = "top_down" | "oblique_drone" | "eye_level" | "cinematic";
export type RealismLevel = "photorealistic" | "architectural_visualization" | "concept_render";
export type StrictnessLevel = "creative" | "balanced" | "strict" | "very_strict";
export type TimeOfDay = "morning" | "summer_afternoon" | "golden_hour" | "overcast";
export type Season = "spring" | "summer" | "autumn" | "winter";
export type Lens = "wide_angle" | "natural" | "telephoto";
export type CompassDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
export type AspectRatio = "16:9" | "4:3" | "1:1" | "3:2";
export interface SceneView {
    mode: ViewMode;
    cameraHeightMeters: number;
    cameraAngleDegrees: number;
    direction: CompassDirection;
    lens: Lens;
    timeOfDay: TimeOfDay;
    season: Season;
    realism: RealismLevel;
}
export interface SceneEnhancements {
    realisticGrass: boolean;
    realisticShadows: boolean;
    naturalPlantingDetail: boolean;
    stoneTerraceAroundPool: boolean;
    addPeople: boolean;
    addFurniture: boolean;
    addExtraTrees: boolean;
}
export interface SceneElement {
    id: string;
    category: string;
    assetId: string;
    label: string;
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
    rotation: number;
    positionDescription: string;
    sizeDescription: string;
    visualDescription: string;
    mustKeep: boolean;
}
export interface SceneBoundary {
    shapeDescription: string;
    vertices: Array<{
        x: number;
        y: number;
    }>;
}
export interface CameraMarker {
    position: {
        x: number;
        y: number;
    };
    target: {
        x: number;
        y: number;
    };
    heightMeters: number;
    lens: Lens;
}
export interface ImageGenerationScene {
    location: string;
    dimensions: {
        width: number;
        height: number;
        unit: "metric" | "imperial";
    };
    style: string;
    goals: string[];
    view: SceneView;
    strictness: StrictnessLevel;
    enhancements: SceneEnhancements;
    boundary: SceneBoundary;
    elements: SceneElement[];
    negativePrompt: string[];
    cameraMarker?: CameraMarker;
}
/** Options passed to SceneBuilder to override defaults. */
export interface SceneOptions {
    view?: Partial<SceneView>;
    strictness?: StrictnessLevel;
    enhancements?: Partial<SceneEnhancements>;
    cameraMarker?: CameraMarker;
}
/** Extended image generation request — provider-agnostic. */
export interface AIImageGenerationRequest {
    provider: string;
    prompt: string;
    negativePrompt?: string;
    referenceImage?: Blob | string;
    aspectRatio?: AspectRatio;
    quality?: "standard" | "high";
    size?: string;
    seed?: number;
    metadata?: {
        projectId: string;
        viewMode: string;
        strictness: string;
    };
}
export interface RenderPreset {
    name: string;
    view: SceneView;
    strictness: StrictnessLevel;
    enhancements: SceneEnhancements;
}
export declare const DEFAULT_VIEW: SceneView;
export declare const DEFAULT_ENHANCEMENTS: SceneEnhancements;
export declare const DEFAULT_NEGATIVE_PROMPT: string[];
export declare const DEFAULT_STRICTNESS: StrictnessLevel;
//# sourceMappingURL=types.d.ts.map