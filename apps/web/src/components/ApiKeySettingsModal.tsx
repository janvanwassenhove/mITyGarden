import React, { useState } from "react";
import { getApiKeys, saveApiKeys } from "../apiKeys.js";

export interface ApiKeySettingsModalProps {
  onSaved: () => void;
  onClose: () => void;
}

export function ApiKeySettingsModal({ onSaved, onClose }: ApiKeySettingsModalProps): React.ReactElement {
  const initial = getApiKeys();
  const [openai, setOpenai] = useState(initial.openai);
  const [anthropic, setAnthropic] = useState(initial.anthropic);
  const [gemini, setGemini] = useState(initial.gemini);

  function handleSave(): void {
    saveApiKeys({ openai, anthropic, gemini });
    onSaved();
  }

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
          width: 420,
          maxWidth: "90vw",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>⚙ Configure API Keys</h2>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
          Keys are stored in your browser&apos;s local storage and never sent anywhere except the
          respective API endpoints.
        </p>

        <KeyField
          label="OpenAI key"
          hint="Enables layout suggestions (GPT-4o-mini) and image generation (DALL-E 3)"
          placeholder="sk-..."
          value={openai}
          onChange={setOpenai}
          testId="api-key-openai"
        />
        <KeyField
          label="Anthropic key"
          hint="Enables layout suggestions (Claude 3 Haiku) — used when no OpenAI key is set"
          placeholder="sk-ant-..."
          value={anthropic}
          onChange={setAnthropic}
          testId="api-key-anthropic"
        />
        <KeyField
          label="Gemini key"
          hint="Enables image generation (Imagen 3) — used when no OpenAI key is set"
          placeholder="AIza..."
          value={gemini}
          onChange={setGemini}
          testId="api-key-gemini"
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

function KeyField({
  label,
  hint,
  placeholder,
  value,
  onChange,
  testId,
}: {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  testId: string;
}): React.ReactElement {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        {label}
      </label>
      <p style={{ margin: "0 0 6px", fontSize: 12, color: "#888" }}>{hint}</p>
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
    </div>
  );
}
