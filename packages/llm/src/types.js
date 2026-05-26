// ─── LLM Service ──────────────────────────────────────────────────────────────
export class GardenLLMService {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    isAvailable() {
        return this.provider.isConfigured();
    }
    async suggestLayout(project, availableAssets) {
        // Exclude history stack to keep the payload compact
        const { history: _history, ...projectContext } = project;
        const assetSection = availableAssets && availableAssets.length > 0
            ? `\n\nAvailable assets for placements (use exact assetId values):\n${JSON.stringify(availableAssets, null, 2)}`
            : "";
        // Build location-aware system prompt
        let locationContext = "";
        if (project.mapData) {
            const parts = [];
            if (project.mapData.address) {
                parts.push(`The garden is located at: ${project.mapData.address}.`);
            }
            if (project.mapData.coordinates) {
                parts.push(`GPS coordinates: ${project.mapData.coordinates.lat.toFixed(5)}, ${project.mapData.coordinates.lng.toFixed(5)}.`);
            }
            if (project.mapData.boundary && project.mapData.boundary.length >= 3) {
                parts.push(`The property has a ${project.mapData.boundary.length}-sided polygon boundary.`);
            }
            const structures = project.mapData.userCorrectedStructures?.length
                ? project.mapData.userCorrectedStructures
                : project.mapData.detectedStructures;
            if (structures && structures.length > 0) {
                parts.push(`There ${structures.length === 1 ? "is 1 existing structure" : `are ${structures.length} existing structures`} on the property that should be accounted for.`);
            }
            if (parts.length > 0) {
                locationContext = ` ${parts.join(" ")}`;
            }
        }
        const messages = [
            {
                role: "system",
                content: `You are a professional garden designer. Provide practical, inspiring garden layout suggestions based on the project details. ` +
                    `Only suggest elements and designs that are appropriate for this specific project's style, goals, dimensions, and location.${locationContext} ` +
                    `Respond in JSON.`,
            },
            {
                role: "user",
                content: `Garden project (JSON):\n${JSON.stringify(projectContext, null, 2)}${assetSection}\n\nRespond with a JSON object:\n{\n  "title": string,\n  "description": string,\n  "suggestions": string[],\n  "placements": [\n    {\n      "assetId": string,\n      "position": { "x": number, "y": number },\n      "size": { "width": number, "height": number },\n      "label": string\n    }\n  ]\n}\nPositions and sizes are in metres from top-left. assetId must match one of the available asset IDs listed above. Only suggest elements relevant to this project's style (${project.style}), goals (${project.goals.join(", ") || "none specified"}), and dimensions (${project.dimensions.width}m × ${project.dimensions.height}m).`,
            },
        ];
        const response = await this.provider.complete(messages);
        try {
            return JSON.parse(response.content);
        }
        catch {
            return {
                title: "Layout Suggestion",
                description: response.content,
                suggestions: [],
            };
        }
    }
    async generateProposal(project) {
        const elementCount = project.layers.reduce((sum, l) => sum + l.elements.length, 0);
        const messages = [
            {
                role: "system",
                content: "You are a professional garden designer writing a client proposal. Be warm, professional and inspiring. Respond in JSON.",
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
            return JSON.parse(response.content);
        }
        catch {
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
export class NoOpLLMProvider {
    name = "none";
    isConfigured() {
        return false;
    }
    async complete(_messages) {
        throw new Error("No LLM provider configured. Set MITY_GARDEN_LLM_API_KEY environment variable.");
    }
}
//# sourceMappingURL=types.js.map