import type { ImageGenerationProvider, ImageGenerationRequest, GeneratedImage } from "../image.js";
/**
 * OpenAI image generation provider.
 *
 * Supports both legacy DALL-E models and the newer GPT Image family.
 * Defaults to `gpt-image-1` — the current recommended model.
 *
 * GPT Image models return base64 data; DALL-E models return short-lived URLs.
 */
export declare class DalleProvider implements ImageGenerationProvider {
  private readonly apiKey;
  private readonly model;
  readonly name: string;
  constructor(apiKey: string, model?: string);
  isConfigured(): boolean;
  supportsReferenceImage(): boolean;
  generateImage(req: ImageGenerationRequest): Promise<GeneratedImage>;
}
//# sourceMappingURL=DalleProvider.d.ts.map
