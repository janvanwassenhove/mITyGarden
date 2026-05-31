import React from "react";
import type { GardenProject } from "@mity-garden/domain";
export interface GardenCanvasProps {
  project: GardenProject;
  width: number;
  height: number;
  /** When set, clicking the canvas places this asset */
  pendingAssetId?: string | null;
  onAssetPlaced?: () => void;
}
export declare function GardenCanvas({
  project,
  width,
  height,
  pendingAssetId,
  onAssetPlaced,
}: GardenCanvasProps): React.ReactElement;
//# sourceMappingURL=GardenCanvas.d.ts.map
