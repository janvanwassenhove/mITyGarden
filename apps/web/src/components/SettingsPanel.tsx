import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@mity-garden/shared-ui";
import type { Locale } from "@mity-garden/domain";
import {
  getApiKeys,
  getEnvApiKeys,
  saveApiKeys,
  getGoogleMapsApiKey,
  saveGoogleMapsApiKey,
} from "../apiKeys.js";

// ─── Lined cog icon (outline / "lined" style) ─────────────────────────────────

export function CogIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SECTION_STYLE: React.CSSProperties = {
  marginBottom: 24,
};

const SECTION_HEADER_STYLE: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#1b5e20",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 12,
  paddingBottom: 6,
  borderBottom: "1px solid #e8f5e9",
};

// ─── Main component ───────────────────────────────────────────────────────────

export interface SettingsPanelProps {
  onSaved?: () => void;
}

export function SettingsPanel({ onSaved }: SettingsPanelProps): React.ReactElement {
  const { t } = useTranslation("common");
  const closeSettings = useUiStore((s) => s.closeSettings);
  const locale = useUiStore((s) => s.locale);
  const setLocale = useUiStore((s) => s.setLocale);

  const initial = getApiKeys();
  const envKeys = getEnvApiKeys();

  const [openai, setOpenai] = useState(initial.openai);
  const [anthropic, setAnthropic] = useState(initial.anthropic);
  const [gemini, setGemini] = useState(initial.gemini);

  const envGoogleMaps = import.meta.env.GOOGLE_MAPS_API_KEY;
  const hasEnvGoogleMaps = Boolean(envGoogleMaps && envGoogleMaps.length > 0);
  const [googleMaps, setGoogleMaps] = useState(
    hasEnvGoogleMaps ? "" : (localStorage.getItem("mitygarden_google_maps_key") ?? "")
  );

  const hasEnvKeys = Object.keys(envKeys).length > 0 || hasEnvGoogleMaps;

  function handleSave(): void {
    saveApiKeys({ openai, anthropic, gemini });
    if (!hasEnvGoogleMaps) saveGoogleMapsApiKey(googleMaps);
    onSaved?.();
    closeSettings();
  }

  function handleClose(): void {
    closeSettings();
  }

  return (
    /* Backdrop */
    <div
      onClick={handleClose}
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
        aria-label={t("nav.settings")}
        data-testid="settings-panel"
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 28,
          width: 480,
          maxWidth: "92vw",
          maxHeight: "88vh",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <CogIcon size={20} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, flex: 1 }}>{t("nav.settings")}</h2>
          <button
            onClick={handleClose}
            aria-label={t("common.close")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: "#666",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            ✕
          </button>
        </div>

        {hasEnvKeys && (
          <div
            style={{
              padding: "10px 12px",
              background: "#e8f5e9",
              border: "1px solid #a5d6a7",
              borderRadius: 8,
              fontSize: 12,
              color: "#2e7d32",
              marginBottom: 20,
            }}
          >
            ✅ {t("settings.apiKey.envNote")}
          </div>
        )}

        {/* ── Language ─────────────────────────────────────────────────────── */}
        <div style={SECTION_STYLE}>
          <div style={SECTION_HEADER_STYLE}>{t("settings.language.title")}</div>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "#888" }}>
            {t("settings.language.label")}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {(
              [
                { value: "en", flag: "🇬🇧", label: "English" },
                { value: "nl", flag: "🇧🇪", label: "Nederlands" },
                { value: "fr", flag: "🇫🇷", label: "Français" },
              ] as { value: Locale; flag: string; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocale(opt.value)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  borderRadius: 6,
                  border: locale === opt.value ? "2px solid #4caf50" : "1px solid #ddd",
                  background: locale === opt.value ? "#e8f5e9" : "#fafafa",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: locale === opt.value ? 700 : 400,
                  color: locale === opt.value ? "#1b5e20" : "#444",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 20 }}>{opt.flag}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── LLM / AI Integration ─────────────────────────────────────────── */}
        <div style={SECTION_STYLE}>
          <div style={SECTION_HEADER_STYLE}>{t("settings.llm.title")}</div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "#888" }}>
            {t("settings.llm.description")}
          </p>
          <KeyField
            label="OpenAI"
            hint={t("settings.llm.openaiHint")}
            placeholder="sk-..."
            value={openai}
            onChange={setOpenai}
            testId="settings-key-openai"
            {...(envKeys.openai !== undefined ? { fromEnv: true, envValue: envKeys.openai } : {})}
          />
          <KeyField
            label="Anthropic"
            hint={t("settings.llm.anthropicHint")}
            placeholder="sk-ant-..."
            value={anthropic}
            onChange={setAnthropic}
            testId="settings-key-anthropic"
            {...(envKeys.anthropic !== undefined
              ? { fromEnv: true, envValue: envKeys.anthropic }
              : {})}
          />
          <KeyField
            label="Gemini"
            hint={t("settings.llm.geminiHint")}
            placeholder="AIza..."
            value={gemini}
            onChange={setGemini}
            testId="settings-key-gemini"
            {...(envKeys.gemini !== undefined ? { fromEnv: true, envValue: envKeys.gemini } : {})}
          />
        </div>

        {/* ── Image Generation ─────────────────────────────────────────────── */}
        <div style={SECTION_STYLE}>
          <div style={SECTION_HEADER_STYLE}>{t("settings.image.title")}</div>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
            {t("settings.image.description")}
          </p>
          <div
            style={{
              marginTop: 10,
              padding: "10px 12px",
              background: "#f9fbe7",
              border: "1px solid #dce775",
              borderRadius: 8,
              fontSize: 12,
              color: "#558b2f",
            }}
          >
            {t("settings.image.note")}
          </div>
        </div>

        {/* ── Google Maps ──────────────────────────────────────────────────── */}
        <div style={SECTION_STYLE}>
          <div style={SECTION_HEADER_STYLE}>{t("settings.maps.title")}</div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "#888" }}>
            {t("settings.maps.description")}
          </p>
          <KeyField
            label="Google Maps API key"
            hint={t("settings.maps.hint")}
            placeholder="AIza..."
            value={googleMaps}
            onChange={setGoogleMaps}
            testId="settings-key-google-maps"
            {...(hasEnvGoogleMaps ? { fromEnv: true, envValue: envGoogleMaps } : {})}
          />
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 14px" }}>
          {t("settings.apiKey.savedNote")}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={handleClose}
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSave}
            data-testid="settings-save-btn"
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
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Key field helper ─────────────────────────────────────────────────────────

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
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
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
      <p style={{ margin: "0 0 5px", fontSize: 12, color: "#888" }}>{hint}</p>
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
            fontFamily: "monospace",
            letterSpacing: "0.05em",
          }}
        >
          {envValue
            ? `${envValue.slice(0, 6)}${"•".repeat(Math.max(0, envValue.length - 6))}`
            : "—"}
        </div>
      ) : (
        <input
          type="password"
          data-testid={testId}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 13,
            fontFamily: "monospace",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}
