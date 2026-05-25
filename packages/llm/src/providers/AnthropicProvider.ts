import type { LLMProvider, LLMMessage, LLMResponse } from "../types.js";

/**
 * Anthropic (Claude) provider — reads API key from MITY_GARDEN_ANTHROPIC_API_KEY.
 */
export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model = "claude-3-haiku-20240307") {
    this.apiKey = apiKey;
    this.model = model;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async complete(messages: LLMMessage[]): Promise<LLMResponse> {
    const system = messages.find((m) => m.role === "system")?.content ?? "";
    const userMessages = messages.filter((m) => m.role !== "system");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        system,
        messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      content: Array<{ text: string }>;
      model: string;
      usage?: { input_tokens: number; output_tokens: number };
    };

    return {
      content: data.content[0]?.text ?? "",
      model: data.model,
      ...(data.usage ? { tokensUsed: data.usage.input_tokens + data.usage.output_tokens } : {}),
    };
  }
}
