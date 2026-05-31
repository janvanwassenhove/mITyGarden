export type {
  LLMProvider,
  LLMMessage,
  LLMResponse,
  GardenLayoutSuggestion,
  GardenProposalDocument,
  SuggestedPlacement,
} from "./types.js";
export { GardenLLMService, NoOpLLMProvider } from "./types.js";
export { OpenAIProvider } from "./providers/OpenAIProvider.js";
export { AnthropicProvider } from "./providers/AnthropicProvider.js";
export type { ImageGenerationProvider, ImageGenerationRequest, GeneratedImage } from "./image.js";
export { GardenImageService, NoOpImageProvider } from "./image.js";
export { DalleProvider } from "./providers/DalleProvider.js";
export { GeminiImageProvider } from "./providers/GeminiImageProvider.js";

// ─── AI Render Pipeline ──────────────────────────────────────────────────────
export type {
  ViewMode,
  RealismLevel,
  StrictnessLevel,
  TimeOfDay,
  Season,
  Lens,
  CompassDirection,
  AspectRatio,
  SceneView,
  SceneEnhancements,
  SceneElement,
  SceneBoundary,
  CameraMarker,
  ImageGenerationScene,
  SceneOptions,
  AIImageGenerationRequest,
  RenderPreset,
} from "./aiRender/index.js";
export {
  DEFAULT_VIEW,
  DEFAULT_ENHANCEMENTS,
  DEFAULT_NEGATIVE_PROMPT,
  DEFAULT_STRICTNESS,
  getAssetVisualDescription,
  getPositionDescription,
  getSizeDescription,
  getAssetLabel,
  buildScene,
  buildPrompt,
  buildShortPrompt,
  buildNegativePrompt,
} from "./aiRender/index.js";
