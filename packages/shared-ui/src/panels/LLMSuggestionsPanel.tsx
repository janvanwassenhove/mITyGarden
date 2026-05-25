import React from "react";
import type { GardenProject } from "@mity-garden/domain";
import type { GardenLayoutSuggestion } from "@mity-garden/llm";
import { GardenLLMService, GardenImageService } from "@mity-garden/llm";
import type { LLMProvider, ImageGenerationProvider } from "@mity-garden/llm";
import type { GeneratedImage } from "@mity-garden/llm";

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
}

type PanelTab = "suggestions" | "visualize";
type ViewType = "aerial" | "perspective";

// ─── Helper: resolve image src from GeneratedImage ────────────────────────────

function resolveImageSrc(img: GeneratedImage): string {
  if (img.url) return img.url;
  if (img.base64) return `data:${img.mimeType};base64,${img.base64}`;
  return "";
}

// ─── Not-configured banner ────────────────────────────────────────────────────

function NotConfiguredBanner({
  children,
  onOpenSettings,
}: {
  children: React.ReactNode;
  onOpenSettings?: () => void;
}): React.ReactElement {
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
          ⚙ Configure API Keys
        </button>
      )}
    </div>
  );
}

// ─── Suggestion card ──────────────────────────────────────────────────────────

function SuggestionCard({ suggestion }: { suggestion: GardenLayoutSuggestion }): React.ReactElement {
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
}: LLMSuggestionsPanelProps): React.ReactElement {
  const [tab, setTab] = React.useState<PanelTab>("suggestions");

  // Suggestions tab state
  const [suggestion, setSuggestion] = React.useState<GardenLayoutSuggestion | null>(null);
  const [suggestLoading, setSuggestLoading] = React.useState(false);
  const [suggestError, setSuggestError] = React.useState<string | null>(null);

  // Visualize tab state
  const [viewType, setViewType] = React.useState<ViewType>("perspective");
  const [generatedImage, setGeneratedImage] = React.useState<GeneratedImage | null>(null);
  const [imageLoading, setImageLoading] = React.useState(false);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [promptPreview, setPromptPreview] = React.useState<string | null>(null);

  const llmService = React.useMemo(() => new GardenLLMService(llmProvider), [llmProvider]);
  const imageService = React.useMemo(() => new GardenImageService(imageProvider), [imageProvider]);

  const llmAvailable = llmProvider.isConfigured();
  const imageAvailable = imageProvider.isConfigured();

  async function handleSuggest(): Promise<void> {
    setSuggestLoading(true);
    setSuggestError(null);
    try {
      const result = await llmService.suggestLayout(project);
      setSuggestion(result);
    } catch (err) {
      setSuggestError(err instanceof Error ? err.message : "Failed to generate suggestions.");
    } finally {
      setSuggestLoading(false);
    }
  }

  async function handleGenerateImage(): Promise<void> {
    setImageLoading(true);
    setImageError(null);
    setGeneratedImage(null);
    try {
      const img = await imageService.generateFromProject(project, viewType);
      setGeneratedImage(img);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Image generation failed.";
      console.error("[mITyGarden] Image generation error:", msg);
      setImageError(msg);
    } finally {
      setImageLoading(false);
    }
  }

  function handlePreviewPrompt(): void {
    setPromptPreview(imageService.buildPrompt(project, viewType));
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
          <span style={{ fontWeight: 700, fontSize: 14 }}>AI Assistant</span>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex" }}>
          <button style={tabStyle(tab === "suggestions")} onClick={() => setTab("suggestions")}>
            Suggestions
          </button>
          <button style={tabStyle(tab === "visualize")} onClick={() => setTab("visualize")}>
            Visualize
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
                No AI provider configured. Add an OpenAI or Anthropic key to enable layout
                suggestions.
              </NotConfiguredBanner>
            )}

            {/* Provider chooser */}
            {llmProviderOptions && llmProviderOptions.filter((p) => p.available).length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 3 }}>Provider</label>
                <select
                  value={llmProvider.name}
                  onChange={(e) => onLLMProviderChange?.(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc', fontSize: 12, background: '#fff' }}
                >
                  {llmProviderOptions.filter((p) => p.available).map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
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
              {suggestLoading ? "Generating…" : "✨ Generate Layout Suggestions"}
            </button>

            {suggestError && (
              <p style={{ color: "#c62828", fontSize: 13, marginBottom: 12 }}>{suggestError}</p>
            )}

            {suggestion && <SuggestionCard suggestion={suggestion} />}

            {!suggestion && !suggestLoading && llmAvailable && (
              <p style={{ fontSize: 13, color: "#888", textAlign: "center" }}>
                Click the button to get AI-powered layout suggestions based on your garden's style
                and goals.
              </p>
            )}
          </div>
        )}

        {/* ── Visualize tab ── */}
        {tab === "visualize" && (
          <div>
            {!imageAvailable && (
              <NotConfiguredBanner {...(onOpenSettings ? { onOpenSettings } : {})}>
                No image provider configured. Add an OpenAI key (DALL-E&nbsp;3) or a Gemini key
                (Imagen&nbsp;3) to enable image generation.
              </NotConfiguredBanner>
            )}

            {/* View type selector */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                View type
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["aerial", "perspective"] as ViewType[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => { setViewType(v); setPromptPreview(null); }}
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: viewType === v ? "2px solid #4caf50" : "2px solid #ccc",
                      background: viewType === v ? "#e8f5e9" : "#fff",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: viewType === v ? 700 : 400,
                    }}
                  >
                    {v === "aerial" ? "🛩 Aerial" : "🌿 Perspective"}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider chooser */}
            {imageProviderOptions && imageProviderOptions.filter((p) => p.available).length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 3 }}>Image provider</label>
                <select
                  value={imageProvider.name}
                  onChange={(e) => onImageProviderChange?.(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc', fontSize: 12, background: '#fff' }}
                >
                  {imageProviderOptions.filter((p) => p.available).map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button
                onClick={() => void handleGenerateImage()}
                disabled={!imageAvailable || imageLoading}
                data-testid="llm-generate-image-btn"
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: imageAvailable ? "#1565c0" : "#e0e0e0",
                  color: imageAvailable ? "#fff" : "#999",
                  fontWeight: 600,
                  cursor: imageAvailable && !imageLoading ? "pointer" : "not-allowed",
                  fontSize: 13,
                }}
              >
                {imageLoading ? "Generating…" : "🖼 Generate Image"}
              </button>
              <button
                onClick={handlePreviewPrompt}
                title="Preview the prompt that will be sent to the image model"
                style={{
                  padding: "10px 10px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                💬
              </button>
            </div>

            {/* Prompt preview */}
            {promptPreview && (
              <details open style={{ marginBottom: 12 }}>
                <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>
                  Prompt preview
                </summary>
                <p
                  style={{
                    fontSize: 11,
                    color: "#666",
                    background: "#f5f5f5",
                    padding: 8,
                    borderRadius: 4,
                    marginTop: 4,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {promptPreview}
                </p>
              </details>
            )}

            {imageError && (
              <p style={{ color: "#c62828", fontSize: 13, marginBottom: 12 }}>{imageError}</p>
            )}

            {/* Generated image */}
            {generatedImage && (
              <div>
                <img
                  src={resolveImageSrc(generatedImage)}
                  alt="AI-generated garden visualisation"
                  data-testid="llm-generated-image"
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: "1px solid #e0e0e0",
                    display: "block",
                  }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <a
                    href={resolveImageSrc(generatedImage)}
                    download={`${project.name.replace(/\s+/g, "-")}-garden-render.png`}
                    style={{
                      flex: 1,
                      display: "block",
                      textAlign: "center",
                      padding: "7px 10px",
                      borderRadius: 6,
                      background: "#4caf50",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 12,
                      textDecoration: "none",
                    }}
                  >
                    ⬇ Download
                  </a>
                  <button
                    onClick={() => setGeneratedImage(null)}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    ✕
                  </button>
                </div>
                {generatedImage.revisedPrompt && (
                  <p style={{ fontSize: 11, color: "#888", marginTop: 6, lineHeight: 1.4 }}>
                    <em>Revised prompt: {generatedImage.revisedPrompt}</em>
                  </p>
                )}
              </div>
            )}

            {!generatedImage && !imageLoading && imageAvailable && !imageError && (
              <p style={{ fontSize: 13, color: "#888", textAlign: "center" }}>
                Generate a photorealistic image of your garden design using AI.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
