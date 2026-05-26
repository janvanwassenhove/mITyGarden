/**
 * OpenAI provider — reads API key from environment variable MITY_GARDEN_OPENAI_API_KEY.
 * In browser/web context the key is passed explicitly (injected by Electron preload or server).
 * Never store the key in source code or localStorage.
 */
export class OpenAIProvider {
    name = "openai";
    apiKey;
    model;
    constructor(apiKey, model = "gpt-4o-mini") {
        this.apiKey = apiKey;
        this.model = model;
    }
    isConfigured() {
        return this.apiKey.length > 0;
    }
    async complete(messages) {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages,
                response_format: { type: "json_object" },
                max_tokens: 1024,
            }),
        });
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
        const data = (await response.json());
        return {
            content: data.choices[0]?.message.content ?? "",
            model: data.model,
            ...(data.usage?.total_tokens !== undefined ? { tokensUsed: data.usage.total_tokens } : {}),
        };
    }
}
//# sourceMappingURL=OpenAIProvider.js.map