import type { GardenProject } from "@mity-garden/domain";

// ─── Image generation request/response ───────────────────────────────────────

export interface ImageGenerationRequest {
  prompt: string;
  /** Landscape wide: best for garden overhead views */
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
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

// ─── Provider interface ───────────────────────────────────────────────────────

export interface ImageGenerationProvider {
  readonly name: string;
  isConfigured(): boolean;
  generateImage(req: ImageGenerationRequest): Promise<GeneratedImage>;
}

// ─── No-op fallback ───────────────────────────────────────────────────────────

export class NoOpImageProvider implements ImageGenerationProvider {
  readonly name = "none";
  isConfigured(): boolean {
    return false;
  }
  async generateImage(_req: ImageGenerationRequest): Promise<GeneratedImage> {
    throw new Error("No image generation provider configured.");
  }
}

// ─── Garden Image Service ─────────────────────────────────────────────────────

export class GardenImageService {
  constructor(private readonly provider: ImageGenerationProvider) {}

  isAvailable(): boolean {
    return this.provider.isConfigured();
  }

  providerName(): string {
    return this.provider.name;
  }

  /**
   * Builds a descriptive photorealistic prompt from the garden project.
   * The prompt is suitable for both DALL-E 3 and Imagen 3.
   */
  buildPrompt(project: GardenProject, viewType: "aerial" | "perspective" = "aerial"): string {
    const { dimensions, style, goals, layers, unit } = project;
    const u = unit === "metric" ? "m" : "ft";
    const elementIds = layers
      .flatMap((l) => l.elements)
      .map((e) => e.assetId.replace(/-/g, " "))
      .filter((v, i, a) => a.indexOf(v) === i) // unique
      .slice(0, 12); // cap to avoid prompt length issues

    const elementList =
      elementIds.length > 0
        ? `Garden elements include: ${elementIds.join(", ")}.`
        : "";

    const goalList = goals.length > 0 ? `Design goals: ${goals.map((g) => g.replace(/-/g, " ")).join(", ")}.` : "";

    const viewDesc =
      viewType === "aerial"
        ? "photorealistic bird's-eye overhead view, architectural plan perspective"
        : "photorealistic garden perspective view from ground level, standing inside the garden";

    return (
      `A ${viewDesc} of a ${style} style garden design, ` +
      `${dimensions.width}${u} wide by ${dimensions.height}${u} deep. ` +
      `${goalList} ${elementList} ` +
      `Professional landscape architecture 3D visualisation. ` +
      `Lush vegetation, golden hour lighting, soft shadows, highly detailed, ` +
      `photorealistic CGI render, 8K resolution.`
    ).trim();
  }

  async generateFromProject(
    project: GardenProject,
    viewType: "aerial" | "perspective" = "aerial",
  ): Promise<GeneratedImage> {
    const prompt = this.buildPrompt(project, viewType);
    return this.provider.generateImage({
      prompt,
      size: viewType === "aerial" ? "1024x1024" : "1792x1024",
      quality: "hd",
    });
  }
}
