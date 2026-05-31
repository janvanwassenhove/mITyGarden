import React from "react";
import { useTranslation } from "react-i18next";
import type { GardenProject } from "@mity-garden/domain";
import type { GardenLayoutSuggestion } from "@mity-garden/llm";
import { GardenLLMService } from "@mity-garden/llm";
import type { LLMProvider, ImageGenerationProvider } from "@mity-garden/llm";
import { ASSET_LIBRARY } from "@mity-garden/asset-library";
import { AIRenderPanel } from "./AIRenderPanel.js";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type PanelTab = "suggestions" | "visualize";

// ─── Not-configured banner ────────────────────────────────────────────────────

function NotConfiguredBanner({
  children,
  onOpenSettings,
}: {
  children: React.ReactNode;
  onOpenSettings?: () => void;
}): React.ReactElement {
  const { t } = useTranslation("common");
  return (
    <div
      style={{
        padding: 12,
        background: "#fff3e0",
        border: "1px solid #ffe0b2",
        borderRadius: 8,
        fontSize: 13,
        color: "#e65100",
        marginBottom: 12,
      }}
    >
      <div>{children}</div>
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          style={{
            marginTop: 8,
            padding: "4px 10px",
            borderRadius: 4,
            border: "1px solid #e65100",
            background: "#fff",
            color: "#e65100",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ⚙ {t("llm.configureKeys")}
        </button>
      )}
    </div>
  );
}

// ─── Suggestion card ──────────────────────────────────────────────────────────

function SuggestionCard({
  suggestion,
  onApply,
}: {
  suggestion: GardenLayoutSuggestion;
  onApply?: () => void;
}): React.ReactElement {
  return (
    <div
      style={{
        background: "#f9fbe7",
        border: "1px solid #c5e1a5",
        borderRadius: 8,
        padding: 14,
        marginBottom: 12,
      }}
    >
      <h4 style={{ margin: "0 0 6px", fontSize: 14, color: "#33691e" }}>{suggestion.title}</h4>
      <p style={{ margin: "0 0 10px", fontSize: 13, color: "#555", lineHeight: 1.5 }}>
        {suggestion.description}
      </p>
      {suggestion.suggestions.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {suggestion.suggestions.map((s, i) => (
            <li key={i} style={{ fontSize: 13, color: "#444", marginBottom: 4 }}>
              {s}
            </li>
          ))}
        </ul>
      )}
      {onApply && suggestion.placements && suggestion.placements.length > 0 && (
        <button
          onClick={onApply}
          data-testid="llm-apply-suggestion-btn"
          style={{
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
          }}
        >
          ✔ Apply Layout ({suggestion.placements.length} element
          {suggestion.placements.length !== 1 ? "s" : ""})
        </button>
      )}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function LLMSuggestionsPanel({
  project,
  llmProvider,
  imageProvider,
  onOpenSettings,
  llmProviderOptions,
  imageProviderOptions,
  onLLMProviderChange,
  onImageProviderChange,
  onApplySuggestion,
}: LLMSuggestionsPanelProps): React.ReactElement {
  const [tab, setTab] = React.useState<PanelTab>("suggestions");

  const { t } = useTranslation("common");

  // Suggestions tab state
  const [suggestion, setSuggestion] = React.useState<GardenLayoutSuggestion | null>(null);
  const [suggestLoading, setSuggestLoading] = React.useState(false);
  const [suggestError, setSuggestError] = React.useState<string | null>(null);

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

  async function handleSuggest(): Promise<void> {
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
    } catch (err) {
      setSuggestError(err instanceof Error ? err.message : "Failed to generate suggestions.");
    } finally {
      setSuggestLoading(false);
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
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

  return (
    <div
      data-testid="llm-suggestions-panel"
      style={{
        width: 320,
        height: "100%",
        borderLeft: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px 0",
          borderBottom: "1px solid #e0e0e0",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>✨</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{t("llm.title")}</span>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex" }}>
          <button style={tabStyle(tab === "suggestions")} onClick={() => setTab("suggestions")}>
            {t("llm.tabs.suggestions")}
          </button>
          <button style={tabStyle(tab === "visualize")} onClick={() => setTab("visualize")}>
            {t("llm.tabs.visualize")}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {/* ── Suggestions tab ── */}
        {tab === "suggestions" && (
          <div>
            {!llmAvailable && (
              <NotConfiguredBanner {...(onOpenSettings ? { onOpenSettings } : {})}>
                {t("llm.notConfigured")}
              </NotConfiguredBanner>
            )}

            {/* Provider chooser */}
            {llmProviderOptions && llmProviderOptions.filter((p) => p.available).length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 3 }}>
                  Provider
                </label>
                <select
                  value={llmProvider.name}
                  onChange={(e) => onLLMProviderChange?.(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 12,
                    background: "#fff",
                  }}
                >
                  {llmProviderOptions
                    .filter((p) => p.available)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <button
              onClick={() => void handleSuggest()}
              disabled={!llmAvailable || suggestLoading}
              data-testid="llm-suggest-btn"
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: llmAvailable ? "#4caf50" : "#e0e0e0",
                color: llmAvailable ? "#fff" : "#999",
                fontWeight: 600,
                cursor: llmAvailable && !suggestLoading ? "pointer" : "not-allowed",
                marginBottom: 16,
              }}
            >
              {suggestLoading ? t("llm.loading") : `✨ ${t("llm.getSuggestions")}`}
            </button>

            {suggestError && (
              <p style={{ color: "#c62828", fontSize: 13, marginBottom: 12 }}>{suggestError}</p>
            )}

            {suggestion && (
              <SuggestionCard
                suggestion={suggestion}
                {...(onApplySuggestion ? { onApply: () => onApplySuggestion(suggestion) } : {})}
              />
            )}

            {!suggestion && !suggestLoading && llmAvailable && (
              <p style={{ fontSize: 13, color: "#888", textAlign: "center" }}>
                Click the button to get AI-powered layout suggestions based on your garden's style
                and goals.
              </p>
            )}
          </div>
        )}

        {/* ── Visualize tab (AI Render Pipeline) ── */}
        {tab === "visualize" && (
          <AIRenderPanel
            project={project}
            imageProvider={imageProvider}
            {...(imageProviderOptions !== undefined ? { imageProviderOptions } : {})}
            {...(onImageProviderChange !== undefined ? { onImageProviderChange } : {})}
            {...(onOpenSettings !== undefined ? { onOpenSettings } : {})}
          />
        )}
      </div>
    </div>
  );
}
