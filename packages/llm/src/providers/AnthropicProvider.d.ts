import type { LLMProvider, LLMMessage, LLMResponse } from "../types.js";
/**
 * Anthropic (Claude) provider — reads API key from MITY_GARDEN_ANTHROPIC_API_KEY.
 */
export declare class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  private readonly apiKey;
  private readonly model;
  constructor(apiKey: string, model?: string);
  isConfigured(): boolean;
  complete(messages: LLMMessage[]): Promise<LLMResponse>;
}
//# sourceMappingURL=AnthropicProvider.d.ts.map
