import type { GardenProject } from "@mity-garden/domain";
import type { ImageGenerationScene, SceneOptions } from "./aiRender/types.js";
export interface ImageGenerationRequest {
  prompt: string;
  /** Image dimensions — provider maps to nearest supported size. */
  size?: string;
  /** Quality hint — provider maps to model-specific values. */
  quality?: string;
  /** Optional reference image for image-to-image generation. */
  referenceImage?: Blob;
}
export interface GeneratedImage {
  /** Direct URL (DALL-E returns this). May expire after ~1 hour. */
  url?: string;
  /** Base64-encoded image data (Imagen 3 / Gemini returns this). */
  base64?: string;
  mimeType: string;
  /** Revised prompt returned by DALL-E 3. */
  revisedPrompt?: string;
  provider: string;
}
export interface ImageGenerationProvider {
  readonly name: string;
  isConfigured(): boolean;
  generateImage(req: ImageGenerationRequest): Promise<GeneratedImage>;
  /** Whether this provider supports a reference/input image for image-to-image generation. */
  supportsReferenceImage(): boolean;
}
export declare class NoOpImageProvider implements ImageGenerationProvider {
  readonly name = "none";
  isConfigured(): boolean;
  supportsReferenceImage(): boolean;
  generateImage(_req: ImageGenerationRequest): Promise<GeneratedImage>;
}
export declare class GardenImageService {
  private readonly provider;
  constructor(provider: ImageGenerationProvider);
  isAvailable(): boolean;
  providerName(): string;
  /**
   * Builds a descriptive photorealistic prompt from the garden project.
   * The prompt is suitable for both DALL-E 3 and Imagen 3.
   * When the project has map data, the prompt includes location, coordinates,
   * and boundary shape so the generated image matches the actual site.
   */
  buildPrompt(project: GardenProject, viewType?: "aerial" | "perspective"): string;
  generateFromProject(
    project: GardenProject,
    viewType?: "aerial" | "perspective"
  ): Promise<GeneratedImage>;
  /**
   * Whether the current provider supports reference image input.
   */
  supportsReferenceImage(): boolean;
  /**
   * Build a scene from the project and optional overrides, then return the
   * structured prompt without generating an image.
   */
  buildScenePrompt(
    project: GardenProject,
    options?: SceneOptions
  ): {
    scene: ImageGenerationScene;
    prompt: string;
    negativePrompt: string;
  };
  /**
   * Generate an image using the new AI render pipeline.
   * Builds a rich prompt from the scene model and optionally passes
   * a reference image if the provider supports it.
   */
  generateFromScene(
    project: GardenProject,
    options?: SceneOptions,
    referenceImage?: Blob
  ): Promise<GeneratedImage>;
}
//# sourceMappingURL=image.d.ts.map
