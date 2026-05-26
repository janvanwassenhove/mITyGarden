import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { useTranslation } from "react-i18next";
import { GardenLLMService } from "@mity-garden/llm";
import { ASSET_LIBRARY } from "@mity-garden/asset-library";
import { AIRenderPanel } from "./AIRenderPanel.js";
// ─── Not-configured banner ────────────────────────────────────────────────────
function NotConfiguredBanner({ children, onOpenSettings, }) {
    const { t } = useTranslation("common");
    return (_jsxs("div", { style: {
            padding: 12,
            background: "#fff3e0",
            border: "1px solid #ffe0b2",
            borderRadius: 8,
            fontSize: 13,
            color: "#e65100",
            marginBottom: 12,
        }, children: [_jsx("div", { children: children }), onOpenSettings && (_jsxs("button", { onClick: onOpenSettings, style: {
                    marginTop: 8,
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: "1px solid #e65100",
                    background: "#fff",
                    color: "#e65100",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                }, children: ["\u2699 ", t("llm.configureKeys")] }))] }));
}
// ─── Suggestion card ──────────────────────────────────────────────────────────
function SuggestionCard({ suggestion, onApply, }) {
    return (_jsxs("div", { style: {
            background: "#f9fbe7",
            border: "1px solid #c5e1a5",
            borderRadius: 8,
            padding: 14,
            marginBottom: 12,
        }, children: [_jsx("h4", { style: { margin: "0 0 6px", fontSize: 14, color: "#33691e" }, children: suggestion.title }), _jsx("p", { style: { margin: "0 0 10px", fontSize: 13, color: "#555", lineHeight: 1.5 }, children: suggestion.description }), suggestion.suggestions.length > 0 && (_jsx("ul", { style: { margin: 0, paddingLeft: 18 }, children: suggestion.suggestions.map((s, i) => (_jsx("li", { style: { fontSize: 13, color: "#444", marginBottom: 4 }, children: s }, i))) })), onApply && suggestion.placements && suggestion.placements.length > 0 && (_jsxs("button", { onClick: onApply, "data-testid": "llm-apply-suggestion-btn", style: {
                    marginTop: 10,
                    width: "100%",
                    padding: "8px 14px",
                    borderRadius: 6,
                    border: "none",
                    background: "#2e7d32",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                }, children: ["\u2714 Apply Layout (", suggestion.placements.length, " element", suggestion.placements.length !== 1 ? "s" : "", ")"] }))] }));
}
// ─── Main panel ───────────────────────────────────────────────────────────────
export function LLMSuggestionsPanel({ project, llmProvider, imageProvider, onOpenSettings, llmProviderOptions, imageProviderOptions, onLLMProviderChange, onImageProviderChange, onApplySuggestion, }) {
    const [tab, setTab] = React.useState("suggestions");
    const { t } = useTranslation("common");
    // Suggestions tab state
    const [suggestion, setSuggestion] = React.useState(null);
    const [suggestLoading, setSuggestLoading] = React.useState(false);
    const [suggestError, setSuggestError] = React.useState(null);
    const llmService = React.useMemo(() => new GardenLLMService(llmProvider), [llmProvider]);
    const llmAvailable = llmProvider.isConfigured();
    // Reset cached results when the project changes so stale data from
    // another project is never shown.
    const projectIdRef = React.useRef(project.id);
    React.useEffect(() => {
        if (projectIdRef.current !== project.id) {
            projectIdRef.current = project.id;
            setSuggestion(null);
            setSuggestError(null);
        }
    }, [project.id]);
    async function handleSuggest() {
        setSuggestLoading(true);
        setSuggestError(null);
        try {
            const assetCatalog = ASSET_LIBRARY.map((a) => ({
                id: a.id,
                type: a.type,
                name: a.labels.en.name,
                defaultSize: a.defaultSize,
            }));
            const result = await llmService.suggestLayout(project, assetCatalog);
            setSuggestion(result);
        }
        catch (err) {
            setSuggestError(err instanceof Error ? err.message : "Failed to generate suggestions.");
        }
        finally {
            setSuggestLoading(false);
        }
    }
    const tabStyle = (active) => ({
        flex: 1,
        padding: "8px 4px",
        border: "none",
        borderBottom: active ? "2px solid #4caf50" : "2px solid transparent",
        background: "none",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: active ? 700 : 400,
        color: active ? "#2e7d32" : "#555",
        transition: "all 0.15s",
    });
    return (_jsxs("div", { "data-testid": "llm-suggestions-panel", style: {
            width: 320,
            height: "100%",
            borderLeft: "1px solid #e0e0e0",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            flexShrink: 0,
        }, children: [_jsxs("div", { style: {
                    padding: "12px 16px 0",
                    borderBottom: "1px solid #e0e0e0",
                    flexShrink: 0,
                }, children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [_jsx("span", { style: { fontSize: 18 }, children: "\u2728" }), _jsx("span", { style: { fontWeight: 700, fontSize: 14 }, children: t("llm.title") })] }), _jsxs("div", { style: { display: "flex" }, children: [_jsx("button", { style: tabStyle(tab === "suggestions"), onClick: () => setTab("suggestions"), children: t("llm.tabs.suggestions") }), _jsx("button", { style: tabStyle(tab === "visualize"), onClick: () => setTab("visualize"), children: t("llm.tabs.visualize") })] })] }), _jsxs("div", { style: { flex: 1, overflowY: "auto", padding: 16 }, children: [tab === "suggestions" && (_jsxs("div", { children: [!llmAvailable && (_jsx(NotConfiguredBanner, { ...(onOpenSettings ? { onOpenSettings } : {}), children: t("llm.notConfigured") })), llmProviderOptions && llmProviderOptions.filter((p) => p.available).length > 0 && (_jsxs("div", { style: { marginBottom: 10 }, children: [_jsx("label", { style: { fontSize: 12, color: '#666', display: 'block', marginBottom: 3 }, children: "Provider" }), _jsx("select", { value: llmProvider.name, onChange: (e) => onLLMProviderChange?.(e.target.value), style: { width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc', fontSize: 12, background: '#fff' }, children: llmProviderOptions.filter((p) => p.available).map((p) => (_jsx("option", { value: p.id, children: p.label }, p.id))) })] })), _jsx("button", { onClick: () => void handleSuggest(), disabled: !llmAvailable || suggestLoading, "data-testid": "llm-suggest-btn", style: {
                                    width: "100%",
                                    padding: "10px 16px",
                                    borderRadius: 8,
                                    border: "none",
                                    background: llmAvailable ? "#4caf50" : "#e0e0e0",
                                    color: llmAvailable ? "#fff" : "#999",
                                    fontWeight: 600,
                                    cursor: llmAvailable && !suggestLoading ? "pointer" : "not-allowed",
                                    marginBottom: 16,
                                }, children: suggestLoading ? t("llm.loading") : `✨ ${t("llm.getSuggestions")}` }), suggestError && (_jsx("p", { style: { color: "#c62828", fontSize: 13, marginBottom: 12 }, children: suggestError })), suggestion && (_jsx(SuggestionCard, { suggestion: suggestion, ...(onApplySuggestion ? { onApply: () => onApplySuggestion(suggestion) } : {}) })), !suggestion && !suggestLoading && llmAvailable && (_jsx("p", { style: { fontSize: 13, color: "#888", textAlign: "center" }, children: "Click the button to get AI-powered layout suggestions based on your garden's style and goals." }))] })), tab === "visualize" && (_jsx(AIRenderPanel, { project: project, imageProvider: imageProvider, ...(imageProviderOptions !== undefined ? { imageProviderOptions } : {}), ...(onImageProviderChange !== undefined ? { onImageProviderChange } : {}), ...(onOpenSettings !== undefined ? { onOpenSettings } : {}) }))] })] }));
}
//# sourceMappingURL=LLMSuggestionsPanel.js.map