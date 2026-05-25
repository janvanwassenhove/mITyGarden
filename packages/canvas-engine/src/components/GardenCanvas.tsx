import React from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import type { GardenProject } from "@mity-garden/domain";
import { BASE_PIXELS_PER_METER } from "@mity-garden/domain";

export interface GardenCanvasProps {
  project: GardenProject;
  width: number;
  height: number;
}

/**
 * GardenCanvas — Milestone 3 placeholder.
 * Renders the garden boundary to validate Konva is wired correctly.
 * Full implementation (pan/zoom/snap/drag-drop) follows in Milestone 3.
 */
export function GardenCanvas({ project, width, height }: GardenCanvasProps): React.ReactElement {
  const ppm = BASE_PIXELS_PER_METER;
  const canvasW = project.dimensions.width * ppm;
  const canvasH = project.dimensions.height * ppm;

  return (
    <Stage width={width} height={height} style={{ background: "#f0f4e8" }}>
      <Layer>
        {/* Garden boundary */}
        <Rect
          x={(width - canvasW) / 2}
          y={(height - canvasH) / 2}
          width={canvasW}
          height={canvasH}
          fill="#c8e6c9"
          stroke="#4caf50"
          strokeWidth={2}
        />
        <Text
          x={(width - canvasW) / 2 + 10}
          y={(height - canvasH) / 2 + 10}
          text={`${project.name}\n${project.dimensions.width}m × ${project.dimensions.height}m`}
          fontSize={14}
          fill="#2e7d32"
        />
      </Layer>
    </Stage>
  );
}
