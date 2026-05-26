import type { GardenProject } from "@mity-garden/domain";
import type { ImageGenerationScene, SceneOptions } from "./aiRender/types.js";
import { buildScene } from "./aiRender/SceneBuilder.js";
import { buildPrompt as buildAIPrompt, buildNegativePrompt } from "./aiRender/PromptBuilder.js";

// ─── Image generation request/response ───────────────────────────────────────

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

// ─── Provider interface ───────────────────────────────────────────────────────

export interface ImageGenerationProvider {
  readonly name: string;
  isConfigured(): boolean;
  generateImage(req: ImageGenerationRequest): Promise<GeneratedImage>;
  /** Whether this provider supports a reference/input image for image-to-image generation. */
  supportsReferenceImage(): boolean;
}

// ─── No-op fallback ───────────────────────────────────────────────────────────

export class NoOpImageProvider implements ImageGenerationProvider {
  readonly name = "none";
  isConfigured(): boolean {
    return false;
  }
  supportsReferenceImage(): boolean {
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
   * When the project has map data, the prompt includes location, coordinates,
   * and boundary shape so the generated image matches the actual site.
   */
  buildPrompt(project: GardenProject, viewType: "aerial" | "perspective" = "aerial"): string {
    const { dimensions, style, goals, layers, unit, mapData, boundaryVertices } = project;
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

    // Location context from map data
    let locationDesc = "";
    if (mapData) {
      const parts: string[] = [];
      if (mapData.address) {
        parts.push(`Located at ${mapData.address}`);
      }
      if (mapData.coordinates) {
        parts.push(`(${mapData.coordinates.lat.toFixed(5)}, ${mapData.coordinates.lng.toFixed(5)})`);
      }
      if (parts.length > 0) {
        locationDesc = `${parts.join(" ")}. `;
      }
    }

    // Boundary shape description
    let boundaryDesc = "";
    if (boundaryVertices && boundaryVertices.length >= 3) {
      const n = boundaryVertices.length;
      const coords = boundaryVertices
        .map((v) => `(${v.x.toFixed(1)}, ${v.y.toFixed(1)})`)
        .join(", ");
      boundaryDesc = `The garden has a ${n}-sided polygon boundary (vertices in ${u}: ${coords}). `;
    } else if (mapData?.boundary && mapData.boundary.length >= 3) {
      boundaryDesc = `The garden has a ${mapData.boundary.length}-sided polygon boundary matching the property plot. `;
    }

    // Existing structures on site
    let structuresDesc = "";
    const structures = mapData?.userCorrectedStructures?.length
      ? mapData.userCorrectedStructures
      : mapData?.detectedStructures;
    if (structures && structures.length > 0) {
      structuresDesc = `There ${structures.length === 1 ? "is 1 existing structure" : `are ${structures.length} existing structures`} on the property. `;
    }

    const viewDesc =
      viewType === "aerial"
        ? "photorealistic bird's-eye overhead view, architectural plan perspective"
        : "photorealistic garden perspective view from ground level, standing inside the garden";

    const styleName = style?.trim() || "natural";
    return (
      `A ${viewDesc} of a ${styleName} style garden design, ` +
      `${dimensions.width}${u} wide by ${dimensions.height}${u} deep. ` +
      `${locationDesc}${boundaryDesc}${structuresDesc}` +
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

  // ─── New AI Render Pipeline ───────────────────────────────────────────────

  /**
   * Whether the current provider supports reference image input.
   */
  supportsReferenceImage(): boolean {
    return this.provider.supportsReferenceImage();
  }

  /**
   * Build a scene from the project and optional overrides, then return the
   * structured prompt without generating an image.
   */
  buildScenePrompt(project: GardenProject, options?: SceneOptions): { scene: ImageGenerationScene; prompt: string; negativePrompt: string } {
    const scene = buildScene(project, options);
    return {
      scene,
      prompt: buildAIPrompt(scene),
      negativePrompt: buildNegativePrompt(scene),
    };
  }

  /**
   * Generate an image using the new AI render pipeline.
   * Builds a rich prompt from the scene model and optionally passes
   * a reference image if the provider supports it.
   */
  async generateFromScene(
    project: GardenProject,
    options?: SceneOptions,
    referenceImage?: Blob,
  ): Promise<GeneratedImage> {
    const { scene, prompt } = this.buildScenePrompt(project, options);

    const size = scene.view.mode === "top_down" ? "1024x1024" : "1792x1024";

    const supportsRef = this.provider.supportsReferenceImage();
    return this.provider.generateImage({
      prompt,
      size,
      quality: "hd",
      ...(supportsRef && referenceImage !== undefined ? { referenceImage } : {}),
    });
  }
}
