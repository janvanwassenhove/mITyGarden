import type { GardenProject } from "@mity-garden/domain";
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
export interface SuggestedPlacement {
  assetId: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  label?: string;
}
export interface GardenLayoutSuggestion {
  title: string;
  description: string;
  suggestions: string[];
  placements?: SuggestedPlacement[];
}
export interface GardenProposalDocument {
  title: string;
  introduction: string;
  designConcept: string;
  elementDescriptions: string[];
  maintenanceTips: string[];
  conclusion: string;
}
export declare class GardenLLMService {
  private readonly provider;
  constructor(provider: LLMProvider);
  isAvailable(): boolean;
  suggestLayout(
    project: GardenProject,
    availableAssets?: Array<{
      id: string;
      type: string;
      name: string;
      defaultSize: {
        width: number;
        height: number;
      };
    }>
  ): Promise<GardenLayoutSuggestion>;
  generateProposal(project: GardenProject): Promise<GardenProposalDocument>;
}
export declare class NoOpLLMProvider implements LLMProvider {
  readonly name = "none";
  isConfigured(): boolean;
  complete(_messages: LLMMessage[]): Promise<LLMResponse>;
}
//# sourceMappingURL=types.d.ts.map
