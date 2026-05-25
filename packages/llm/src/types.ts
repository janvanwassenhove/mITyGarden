import type { GardenProject } from "@mity-garden/domain";

// ─── LLM Provider Abstraction ─────────────────────────────────────────────────
// API keys come exclusively from environment variables — never hardcoded.

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  tokensUsed?: number;
}

export interface LLMProvider {
  readonly name: string;
  isConfigured(): boolean;
  complete(messages: LLMMessage[]): Promise<LLMResponse>;
}

// ─── Garden-specific prompts ──────────────────────────────────────────────────

export interface GardenLayoutSuggestion {
  title: string;
  description: string;
  suggestions: string[];
}

export interface GardenProposalDocument {
  title: string;
  introduction: string;
  designConcept: string;
  elementDescriptions: string[];
  maintenanceTips: string[];
  conclusion: string;
}

// ─── LLM Service ──────────────────────────────────────────────────────────────

export class GardenLLMService {
  constructor(private readonly provider: LLMProvider) {}

  isAvailable(): boolean {
    return this.provider.isConfigured();
  }

  async suggestLayout(project: GardenProject): Promise<GardenLayoutSuggestion> {
    const messages: LLMMessage[] = [
      {
        role: "system",
        content:
          "You are a professional garden designer. Provide practical, inspiring garden layout suggestions based on the project details. Respond in JSON.",
      },
      {
        role: "user",
        content: `Garden project:
- Dimensions: ${project.dimensions.width}m × ${project.dimensions.height}m
- Style: ${project.style}
- Goals: ${project.goals.join(", ")}
- Unit: ${project.unit}

Provide a JSON object with: title, description, suggestions (array of strings).`,
      },
    ];

    const response = await this.provider.complete(messages);
    try {
      return JSON.parse(response.content) as GardenLayoutSuggestion;
    } catch {
      return {
        title: "Layout Suggestion",
        description: response.content,
        suggestions: [],
      };
    }
  }

  async generateProposal(project: GardenProject): Promise<GardenProposalDocument> {
    const elementCount = project.layers.reduce((sum, l) => sum + l.elements.length, 0);
    const messages: LLMMessage[] = [
      {
        role: "system",
        content:
          "You are a professional garden designer writing a client proposal. Be warm, professional and inspiring. Respond in JSON.",
      },
      {
        role: "user",
        content: `Create a garden proposal for:
- Garden: ${project.name}
- Dimensions: ${project.dimensions.width}m × ${project.dimensions.height}m
- Style: ${project.style}
- Goals: ${project.goals.join(", ")}
- Elements placed: ${elementCount}

Respond with JSON: title, introduction, designConcept, elementDescriptions (array), maintenanceTips (array), conclusion.`,
      },
    ];

    const response = await this.provider.complete(messages);
    try {
      return JSON.parse(response.content) as GardenProposalDocument;
    } catch {
      return {
        title: `Garden Proposal — ${project.name}`,
        introduction: response.content,
        designConcept: "",
        elementDescriptions: [],
        maintenanceTips: [],
        conclusion: "",
      };
    }
  }
}

// ─── No-op provider (safe fallback when no API key) ──────────────────────────

export class NoOpLLMProvider implements LLMProvider {
  readonly name = "none";
  isConfigured(): boolean {
    return false;
  }
  async complete(_messages: LLMMessage[]): Promise<LLMResponse> {
    throw new Error("No LLM provider configured. Set MITY_GARDEN_LLM_API_KEY environment variable.");
  }
}
