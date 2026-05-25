import type { LLMProvider } from "@mity-garden/llm";
import type { ImageGenerationProvider } from "@mity-garden/llm";
import { OpenAIProvider, AnthropicProvider, NoOpLLMProvider } from "@mity-garden/llm";
import { DalleProvider, GeminiImageProvider, NoOpImageProvider } from "@mity-garden/llm";
import { getApiKeys } from "./apiKeys.js";

// ─── Text LLM factory ─────────────────────────────────────────────────────────
//
// Priority: OpenAI → Anthropic → NoOp  (keys read from localStorage at call time)

export function createLLMProvider(): LLMProvider {
  const keys = getApiKeys();
  if (keys.openai.length > 0) return new OpenAIProvider(keys.openai);
  if (keys.anthropic.length > 0) return new AnthropicProvider(keys.anthropic);
  return new NoOpLLMProvider();
}

// ─── Image generation factory ─────────────────────────────────────────────────
//
// Priority: OpenAI DALL-E 3 → Gemini/Imagen 3 → NoOp

export function createImageProvider(): ImageGenerationProvider {
  const keys = getApiKeys();
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
