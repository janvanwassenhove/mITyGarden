import type { LLMProvider } from "@mity-garden/llm";
import type { ImageGenerationProvider } from "@mity-garden/llm";
import { OpenAIProvider, AnthropicProvider, NoOpLLMProvider } from "@mity-garden/llm";
import { DalleProvider, GeminiImageProvider, NoOpImageProvider } from "@mity-garden/llm";
import { getEffectiveApiKeys } from "./apiKeys.js";

// ─── Available provider definitions ───────────────────────────────────────────

export type LLMProviderName = "openai" | "anthropic";
export type ImageProviderName = "gpt-image-1" | "imagen-3";

export interface ProviderOption {
  id: string;
  label: string;
  available: boolean;
}

/** Return which text-LLM providers have valid API keys. */
export function getAvailableLLMProviders(): ProviderOption[] {
  const keys = getEffectiveApiKeys();
  return [
    { id: "openai", label: "OpenAI (GPT-4o-mini)", available: keys.openai.length > 0 },
    { id: "anthropic", label: "Anthropic (Claude 3 Haiku)", available: keys.anthropic.length > 0 },
  ];
}

/** Return which image providers have valid API keys. */
export function getAvailableImageProviders(): ProviderOption[] {
  const keys = getEffectiveApiKeys();
  return [
    { id: "gpt-image-1", label: "GPT Image 1 (OpenAI)", available: keys.openai.length > 0 },
    { id: "imagen-3", label: "Imagen 3 (Gemini)", available: keys.gemini.length > 0 },
  ];
}

// ─── Text LLM factory ─────────────────────────────────────────────────────────

export function createLLMProvider(name?: LLMProviderName): LLMProvider {
  const keys = getEffectiveApiKeys();
  if (name === "openai" && keys.openai.length > 0) return new OpenAIProvider(keys.openai);
  if (name === "anthropic" && keys.anthropic.length > 0)
    return new AnthropicProvider(keys.anthropic);
  // Auto-select first available
  if (keys.openai.length > 0) return new OpenAIProvider(keys.openai);
  if (keys.anthropic.length > 0) return new AnthropicProvider(keys.anthropic);
  return new NoOpLLMProvider();
}

// ─── Image generation factory ─────────────────────────────────────────────────

export function createImageProvider(name?: ImageProviderName): ImageGenerationProvider {
  const keys = getEffectiveApiKeys();
  if (name === "gpt-image-1" && keys.openai.length > 0)
    return new DalleProvider(keys.openai, "gpt-image-1");
  if (name === "imagen-3" && keys.gemini.length > 0) return new GeminiImageProvider(keys.gemini);
  // Auto-select first available
  if (keys.openai.length > 0) return new DalleProvider(keys.openai, "gpt-image-1");
  if (keys.gemini.length > 0) return new GeminiImageProvider(keys.gemini);
  return new NoOpImageProvider();
}

// ─── Preference persistence ───────────────────────────────────────────────────

const LS_LLM_PROVIDER = "mitygarden_llm_provider";
const LS_IMAGE_PROVIDER = "mitygarden_image_provider";

export function getDefaultLLMProviderName(): LLMProviderName | undefined {
  const v = localStorage.getItem(LS_LLM_PROVIDER);
  if (v === "openai" || v === "anthropic") return v;
  return undefined;
}

export function setDefaultLLMProviderName(name: LLMProviderName): void {
  localStorage.setItem(LS_LLM_PROVIDER, name);
}

export function getDefaultImageProviderName(): ImageProviderName | undefined {
  const v = localStorage.getItem(LS_IMAGE_PROVIDER);
  // Migrate away from deprecated dall-e-3 which is no longer available
  if (v === "dall-e-3") {
    localStorage.removeItem(LS_IMAGE_PROVIDER);
    return undefined;
  }
  if (v === "gpt-image-1" || v === "imagen-3") return v;
  return undefined;
}

export function setDefaultImageProviderName(name: ImageProviderName): void {
  localStorage.setItem(LS_IMAGE_PROVIDER, name);
}

// ─── Singletons + reset ───────────────────────────────────────────────────────

let _llm: LLMProvider | null = null;
let _img: ImageGenerationProvider | null = null;

/** Reset cached providers — call after the user saves new API keys. */
export function resetProviders(): void {
  _llm = null;
  _img = null;
}

export function getLLMProvider(): LLMProvider {
  if (!_llm) _llm = createLLMProvider(getDefaultLLMProviderName());
  return _llm;
}

export function getImageProvider(): ImageGenerationProvider {
  if (!_img) _img = createImageProvider(getDefaultImageProviderName());
  return _img;
}
