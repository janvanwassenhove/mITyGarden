import type { LLMProvider } from "@mity-garden/llm";
import type { ImageGenerationProvider } from "@mity-garden/llm";
import { OpenAIProvider, AnthropicProvider, NoOpLLMProvider } from "@mity-garden/llm";
import { DalleProvider, GeminiImageProvider, NoOpImageProvider } from "@mity-garden/llm";

// ─── Text LLM factory ─────────────────────────────────────────────────────────
//
// Priority: OpenAI (VITE_OPENAI_API_KEY) → Anthropic (VITE_ANTHROPIC_API_KEY) → NoOp

export function createLLMProvider(): LLMProvider {
  const openAiKey = import.meta.env["VITE_OPENAI_API_KEY"] as string | undefined;
  if (openAiKey && openAiKey.length > 0) {
    return new OpenAIProvider(openAiKey);
  }
  const anthropicKey = import.meta.env["VITE_ANTHROPIC_API_KEY"] as string | undefined;
  if (anthropicKey && anthropicKey.length > 0) {
    return new AnthropicProvider(anthropicKey);
  }
  return new NoOpLLMProvider();
}

// ─── Image generation factory ─────────────────────────────────────────────────
//
// Priority: OpenAI DALL-E 3 (VITE_OPENAI_API_KEY) → Gemini/Imagen 3 (VITE_GEMINI_API_KEY) → NoOp

export function createImageProvider(): ImageGenerationProvider {
  const openAiKey = import.meta.env["VITE_OPENAI_API_KEY"] as string | undefined;
  if (openAiKey && openAiKey.length > 0) {
    return new DalleProvider(openAiKey);
  }
  const geminiKey = import.meta.env["VITE_GEMINI_API_KEY"] as string | undefined;
  if (geminiKey && geminiKey.length > 0) {
    return new GeminiImageProvider(geminiKey);
  }
  return new NoOpImageProvider();
}

// ─── Singletons ───────────────────────────────────────────────────────────────

let _llm: LLMProvider | null = null;
let _img: ImageGenerationProvider | null = null;

export function getLLMProvider(): LLMProvider {
  if (!_llm) _llm = createLLMProvider();
  return _llm;
}

export function getImageProvider(): ImageGenerationProvider {
  if (!_img) _img = createImageProvider();
  return _img;
}
