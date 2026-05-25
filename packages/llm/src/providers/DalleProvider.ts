import type { ImageGenerationProvider, ImageGenerationRequest, GeneratedImage } from "../image.js";

// DALL-E 3 API response shapes
interface DalleImageData {
  url?: string;
  revised_prompt?: string;
}

interface DalleResponse {
  data: DalleImageData[];
}

interface DalleErrorResponse {
  error?: { message?: string; code?: string; type?: string };
}

/**
 * OpenAI DALL-E 3 image generation provider.
 * Requires an OpenAI API key.
 * Returns a short-lived URL (expires ~1 hour after generation).
 */
export class DalleProvider implements ImageGenerationProvider {
  readonly name = "dall-e-3";

  constructor(private readonly apiKey: string) {}

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async generateImage(req: ImageGenerationRequest): Promise<GeneratedImage> {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: req.prompt,
        n: 1,
        size: req.size ?? "1792x1024",
        quality: req.quality ?? "hd",
        response_format: "url",
      }),
    });

    if (!response.ok) {
      let detail = "";
      try {
        const text = await response.text();
        const parsed = JSON.parse(text) as DalleErrorResponse;
        const errMsg = parsed.error?.message;
        const errCode = parsed.error?.code;
        detail = errMsg
          ? `${errCode ? `[${errCode}] ` : ""}${errMsg}`
          : text.slice(0, 300);
      } catch {
        detail = response.statusText || "Unknown error";
      }
      throw new Error(`DALL-E ${response.status}: ${detail}`);
    }

    const data = (await response.json()) as DalleResponse;
    const item = data.data[0];

    const result: GeneratedImage = {
      mimeType: "image/png",
      provider: this.name,
    };
    if (item?.url) result.url = item.url;
    if (item?.revised_prompt) result.revisedPrompt = item.revised_prompt;
    return result;
  }
}
