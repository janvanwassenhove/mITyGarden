import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IndexedDBRepository } from "@mity-garden/persistence";
import type { ProjectSummary } from "@mity-garden/persistence";
import { useProjectStore, useUiStore } from "@mity-garden/shared-ui";

const repo = new IndexedDBRepository();

export function ProjectListPage(): React.ReactElement {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const loadProject = useProjectStore((s) => s.loadProject);
  const openWizard = useUiStore((s) => s.openWizard);
  const navigate = useNavigate();

  useEffect(() => {
    void repo.listProjects().then((list) => {
      setProjects(list);
      setLoading(false);
    });
  }, []);

  async function handleOpen(id: string): Promise<void> {
    const project = await repo.getProject(id);
    if (project) {
      loadProject(project);
      void navigate("/design");
    }
  }

  return (
    <div
      data-testid="project-list-page"
      style={{ maxWidth: 800, margin: "0 auto", padding: 32 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1b5e20" }}>My Garden Projects</h1>
        <button
          onClick={openWizard}
          data-testid="create-project-btn"
          style={{
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          + New Garden
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#888" }}>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 32px",
            border: "2px dashed #c8e6c9",
            borderRadius: 12,
            color: "#666",
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌱</div>
          <h2 style={{ marginBottom: 8 }}>No gardens yet</h2>
          <p style={{ marginBottom: 24 }}>Create your first garden design to get started.</p>
          <button
            onClick={openWizard}
            data-testid="empty-state-create-btn"
            style={{
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Create My First Garden
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => void handleOpen(p.id)}
              data-testid={`project-card-${p.id}`}
              style={{
                background: "#fff",
                border: "2px solid #e8f5e9",
                borderRadius: 10,
                padding: 20,
                textAlign: "left",
                cursor: "pointer",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#4caf50";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(76,175,80,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#e8f5e9";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌿</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#888" }}>
                Updated {new Date(p.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
