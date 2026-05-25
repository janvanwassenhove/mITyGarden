# LLM Integration

## Overview

mITyGarden supports AI-powered garden suggestions and image generation via an extensible multi-provider abstraction in `packages/llm`. LLM features work on **both web and desktop**; the key-supply mechanism differs per platform.

## API Key Supply

### Web (Vite SPA)

Keys are resolved at runtime with the following priority (highest first):

1. **Build-time env vars** — set `VITE_*` variables in `.env`; bundled at build time.
2. **User-entered keys** — stored in `localStorage` via the `ApiKeySettingsModal` in the UI.
3. **NoOp fallback** — if neither is present, a `NoOp*Provider` is used and operations return a descriptive error.

The factory in `apps/web/src/llm.ts` (`createLLMProvider`, `createImageProvider`) handles this resolution. Call `resetProviders()` after the user saves new keys to invalidate the cached singletons.

### Desktop (Electron main process)

The `ipcMain` handler `llm:complete` is also available as an alternative path where the HTTP request is made in the Node.js main process — API keys are read from `MITY_GARDEN_*` env vars and only the text response crosses the IPC boundary.

```
Renderer  →  ipcRenderer.invoke("llm:complete", messages)
                ↓
Main      →  reads MITY_GARDEN_OPENAI_API_KEY, makes HTTP request
                ↓
Returns only: { content: string }
```

## Environment Variables

| Variable | Platform | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Web / Desktop renderer | OpenAI text (GPT) + image (DALL·E) |
| `ANTHROPIC_API_KEY` | Web / Desktop renderer | Anthropic text (Claude) |
| `GEMINI_API_KEY` | Web / Desktop renderer | Google Gemini image generation |
| `GOOGLE_MAPS_API_KEY` | Web / Desktop renderer | Google Maps boundary drawing (wizard) |
| `MITY_GARDEN_OPENAI_API_KEY` | Desktop main process | OpenAI via Electron IPC path |
| `MITY_GARDEN_ANTHROPIC_API_KEY` | Desktop main process | Anthropic via Electron IPC path |
| `MITY_GARDEN_LLM_PROVIDER` | Desktop main process | `openai` (default) or `anthropic` |
| `MITY_GARDEN_LLM_MODEL` | Desktop main process | Override default model name |

## Text LLM Providers

| Provider | Class | Default Model |
|----------|-------|--------------|
| OpenAI | `OpenAIProvider` | `gpt-4o-mini` |
| Anthropic | `AnthropicProvider` | `claude-3-haiku-20240307` |
| No-op | `NoOpLLMProvider` | — (throws descriptive error) |

Selection priority in the web factory: OpenAI key present → Anthropic key present → NoOp.

## Image Generation Providers

| Provider | Class | Notes |
|----------|-------|-------|
| DALL·E 3 (OpenAI) | `DalleProvider` | Requires `OPENAI_API_KEY` |
| Gemini Imagen | `GeminiImageProvider` | Requires `GEMINI_API_KEY` |
| No-op | `NoOpImageProvider` | Returns descriptive error |

`GardenImageService` (in `packages/llm/src/image.ts`) wraps an `ImageGenerationProvider` and provides the `generateGardenImage(project)` high-level method used by `LLMSuggestionsPanel`.

## Adding a New Text Provider

1. Create `packages/llm/src/providers/MyProvider.ts` implementing `LLMProvider`.
2. The interface requires: `complete(messages: LLMMessage[]): Promise<LLMResponse>`.
3. Export from `packages/llm/src/index.ts`.
4. Register in `apps/web/src/llm.ts` (`createLLMProvider`) and optionally in the Electron `ipcMain` handler (`apps/desktop/src/main/index.ts`).
5. Add the corresponding env var to the table above and update this doc.

## Adding a New Image Provider

1. Create `packages/llm/src/providers/MyImageProvider.ts` implementing `ImageGenerationProvider`.
2. Export from `packages/llm/src/index.ts`.
3. Register in `apps/web/src/llm.ts` (`createImageProvider`).
4. Add the env var to the table above and update this doc.

## Garden Services

`GardenLLMService` (in `packages/llm/src/types.ts`) provides two high-level methods:

- **`suggestLayout(project)`** — Returns JSON with recommended element placements.
- **`generateProposal(project)`** — Returns JSON with a narrative garden description + element list.

Both build structured prompts from the project's dimensions, style, and goals, then parse the JSON response.

## NoOp Fallback

When no API key is configured, `NoOpLLMProvider` / `NoOpImageProvider` are used. They throw a descriptive error that the UI (`LLMSuggestionsPanel`) catches and displays as a friendly message guiding the user to open `ApiKeySettingsModal`.
