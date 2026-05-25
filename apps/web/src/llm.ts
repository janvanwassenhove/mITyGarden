import type { LLMProvider } from "@mity-garden/llm";
import type { ImageGenerationProvider } from "@mity-garden/llm";
import { OpenAIProvider, AnthropicProvider, NoOpLLMProvider } from "@mity-garden/llm";
import { DalleProvider, GeminiImageProvider, NoOpImageProvider } from "@mity-garden/llm";
import { getEffectiveApiKeys } from "./apiKeys.js";

// ─── Text LLM factory ─────────────────────────────────────────────────────────
//
// Priority: env var (VITE_OPENAI_API_KEY) → localStorage → NoOp

export function createLLMProvider(): LLMProvider {
  const keys = getEffectiveApiKeys();
  if (keys.openai.length > 0) return new OpenAIProvider(keys.openai);
  if (keys.anthropic.length > 0) return new AnthropicProvider(keys.anthropic);
  return new NoOpLLMProvider();
}

// ─── Image generation factory ─────────────────────────────────────────────────
//
// Priority: env var (VITE_OPENAI_API_KEY) → localStorage → NoOp

export function createImageProvider(): ImageGenerationProvider {
  const keys = getEffectiveApiKeys();
  if (keys.openai.length > 0) return new DalleProvider(keys.openai);
  if (keys.gemini.length > 0) return new GeminiImageProvider(keys.gemini);
  return new NoOpImageProvider();
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
  if (!_llm) _llm = createLLMProvider();
  return _llm;
}

export function getImageProvider(): ImageGenerationProvider {
  if (!_img) _img = createImageProvider();
  return _img;
}
