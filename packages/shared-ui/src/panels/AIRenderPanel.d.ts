import React from "react";
import type { GardenProject } from "@mity-garden/domain";
import type { ImageGenerationProvider } from "@mity-garden/llm";
import type { ProviderOption } from "./LLMSuggestionsPanel.js";
export interface AIRenderPanelProps {
    project: GardenProject;
    imageProvider: ImageGenerationProvider;
    imageProviderOptions?: ProviderOption[] | undefined;
    onImageProviderChange?: ((id: string) => void) | undefined;
    onOpenSettings?: (() => void) | undefined;
}
export declare function AIRenderPanel({ project, imageProvider, imageProviderOptions, onImageProviderChange, onOpenSettings, }: AIRenderPanelProps): React.ReactElement;
//# sourceMappingURL=AIRenderPanel.d.ts.map