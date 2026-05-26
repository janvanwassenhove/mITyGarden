// ─── Asset Visual Descriptions for AI Image Generation ────────────────────────
// Maps assetId → rich visual description string for use in AI image prompts.
// Provides position and size description helpers.

import type { Dimensions, Position } from "@mity-garden/domain";

// ─── Visual description map ──────────────────────────────────────────────────

const ASSET_VISUAL_DESCRIPTIONS: Record<string, string> = {
  // Pools
  "pool-rectangular":
    "rectangular swimming pool with clear turquoise water, clean edges, light natural stone coping, realistic reflections",
  "pool-oval":
    "oval swimming pool with clear turquoise water, smooth curved edges, light stone coping, realistic reflections",
  "pool-l-shape":
    "L-shaped swimming pool with clear turquoise water, geometric form, light natural stone coping, realistic reflections",
  "pool-freeform":
    "freeform swimming pool with clear turquoise water, natural organic curved shape, light natural stone coping, realistic reflections",
  "pool-plunge":
    "small plunge pool with clear turquoise water, compact rectangular shape, modern stone coping",

  // Trees
  "tree-oak":
    "mature oak tree with broad spreading canopy, deep green foliage, thick trunk, realistic height and natural shadow",
  "tree-pine":
    "mature pine tree, dark green evergreen canopy, conical shape, realistic height and shadow",
  "tree-birch":
    "mature birch tree with light bark, delicate open canopy, fine green leaves, slender white trunk",
  "tree-apple":
    "small mature apple tree with natural rounded canopy, green foliage, fruit-bearing appearance",
  "tree-palm":
    "tall palm tree with long fronds, slender trunk, tropical appearance",
  "tree-magnolia":
    "flowering magnolia tree with rounded canopy and subtle pink blossom accents, dark green glossy leaves",
  "tree-bamboo":
    "bamboo clump with tall slender canes, dense narrow green foliage, upright growth",
  "tree-weeping-willow":
    "mature weeping willow tree with soft hanging branches and broad green canopy, elegant draping form",

  // Plants
  "plant-rose-bush":
    "flowering rose bush with green foliage and colorful blooms, compact rounded form",
  "plant-lavender":
    "lavender planting with purple flower spikes and silvery-green foliage, low growing",
  "plant-boxwood":
    "neatly trimmed boxwood hedge or topiary, dense dark green compact foliage",
  "plant-hydrangea":
    "hydrangea shrub with large round flower clusters in blue or pink, broad green leaves",
  "plant-ornamental-grass":
    "ornamental grass with graceful arching blades, natural flowing texture, subtle seed heads",

  // Terrace / paving
  "terrace-concrete":
    "concrete paving terrace with smooth modern surface, clean joints, light grey tone",
  "terrace-natural-stone":
    "natural stone terrace with irregular flagstone pattern, warm earth tones, subtle texture",
  "terrace-wood-decking":
    "wooden decking terrace with horizontal plank boards, warm brown timber, natural grain",
  "terrace-gravel":
    "gravel surface area with fine natural aggregate, warm grey-beige tone, subtle texture",

  // Grass zones
  "grass-lawn":
    "well-maintained green lawn with even mowing, lush healthy grass, realistic texture",
  "grass-meadow":
    "wildflower meadow with mixed native grasses and colorful wildflowers, natural appearance",

  // Playground
  "playground-swingset":
    "children's swing set with A-frame structure, two seats, safe landing area",
  "playground-sandbox":
    "children's sandbox with wooden frame, clean sand fill, play area",
  "playground-trampoline":
    "round in-ground trampoline with safety net, recessed into lawn",

  // Paths
  "path-stepping-stones":
    "stepping stone path with natural irregularly shaped flat stones set into lawn",
  "path-paved":
    "paved garden path with brick or stone pavers, clean edges, gentle curves",

  // Buildings
  "building-house":
    "modern Belgian detached house with dark pitched roof, light facade materials and dark window frames",
  "building-shed":
    "small garden shed with pitched roof, wooden cladding, compact storage structure",
  "building-greenhouse":
    "glass greenhouse with aluminum or steel frame, transparent panels, gabled roof",
  "building-gazebo":
    "open garden gazebo or pergola with decorative roof structure, seating area beneath",

  // Fences, walls & borders
  "fence-wood":
    "wooden garden fence with vertical boards, natural timber finish, privacy height",
  "fence-hedge":
    "neatly maintained green hedge, dense foliage, natural garden boundary",
  "wall-brick":
    "brick garden wall with traditional masonry, warm red-brown tones, solid construction",

  // Furniture
  "furniture-dining-set":
    "outdoor dining table and chairs set, modern design, ready for garden meals",
  "furniture-lounge-set":
    "outdoor lounge set with comfortable cushioned seating, modern garden furniture",
  "furniture-bbq":
    "built-in barbecue grill or outdoor kitchen station, stone or metal construction",

  // Terrain features
  "terrain-wadi":
    "subtle curved wadi / rain garden depression with moisture-loving planting, natural drainage feature",
  "terrain-slope":
    "gentle garden slope or gradient with ground cover planting, natural terrain transition",
  "terrain-pond":
    "natural garden pond with aquatic plants, water lilies, organic shape, realistic water surface",
  "terrain-raised-bed":
    "small rectangular raised planting bed with natural stone or timber edging and low planting",
  "terrain-sunken-area":
    "sunken garden area or conversation pit, lower level with surrounding retaining edges",
  "terrain-berm":
    "gentle earth berm or raised mound with ground cover, creating natural visual screening",
};

/**
 * Returns a rich visual description for an asset suitable for AI image prompts.
 * Falls back to a humanized version of the assetId if no specific description exists.
 */
export function getAssetVisualDescription(assetId: string): string {
  return ASSET_VISUAL_DESCRIPTIONS[assetId] ?? assetId.replace(/-/g, " ");
}

/**
 * Converts element position (x/y in metres) to a human-readable relative
 * position description based on the garden dimensions.
 *
 * The garden coordinate system has origin at top-left:
 * - x increases to the right
 * - y increases downward
 */
export function getPositionDescription(
  position: Position,
  gardenDimensions: Dimensions,
): string {
  const xRatio = position.x / gardenDimensions.width;
  const yRatio = position.y / gardenDimensions.height;

  const horizontal = xRatio < 0.33 ? "left" : xRatio > 0.66 ? "right" : "central";
  const vertical = yRatio < 0.33 ? "upper" : yRatio > 0.66 ? "lower" : "middle";

  if (horizontal === "central" && vertical === "middle") return "central area";
  if (horizontal === "central") return `${vertical} central area`;
  if (vertical === "middle") return `${horizontal} side`;
  return `${vertical}-${horizontal} area`;
}

/**
 * Converts element dimensions to a human-readable size description.
 */
export function getSizeDescription(size: Dimensions): string {
  const w = Math.round(size.width * 10) / 10;
  const h = Math.round(size.height * 10) / 10;
  if (Math.abs(w - h) < 0.5) return `approximately ${w} metres across`;
  return `approximately ${w} by ${h} metres`;
}

/**
 * Converts a human-readable label from an assetId.
 * e.g. "tree-weeping-willow" → "Weeping Willow"
 */
export function getAssetLabel(assetId: string): string {
  const parts = assetId.split("-");
  // Remove the category prefix (first segment)
  const nameParts = parts.slice(1);
  if (nameParts.length === 0) {
    const first = parts[0] ?? assetId;
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
  return nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}
