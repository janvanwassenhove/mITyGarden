import type { GardenProject } from "@mity-garden/domain";
export interface ReferenceRenderOptions {
    /** Pixels per metre — defaults to BASE_PIXELS_PER_METER (50). */
    ppm?: number;
    /** Whether to draw element labels. Default false. */
    showLabels?: boolean;
    /** Whether to draw a north arrow. Default true. */
    showNorthArrow?: boolean;
    /** Whether to draw a scale bar. Default true. */
    showScaleBar?: boolean;
    /** Optional camera position marker. */
    cameraPosition?: {
        x: number;
        y: number;
        targetX: number;
        targetY: number;
    };
    /** Output image pixel ratio. Default 2 for retina. */
    pixelRatio?: number;
}
/**
 * Generate a top-down reference PNG image from the garden project.
 * Returns a Blob containing the PNG data.
 *
 * Uses headless Konva — no mounted React component required.
 */
export declare function generateReferenceImage(project: GardenProject, options?: ReferenceRenderOptions): Promise<Blob>;
//# sourceMappingURL=ReferenceRenderService.d.ts.map