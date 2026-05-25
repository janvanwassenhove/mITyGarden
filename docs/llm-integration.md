# LLM Integration

## Overview

mITyGarden supports AI-powered garden suggestions via an extensible multi-LLM provider abstraction. LLM features are **desktop-only** (Electron) due to API key security requirements.

## Security Design

API keys are **never exposed to the renderer process**:

1. Keys are read from environment variables by the Electron **main process** at startup
2. The renderer calls `window.mityGardenDesktop.llm.complete(messages)` via the contextBridge
3. The main process (`ipcMain`) makes the actual HTTP request and returns only the text response

```
Renderer (web content)
  │  window.mityGardenDesktop.llm.complete(messages)
  ▼
Preload (contextBridge)
  │  ipcRenderer.invoke("llm:complete", messages)
  ▼
Main Process (Node.js)
  │  reads MITY_GARDEN_OPENAI_API_KEY from process.env
  │  makes HTTP request to OpenAI/Anthropic API
  ▼
Returns only: { content: string }
```

## Supported Providers

| Provider | Default Model | Env Var |
|----------|--------------|---------|
| OpenAI | `gpt-4o-mini` | `MITY_GARDEN_OPENAI_API_KEY` |
| Anthropic | `claude-3-haiku-20240307` | `MITY_GARDEN_ANTHROPIC_API_KEY` |

Select provider via `MITY_GARDEN_LLM_PROVIDER=openai` (or `anthropic`).
Override model via `MITY_GARDEN_LLM_MODEL=gpt-4o`.

## Adding a New Provider

1. Create `packages/llm/src/providers/MyProvider.ts` implementing `LLMProvider`
2. The interface requires: `complete(messages): Promise<LLMResponse>`
3. Register in `packages/llm/src/index.ts`
4. Update the `ipcMain` handler in `apps/desktop/src/main/index.ts`

## Garden Services

`GardenLLMService` (in `packages/llm/src/types.ts`) provides two high-level methods:

- **`suggestLayout(project)`** — Returns JSON with recommended element placements
- **`generateProposal(project)`** — Returns JSON with a narrative garden description + element list

Both methods build structured prompts using the project's dimensions, style, and goals, then parse the JSON response.

## NoOp Fallback

When no API key is configured, `NoOpLLMProvider` is used — it throws a descriptive error that guides the user to set environment variables. The UI should catch this and show a friendly message.
