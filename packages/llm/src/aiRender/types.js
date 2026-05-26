// ─── AI Render Pipeline Types ─────────────────────────────────────────────────
// Provider-agnostic intermediate model for converting garden JSON into
// rich prompts and reference images for AI image generation.
// ─── Default values ───────────────────────────────────────────────────────────
export const DEFAULT_VIEW = {
    mode: "oblique_drone",
    cameraHeightMeters: 35,
    cameraAngleDegrees: 55,
    direction: "SE",
    lens: "natural",
    timeOfDay: "summer_afternoon",
    season: "summer",
    realism: "photorealistic",
};
export const DEFAULT_ENHANCEMENTS = {
    realisticGrass: true,
    realisticShadows: true,
    naturalPlantingDetail: true,
    stoneTerraceAroundPool: true,
    addPeople: false,
    addFurniture: false,
    addExtraTrees: false,
};
export const DEFAULT_NEGATIVE_PROMPT = [
    "No text",
    "no labels",
    "no UI",
    "no icons",
    "no grid",
    "no schematic symbols",
    "no cartoon style",
    "no miniature model look",
    "no unrealistic colors",
    "no fantasy elements",
    "no extra swimming pools",
    "no extra houses",
    "no people unless requested",
    "no cars",
    "no exaggerated tropical plants",
    "no incorrect scale",
];
export const DEFAULT_STRICTNESS = "strict";
//# sourceMappingURL=types.js.map