import type { ImageGenerationProvider, ImageGenerationRequest, GeneratedImage } from "../image.js";
/**
 * Google Imagen 3 image generation provider (via Generative Language API).
 * Requires a Google AI API key (https://aistudio.google.com/app/apikey).
 * Returns base64-encoded PNG image data.
 *
 * API docs: https://ai.google.dev/api/generate-content#generate-content-using-imagen
 */
export declare class GeminiImageProvider implements ImageGenerationProvider {
  private readonly apiKey;
  readonly name = "imagen-3";
  private readonly model;
  constructor(apiKey: string, model?: string);
  isConfigured(): boolean;
  supportsReferenceImage(): boolean;
  generateImage(req: ImageGenerationRequest): Promise<GeneratedImage>;
}
//# sourceMappingURL=GeminiImageProvider.d.ts.map
