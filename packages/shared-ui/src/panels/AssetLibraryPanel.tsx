import React, { useState, useMemo } from "react";
import { ASSET_LIBRARY, getAssetCategories, searchAssets } from "@mity-garden/asset-library";
import type { AssetDefinition } from "@mity-garden/domain";

// ─── Category display names ────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  pool: "Pools",
  tree: "Trees",
  plant: "Plants",
  "terrace-tile": "Terraces",
  "grass-zone": "Grass & Meadow",
  playground: "Playground",
  path: "Paths",
  building: "Buildings",
  "fence-wall-border": "Fences & Walls",
  furniture: "Furniture",
  custom: "Custom",
};

// ─── AssetCard ─────────────────────────────────────────────────────────────────

interface AssetCardProps {
  asset: AssetDefinition;
  locale: "en" | "nl" | "fr";
  onSelect: (asset: AssetDefinition) => void;
  selected: boolean;
}

function AssetCard({ asset, locale, onSelect, selected }: AssetCardProps): React.ReactElement {
  const label = asset.labels[locale] ?? asset.labels["en"];
  const name = label?.name ?? asset.id;

  return (
    <button
      onClick={() => onSelect(asset)}
      data-testid={`asset-card-${asset.id}`}
      title={label?.description ?? name}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "8px 4px",
        border: selected ? "2px solid #4caf50" : "2px solid transparent",
        borderRadius: 8,
        background: selected ? "#e8f5e9" : "transparent",
        cursor: "pointer",
        width: "100%",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!selected) (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f5";
      }}
      onMouseLeave={(e) => {
        if (!selected) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <div
        style={{ width: 48, height: 48, flexShrink: 0 }}
        dangerouslySetInnerHTML={{ __html: asset.thumbnail }}
      />
      <span
        style={{
          fontSize: 10,
          textAlign: "center",
          lineHeight: 1.2,
          color: "#424242",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 68,
        }}
      >
        {name}
      </span>
    </button>
  );
}

// ─── AssetLibraryPanel ─────────────────────────────────────────────────────────

export interface AssetLibraryPanelProps {
  locale?: "en" | "nl" | "fr";
  onAssetSelect?: (asset: AssetDefinition) => void;
  selectedAssetId?: string | null;
}

export function AssetLibraryPanel({
  locale = "en",
  onAssetSelect,
  selectedAssetId = null,
}: AssetLibraryPanelProps): React.ReactElement {
  const [query, setQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(getAssetCategories().keys()),
  );

  const filtered = useMemo(() => {
    if (query.trim().length === 0) return ASSET_LIBRARY;
    return searchAssets(query);
  }, [query, locale]);

  const byCategory = useMemo(() => {
    const map = new Map<string, AssetDefinition[]>();
    for (const asset of filtered) {
      const cat = asset.category ?? asset.type;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(asset);
    }
    return map;
  }, [filtered]);

  function toggleCategory(cat: string): void {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const categories = Array.from(byCategory.keys());

  return (
    <div
      data-testid="asset-library-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#fff",
        borderRight: "1px solid #e0e0e0",
        width: 200,
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 12px 8px",
          borderBottom: "1px solid #e0e0e0",
          background: "#f9fbe7",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 13, color: "#33691e", marginBottom: 8 }}>
          🌱 Asset Library
        </div>
        <input
          type="search"
          placeholder="Search assets…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-testid="asset-search-input"
          style={{
            width: "100%",
            padding: "5px 8px",
            fontSize: 12,
            border: "1px solid #c8e6c9",
            borderRadius: 6,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Categories + Assets */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {categories.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#9e9e9e", fontSize: 13 }}>
            No assets found
          </div>
        ) : (
          categories.map((cat) => {
            const assets = byCategory.get(cat) ?? [];
            const expanded = expandedCategories.has(cat);
            const label = CATEGORY_LABELS[cat] ?? cat;

            return (
              <div key={cat} data-testid={`asset-category-${cat}`}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(cat)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 12px",
                    background: "#f5f5f5",
                    border: "none",
                    borderBottom: "1px solid #e0e0e0",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#424242",
                    textAlign: "left",
                  }}
                >
                  <span>{label}</span>
                  <span style={{ color: "#9e9e9e" }}>
                    {expanded ? "▾" : "▸"} {assets.length}
                  </span>
                </button>

                {/* Assets Grid */}
                {expanded && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 4,
                      padding: "6px 4px",
                    }}
                  >
                    {assets.map((asset) => (
                      <AssetCard
                        key={asset.id}
                        asset={asset}
                        locale={locale}
                        onSelect={(a) => onAssetSelect?.(a)}
                        selected={selectedAssetId === asset.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
