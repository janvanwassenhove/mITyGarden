import React, { useState } from "react";
import { getApiKeys, getEnvApiKeys, saveApiKeys } from "../apiKeys.js";

export interface ApiKeySettingsModalProps {
  onSaved: () => void;
  onClose: () => void;
}

export function ApiKeySettingsModal({ onSaved, onClose }: ApiKeySettingsModalProps): React.ReactElement {
  const initial = getApiKeys();
  const envKeys = getEnvApiKeys();
  const [openai, setOpenai] = useState(initial.openai);
  const [anthropic, setAnthropic] = useState(initial.anthropic);
  const [gemini, setGemini] = useState(initial.gemini);

  // Only save the keys that are not overridden by env vars
  function handleSave(): void {
    saveApiKeys({ openai, anthropic, gemini });
    onSaved();
  }

  // Whether any key is env-provided (to show the explanation)
  const hasEnvKeys = Object.keys(envKeys).length > 0;

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      {/* Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Configure API Keys"
        data-testid="api-key-settings-modal"
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 28,
          width: 440,
          maxWidth: "90vw",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>⚙ Configure API Keys</h2>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#666" }}>
          Keys stored here are saved in your browser&apos;s local storage. Environment variables
          take priority and cannot be overridden here.
        </p>

        {hasEnvKeys && (
          <div
            style={{
              padding: "10px 12px",
              background: "#e8f5e9",
              border: "1px solid #a5d6a7",
              borderRadius: 8,
              fontSize: 12,
              color: "#2e7d32",
              marginBottom: 16,
            }}
          >
            ✅ Some keys are provided via environment variables and are active. They are shown
            read-only below.
          </div>
        )}

        <KeyField
          label="OpenAI key"
          hint="Enables layout suggestions (GPT-4o-mini) and image generation (DALL-E 3)"
          placeholder="sk-..."
          value={openai}
          onChange={setOpenai}
          testId="api-key-openai"
          {...(envKeys.openai !== undefined ? { fromEnv: true, envValue: envKeys.openai } : {})}
        />
        <KeyField
          label="Anthropic key"
          hint="Enables layout suggestions (Claude 3 Haiku) — used when no OpenAI key is set"
          placeholder="sk-ant-..."
          value={anthropic}
          onChange={setAnthropic}
          testId="api-key-anthropic"
          {...(envKeys.anthropic !== undefined ? { fromEnv: true, envValue: envKeys.anthropic } : {})}
        />
        <KeyField
          label="Gemini key"
          hint="Enables image generation (Imagen 3) — used when no OpenAI key is set"
          placeholder="AIza..."
          value={gemini}
          onChange={setGemini}
          testId="api-key-gemini"
          {...(envKeys.gemini !== undefined ? { fromEnv: true, envValue: envKeys.gemini } : {})}
        />

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            data-testid="api-key-save-btn"
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              border: "none",
              background: "#4caf50",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function KeyField(props: {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  testId: string;
  fromEnv?: boolean;
  envValue?: string;
}): React.ReactElement {
  const { label, hint, placeholder, value, onChange, testId, fromEnv = false, envValue } = props;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>
        {fromEnv && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 10,
              background: "#e8f5e9",
              color: "#2e7d32",
              border: "1px solid #a5d6a7",
            }}
          >
            env variable
          </span>
        )}
      </div>
      <p style={{ margin: "0 0 6px", fontSize: 12, color: "#888" }}>{hint}</p>
      {fromEnv ? (
        <div
          data-testid={`${testId}-env`}
          style={{
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #c8e6c9",
            background: "#f1f8e9",
            fontSize: 13,
            color: "#558b2f",
            letterSpacing: "0.15em",
          }}
        >
          {"•".repeat(Math.min((envValue?.length ?? 0), 24))} <span style={{ fontSize: 11, opacity: 0.7 }}>({envValue?.length ?? 0} chars, from VITE_* env)</span>
        </div>
      ) : (
        <input
          type="password"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-testid={testId}
          autoComplete="off"
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 13,
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}

