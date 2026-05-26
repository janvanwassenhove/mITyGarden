import type { ImageGenerationProvider, ImageGenerationRequest, GeneratedImage } from "../image.js";

// ─── OpenAI Images API response shapes ────────────────────────────────────────

interface OpenAIImageData {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

interface OpenAIImagesResponse {
  data: OpenAIImageData[];
}

interface OpenAIErrorResponse {
  error?: { message?: string; code?: string; type?: string };
}

// ─── Model detection helpers ──────────────────────────────────────────────────

/** GPT Image models (gpt-image-1, gpt-image-1.5, gpt-image-2, etc.) */
function isGptImageModel(model: string): boolean {
  return model.startsWith("gpt-image-");
}

/** Map generic quality values to model-specific ones. */
function mapQuality(quality: string | undefined, model: string): string {
  if (!quality) return isGptImageModel(model) ? "auto" : "hd";
  if (isGptImageModel(model)) {
    // GPT Image models accept: low, medium, high, auto
    if (quality === "hd" || quality === "high") return "high";
    if (quality === "standard" || quality === "medium") return "medium";
    return quality;
  }
  // DALL-E models accept: standard, hd
  if (quality === "high") return "hd";
  if (quality === "medium" || quality === "low") return "standard";
  return quality;
}

/** Map size to model-compatible values. */
function mapSize(size: string | undefined, model: string): string {
  if (isGptImageModel(model)) {
    // GPT Image models accept 1024x1024, 1536x1024, 1024x1536, auto
    if (size === "1792x1024") return "1536x1024";
    if (size === "1024x1792") return "1024x1536";
    return size ?? "1024x1024";
  }
  // DALL-E 3 accepts 1024x1024, 1792x1024, 1024x1792
  if (size === "1536x1024") return "1792x1024";
  if (size === "1024x1536") return "1024x1792";
  return size ?? "1792x1024";
}

/**
 * OpenAI image generation provider.
 *
 * Supports both legacy DALL-E models and the newer GPT Image family.
 * Defaults to `gpt-image-1` — the current recommended model.
 *
 * GPT Image models return base64 data; DALL-E models return short-lived URLs.
 */
export class DalleProvider implements ImageGenerationProvider {
  readonly name: string;

  constructor(
    private readonly apiKey: string,
    private readonly model: string = "gpt-image-1",
  ) {
    this.name = model;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  supportsReferenceImage(): boolean {
    return isGptImageModel(this.model);
  }

  async generateImage(req: ImageGenerationRequest): Promise<GeneratedImage> {
    const model = this.model;
    const isGpt = isGptImageModel(model);

    // Build the request body — parameters differ between model families
    const body: Record<string, unknown> = {
      model,
      prompt: req.prompt,
      n: 1,
      size: mapSize(req.size, model),
      quality: mapQuality(req.quality, model),
    };

    // output_format (png/jpeg/webp) is only documented for GPT Image models.
    // DALL-E models default to returning a URL; we handle both url and b64_json below.
    if (isGpt) {
      body["output_format"] = "png";
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let detail = "";
      try {
        const text = await response.text();
        const parsed = JSON.parse(text) as OpenAIErrorResponse;
        const errMsg = parsed.error?.message;
        const errCode = parsed.error?.code;
        detail = errMsg
          ? `${errCode ? `[${errCode}] ` : ""}${errMsg}`
          : text.slice(0, 300);
      } catch {
        detail = response.statusText || "Unknown error";
      }
      throw new Error(`OpenAI Image (${model}) ${response.status}: ${detail}`);
    }

    const data = (await response.json()) as OpenAIImagesResponse;
    const item = data.data[0];

    const result: GeneratedImage = {
      mimeType: "image/png",
      provider: this.name,
    };

    if (item?.b64_json) result.base64 = item.b64_json;
    if (item?.url) result.url = item.url;
    if (item?.revised_prompt) result.revisedPrompt = item.revised_prompt;
    return result;
  }
}
