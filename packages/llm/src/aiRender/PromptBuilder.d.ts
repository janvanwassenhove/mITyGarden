import type { ImageGenerationScene } from "./types.js";
/**
 * Build a full structured natural-language prompt from a scene.
 */
export declare function buildPrompt(scene: ImageGenerationScene): string;
/**
 * Build a compact one-paragraph prompt variant.
 */
export declare function buildShortPrompt(scene: ImageGenerationScene): string;
/**
 * Build the negative prompt string.
 */
export declare function buildNegativePrompt(scene: ImageGenerationScene): string;
//# sourceMappingURL=PromptBuilder.d.ts.map
