import type { LLMProvider, LLMMessage, LLMResponse } from "../types.js";
/**
 * OpenAI provider — reads API key from environment variable MITY_GARDEN_OPENAI_API_KEY.
 * In browser/web context the key is passed explicitly (injected by Electron preload or server).
 * Never store the key in source code or localStorage.
 */
export declare class OpenAIProvider implements LLMProvider {
    readonly name = "openai";
    private readonly apiKey;
    private readonly model;
    constructor(apiKey: string, model?: string);
    isConfigured(): boolean;
    complete(messages: LLMMessage[]): Promise<LLMResponse>;
}
//# sourceMappingURL=OpenAIProvider.d.ts.map