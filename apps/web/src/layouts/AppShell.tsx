import React, { useState, useRef, useEffect, useCallback } from "react";
import { Outlet, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUiStore, useProjectStore } from "@mity-garden/shared-ui";
import { CogIcon, SettingsPanel } from "../components/SettingsPanel.js";

export function AppShell(): React.ReactElement {
  const openWizard = useUiStore((s) => s.openWizard);
  const settingsOpen = useUiStore((s) => s.settingsOpen);
  const openSettings = useUiStore((s) => s.openSettings);
  const projectName = useProjectStore((s) => s.project?.name ?? null);
  const updateProject = useProjectStore((s) => s.updateProject);
  const { t } = useTranslation("common");

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = useCallback(() => {
    setDraft(projectName ?? "");
    setEditing(true);
  }, [projectName]);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed) updateProject({ name: trimmed });
    setEditing(false);
  }, [draft, updateProject]);

  const cancel = useCallback(() => {
    setEditing(false);
  }, []);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Top Bar */}
      <header
        data-testid="app-header"
        style={{
          height: 52,
          background: "#1b5e20",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 16,
          flexShrink: 0,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 18 }}>
          🌿 mITyGarden
        </Link>
        {projectName !== null && (
          editing ? (
            <input
              ref={inputRef}
              data-testid="project-name-input"
              value={draft}
              maxLength={100}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commit(); }
                else if (e.key === "Escape") { e.preventDefault(); cancel(); }
              }}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: 4,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                padding: "3px 8px",
                outline: "none",
                minWidth: 120,
                maxWidth: 280,
              }}
            />
          ) : (
            <button
              data-testid="project-name-display"
              onClick={startEdit}
              title={t("nav.editProjectName")}
              aria-label={t("nav.editProjectName")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: "1px dashed rgba(255,255,255,0.5)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "text",
                padding: "2px 4px",
                maxWidth: 280,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {projectName}
            </button>
          )
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={openWizard}
          data-testid="new-project-btn"
          style={{
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 16px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {t("nav.newProject")}
        </button>
        <button
          onClick={openSettings}
          title={t("nav.settings")}
          data-testid="header-settings-btn"
          aria-label={t("nav.settings")}
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <CogIcon size={16} />
          <span style={{ fontSize: 13 }}>{t("nav.settings")}</span>
        </button>
      </header>

      {/* Page Content */}
      <main style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </main>

      {/* Global Settings Panel */}
      {settingsOpen && <SettingsPanel />}
    </div>
  );
}
