# ADR-005: LLM providers available in web renderer

**Date:** 2026-03-10
**Status:** Accepted
**Deciders:** mITyGarden core team

## Context

The original design (see early architecture docs) assumed LLM API keys must **never** leave the Electron main process — keys would be read from env vars in Node.js and all HTTP requests would be made there, with only the text response returned to the renderer via IPC.

This constraint made LLM features unavailable in the web SPA entirely.

In practice:

1. Many users run the web SPA without Electron.
2. API keys are already stored in browser extensions, `.env` files served by Vite, and localStorage in countless web apps.
3. The OpenAI and Anthropic APIs enforce per-key rate limits and usage caps server-side; the risk of key leakage is borne by the user who entered the key.
4. The original model required the full Electron app just to get AI suggestions — a significant barrier.

## Decision

Move LLM provider instantiation into the **web renderer** (`apps/web/src/llm.ts`).

Key supply priority (highest first):

1. **Build-time env vars** (`VITE_OPENAI_API_KEY`, `VITE_ANTHROPIC_API_KEY`, `VITE_GEMINI_API_KEY`) — for managed/enterprise deployments.
2. **User-entered keys in localStorage** — via `ApiKeySettingsModal`; keys are stored under known prefixed keys and never transmitted to any mITyGarden server.
3. **NoOp fallback** — graceful degradation with a user-visible error.

The Electron IPC path (`ipcMain` handler `llm:complete`) is **retained** for deployments that want the stricter main-process-only model using `MITY_GARDEN_*` env vars.

## Alternatives considered

| Alternative        | Reason rejected                                                                        |
| ------------------ | -------------------------------------------------------------------------------------- |
| Keep Electron-only | Excludes all web users from AI features                                                |
| Backend proxy      | Requires a server; contradicts local-first principle; adds ongoing infrastructure cost |
| OAuth / key vault  | Correct for enterprise; disproportionate for a personal garden app                     |

## Consequences

**Positive:**

- LLM suggestions work in the web SPA without Electron.
- Users can enter keys once in `ApiKeySettingsModal` and use them across sessions.
- `resetProviders()` allows the cached provider singleton to be refreshed after key changes.

**Negative / trade-offs:**

- Keys stored in localStorage are visible to any JS running on the same origin (XSS risk). Mitigated by Content-Security-Policy and the fact that users opt-in explicitly.
- `VITE_*` keys are embedded in the JS bundle at build time — avoid committing `.env.local` to source control.
- The Electron IPC path and the web renderer path are now two separate code paths; both must be updated when adding a new provider.

## References

- `apps/web/src/llm.ts`
- `apps/web/src/apiKeys.ts`
- `apps/desktop/src/main/index.ts` (`ipcMain` handlers)
- [docs/llm-integration.md](../llm-integration.md)
