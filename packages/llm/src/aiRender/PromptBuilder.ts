// ─── Prompt Builder ───────────────────────────────────────────────────────────
// Converts an ImageGenerationScene into a structured natural-language prompt
// suitable for any AI image generation provider. Never emits raw JSON.

import type { ImageGenerationScene, StrictnessLevel, SceneView } from "./types.js";

/**
 * Build a full structured natural-language prompt from a scene.
 */
export function buildPrompt(scene: ImageGenerationScene): string {
  const sections: string[] = [
    buildRoleSection(scene),
    buildCameraSection(scene.view),
    buildSiteSection(scene),
    buildStrictnessSection(scene.strictness, scene.boundary.shapeDescription),
    buildElementsSection(scene),
    buildMaterialsSection(scene),
    buildNegativeSection(scene),
  ];
  return sections.filter(Boolean).join("\n\n");
}

/**
 * Build a compact one-paragraph prompt variant.
 */
export function buildShortPrompt(scene: ImageGenerationScene): string {
  const viewDesc = viewModeLabel(scene.view.mode);
  const heightDesc = `${scene.view.cameraHeightMeters}m altitude`;
  const angleDesc = `${scene.view.cameraAngleDegrees} degree camera angle`;

  const elementNames = scene.elements.map((e) => e.label.toLowerCase()).join(", ");

  const enhancementList: string[] = [];
  if (scene.enhancements.realisticGrass) enhancementList.push("real grass");
  if (scene.enhancements.realisticShadows) enhancementList.push("realistic shadows");
  if (scene.enhancements.stoneTerraceAroundPool) enhancementList.push("stone terrace around pool");

  const style =
    scene.view.realism === "photorealistic"
      ? "professional landscape architecture visualization"
      : scene.view.realism === "architectural_visualization"
        ? "architectural visualization render"
        : "concept render";

  const parts = [
    `Photorealistic ${viewDesc}`,
    heightDesc,
    angleDesc,
    `realistic garden in ${scene.location || "Belgium"}`,
    "strict layout from reference plan",
    "accurate object placement",
    elementNames,
    enhancementList.join(", "),
    style,
  ];

  return parts.filter(Boolean).join(", ") + ".";
}

/**
 * Build the negative prompt string.
 */
export function buildNegativePrompt(scene: ImageGenerationScene): string {
  return scene.negativePrompt.join(", ") + ".";
}

// ─── Section builders ─────────────────────────────────────────────────────────

function buildRoleSection(scene: ImageGenerationScene): string {
  const viewDesc = viewModeLabel(scene.view.mode);
  const realismDesc = realismLabel(scene.view.realism);

  return (
    `Create a highly realistic ${realismDesc} ${viewDesc} of a modern private garden design` +
    (scene.location ? ` in ${scene.location}` : "") +
    ".\n\n" +
    "Use the provided garden layout as a strict spatial reference. " +
    `The garden is an ${scene.boundary.shapeDescription}, ` +
    `approximately ${scene.dimensions.width} meters wide and ${scene.dimensions.height} meters deep. ` +
    "The scene should look like a real aerial architectural landscape photo, " +
    "not a drawing, not a game render, not a cartoon."
  );
}

function buildCameraSection(view: SceneView): string {
  const viewDesc = viewModeLabel(view.mode);
  const lensDesc = lensLabel(view.lens);
  const timeDesc = timeOfDayLabel(view.timeOfDay);
  const dirDesc = compassLabel(view.direction);

  const lines = [
    "Camera:",
    `${viewDesc} from about ${view.cameraHeightMeters} meters high, ` +
      `looking down at a ${view.cameraAngleDegrees}-degree angle from the ${dirDesc}.`,
    `${lensDesc} lens perspective.`,
    `${timeDesc} lighting, realistic shadows, high detail, natural residential surroundings.`,
    `Season: ${view.season}.`,
  ];
  return lines.join(" ");
}

function buildSiteSection(scene: ImageGenerationScene): string {
  const styleLabel = scene.style.charAt(0).toUpperCase() + scene.style.slice(1);
  const goalsDesc = scene.goals.length > 0 ? `Design goals: ${scene.goals.join(", ")}.` : "";

  return (
    "Garden style:\n" +
    `${styleLabel}, clean, realistic, elegant, green and natural. ` +
    "Well-maintained lawn, subtle planting, realistic textures, natural shadows, " +
    "Belgian climate vegetation. " +
    goalsDesc
  );
}

