import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useUiStore } from "@mity-garden/shared-ui";

export function AppShell(): React.ReactElement {
  const locale = useUiStore((s) => s.locale);
  const setLocale = useUiStore((s) => s.setLocale);
  const openWizard = useUiStore((s) => s.openWizard);

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
          gap: 20,
          flexShrink: 0,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 18 }}>
          🌿 mITyGarden
        </Link>
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
          + New Project
        </button>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as typeof locale)}
          data-testid="language-selector"
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: 4,
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          <option value="en" style={{ color: "#212121" }}>English</option>
          <option value="nl" style={{ color: "#212121" }}>Nederlands</option>
          <option value="fr" style={{ color: "#212121" }}>Français</option>
        </select>
      </header>

      {/* Page Content */}
      <main style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
