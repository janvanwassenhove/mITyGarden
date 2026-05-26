import React from "react";
import type { GardenProject } from "@mity-garden/domain";
import type { GardenLayoutSuggestion } from "@mity-garden/llm";
import type { LLMProvider, ImageGenerationProvider } from "@mity-garden/llm";
export interface ProviderOption {
    id: string;
    label: string;
    available: boolean;
}
export interface LLMSuggestionsPanelProps {
    project: GardenProject;
    llmProvider: LLMProvider;
    imageProvider: ImageGenerationProvider;
    onOpenSettings?: () => void;
    /** Available text-LLM providers for the chooser. */
    llmProviderOptions?: ProviderOption[];
    /** Available image providers for the chooser. */
    imageProviderOptions?: ProviderOption[];
    /** Called when the user selects a different text-LLM provider. */
    onLLMProviderChange?: (id: string) => void;
    /** Called when the user selects a different image provider. */
    onImageProviderChange?: (id: string) => void;
    /** Called when the user clicks Apply on a suggestion with placements. */
    onApplySuggestion?: (suggestion: GardenLayoutSuggestion) => void;
}
export declare function LLMSuggestionsPanel({ project, llmProvider, imageProvider, onOpenSettings, llmProviderOptions, imageProviderOptions, onLLMProviderChange, onImageProviderChange, onApplySuggestion, }: LLMSuggestionsPanelProps): React.ReactElement;
//# sourceMappingURL=LLMSuggestionsPanel.d.ts.map