function buildStrictnessSection(strictness: StrictnessLevel, boundaryDesc: string): string {
  const header = "Strict layout:";

  const constraintMap: Record<StrictnessLevel, string> = {
    creative:
      "Use the layout as a loose inspiration. Keep main elements roughly in place. " +
      "Feel free to add tasteful landscaping details and creative accents.",
    balanced:
      "Respect the main layout and relative positions of major elements. " +
      "Small realistic landscaping details and subtle additions are welcome.",
    strict:
      `Respect the ${boundaryDesc} boundary shape of the garden. ` +
      "Keep the house, pool, trees and terrain in their approximate positions. " +
      "Do not add extra large objects, extra buildings, or extra pools.",
    very_strict:
      `Use the reference layout as a strict spatial guide. Respect the ${boundaryDesc}. ` +
      "Do not move main objects. Do not add extra buildings, pools, large terraces, " +
      "people, cars or large trees. Keep approximate object scale and relative positions.",
  };

  return `${header}\n${constraintMap[strictness]}`;
}

function buildElementsSection(scene: ImageGenerationScene): string {
  if (scene.elements.length === 0) return "";

  const lines = scene.elements.map((e) => {
    const rotation =
      e.rotation > 0 ? `, rotated approximately ${Math.round(e.rotation)} degrees` : "";
    return (
      `- A ${e.visualDescription}, placed in the ${e.positionDescription} of the garden` +
      `, ${e.sizeDescription}${rotation}.`
    );
  });

  return "Elements:\n" + lines.join("\n");
}

function buildMaterialsSection(scene: ImageGenerationScene): string {
  const parts = ["Materials and atmosphere:"];
  const details: string[] = [];

  if (scene.enhancements.realisticGrass) details.push("realistic grass");
  if (scene.enhancements.stoneTerraceAroundPool)
    details.push("stone paving around the house and pool");
  details.push("natural planting beds");
  if (scene.enhancements.realisticShadows) details.push("soft shadows");
  details.push("accurate scale");
  details.push("realistic tree heights and canopies");

  parts.push(
    `Use ${details.join(", ")}. ` +
      "The result should resemble a professional landscape architecture visualization " +
      "or real drone photograph after construction."
  );

  return parts.join("\n");
}

function buildNegativeSection(scene: ImageGenerationScene): string {
  if (scene.negativePrompt.length === 0) return "";
  return "Avoid:\n" + scene.negativePrompt.join(", ") + ".";
}

// ─── Label helpers ────────────────────────────────────────────────────────────

function viewModeLabel(mode: string): string {
  const map: Record<string, string> = {
    top_down: "true top-down orthographic view",
    oblique_drone: "oblique aerial drone view",
    eye_level: "human eye-level perspective view",
    cinematic: "low cinematic garden view",
  };
  return map[mode] ?? "oblique aerial drone view";
}

function realismLabel(realism: string): string {
  const map: Record<string, string> = {
    photorealistic: "photorealistic",
    architectural_visualization: "architectural visualization",
    concept_render: "concept render",
  };
  return map[realism] ?? "photorealistic";
}

function lensLabel(lens: string): string {
  const map: Record<string, string> = {
    wide_angle: "Wide-angle 16–24mm",
    natural: "Natural 28–35mm",
    telephoto: "Telephoto 70–100mm",
  };
  return map[lens] ?? "Natural 28–35mm";
}

function timeOfDayLabel(time: string): string {
  const map: Record<string, string> = {
    morning: "Soft morning",
    summer_afternoon: "Soft summer afternoon",
    golden_hour: "Golden hour",
    overcast: "Overcast diffused",
  };
  return map[time] ?? "Soft summer afternoon";
}

function compassLabel(dir: string): string {
  const map: Record<string, string> = {
    N: "north",
    NE: "north-east",
    E: "east",
    SE: "south-east",
    S: "south",
    SW: "south-west",
    W: "west",
    NW: "north-west",
  };
  return map[dir] ?? "south-east";
}
