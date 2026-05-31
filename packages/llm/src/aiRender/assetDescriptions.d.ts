import type { Dimensions, Position } from "@mity-garden/domain";
/**
 * Returns a rich visual description for an asset suitable for AI image prompts.
 * Falls back to a humanized version of the assetId if no specific description exists.
 */
export declare function getAssetVisualDescription(assetId: string): string;
/**
 * Converts element position (x/y in metres) to a human-readable relative
 * position description based on the garden dimensions.
 *
 * The garden coordinate system has origin at top-left:
 * - x increases to the right
 * - y increases downward
 */
export declare function getPositionDescription(
  position: Position,
  gardenDimensions: Dimensions
): string;
/**
 * Converts element dimensions to a human-readable size description.
 */
export declare function getSizeDescription(size: Dimensions): string;
/**
 * Converts a human-readable label from an assetId.
 * e.g. "tree-weeping-willow" → "Weeping Willow"
 */
export declare function getAssetLabel(assetId: string): string;
//# sourceMappingURL=assetDescriptions.d.ts.map
