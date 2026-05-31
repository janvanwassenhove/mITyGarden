import React from "react";
import type { AssetDefinition } from "@mity-garden/domain";
export interface AssetLibraryPanelProps {
  locale?: "en" | "nl" | "fr";
  onAssetSelect?: (asset: AssetDefinition) => void;
  selectedAssetId?: string | null;
}
export declare function AssetLibraryPanel({
  locale,
  onAssetSelect,
  selectedAssetId,
}: AssetLibraryPanelProps): React.ReactElement;
//# sourceMappingURL=AssetLibraryPanel.d.ts.map
