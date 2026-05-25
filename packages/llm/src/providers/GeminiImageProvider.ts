import type { ImageGenerationProvider, ImageGenerationRequest, GeneratedImage } from "../image.js";

// Google Imagen 3 API response shapes
interface ImagenPrediction {
  bytesBase64Encoded: string;
  mimeType?: string;
}

interface ImagenResponse {
  predictions?: ImagenPrediction[];
}

/**
 * Google Imagen 3 image generation provider (via Generative Language API).
 * Requires a Google AI API key (https://aistudio.google.com/app/apikey).
 * Returns base64-encoded PNG image data.
 *
 * API docs: https://ai.google.dev/api/generate-content#generate-content-using-imagen
 */
export class GeminiImageProvider implements ImageGenerationProvider {
  readonly name = "imagen-3";
  private readonly model: string;

  constructor(
    private readonly apiKey: string,
    model = "imagen-3.0-generate-002",
  ) {
    this.model = model;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async generateImage(req: ImageGenerationRequest): Promise<GeneratedImage> {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:predict` +
      `?key=${encodeURIComponent(this.apiKey)}`;

    // Map size to aspect ratio
    const sizeToRatio: Record<string, string> = {
      "1024x1024": "1:1",
      "1792x1024": "16:9",
      "1024x1792": "9:16",
    };
    const aspectRatio = sizeToRatio[req.size ?? "1792x1024"] ?? "16:9";

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: req.prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio,
          ...(req.quality === "hd" ? { outputMimeType: "image/png" } : {}),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Imagen API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as ImagenResponse;
    const prediction = data.predictions?.[0];

    if (!prediction?.bytesBase64Encoded) {
      throw new Error("Imagen API returned no image data.");
    }

    return {
      base64: prediction.bytesBase64Encoded,
      mimeType: prediction.mimeType ?? "image/png",
      provider: this.name,
    };
  }
}
