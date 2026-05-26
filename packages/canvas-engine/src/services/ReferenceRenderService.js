// ─── Reference Render Service ─────────────────────────────────────────────────
// Generates a simplified top-down reference image from the garden layout
// using headless Konva. The output PNG is suitable for image-to-image input
// to AI image generators.
import Konva from "konva";
import { BASE_PIXELS_PER_METER } from "@mity-garden/domain";
// ─── Color palette ────────────────────────────────────────────────────────────
const COLORS = {
    boundary: { fill: "#c8e6c9", stroke: "#2e7d32" },
    building: { fill: "#90a4ae", stroke: "#455a64" },
    pool: { fill: "#4fc3f7", stroke: "#0277bd" },
    tree: { fill: "#66bb6a", stroke: "#2e7d32" },
    plant: { fill: "#81c784", stroke: "#388e3c" },
    terrain: { fill: "#a5d6a7", stroke: "#388e3c" },
    "terrace-tile": { fill: "#bdbdbd", stroke: "#757575" },
    "grass-zone": { fill: "#a5d6a7", stroke: "#4caf50" },
    playground: { fill: "#ffcc80", stroke: "#ef6c00" },
    path: { fill: "#bcaaa4", stroke: "#795548" },
    "fence-wall-border": { fill: "#8d6e63", stroke: "#4e342e" },
    furniture: { fill: "#ce93d8", stroke: "#7b1fa2" },
    custom: { fill: "#e0e0e0", stroke: "#616161" },
};
function getElementColors(type) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return COLORS[type] ?? COLORS["custom"];
}
/**
 * Generate a top-down reference PNG image from the garden project.
 * Returns a Blob containing the PNG data.
 *
 * Uses headless Konva — no mounted React component required.
 */
export async function generateReferenceImage(project, options = {}) {
    const ppm = options.ppm ?? BASE_PIXELS_PER_METER;
    const pixelRatio = options.pixelRatio ?? 2;
    const showLabels = options.showLabels ?? false;
    const showNorthArrow = options.showNorthArrow ?? true;
    const showScaleBar = options.showScaleBar ?? true;
    const padding = 40; // px padding around content
    const stageW = project.dimensions.width * ppm + padding * 2;
    const stageH = project.dimensions.height * ppm + padding * 2;
    // Create headless stage
    const stage = new Konva.Stage({
        container: document.createElement("div"),
        width: stageW,
        height: stageH,
    });
    const layer = new Konva.Layer();
    stage.add(layer);
    // Background
    layer.add(new Konva.Rect({
        x: 0,
        y: 0,
        width: stageW,
        height: stageH,
        fill: "#f5f5f0",
    }));
    // Garden boundary
    drawBoundary(layer, project, ppm, padding);
    // Elements — draw in zIndex order
    const allElements = project.layers
        .filter((l) => l.visible)
        .flatMap((l) => l.elements)
        .filter((e) => e.visible)
        .sort((a, b) => a.zIndex - b.zIndex);
    for (const el of allElements) {
        drawElement(layer, el, ppm, padding, showLabels);
    }
    // North arrow
    if (showNorthArrow) {
        drawNorthArrow(layer, stageW);
    }
    // Scale bar
    if (showScaleBar) {
        drawScaleBar(layer, ppm, stageH);
    }
    // Camera marker
    if (options.cameraPosition) {
        drawCameraMarker(layer, options.cameraPosition, ppm, padding);
    }
    layer.draw();
    // Export to blob
    return new Promise((resolve, reject) => {
        try {
            const dataUrl = stage.toDataURL({ pixelRatio });
            const parts = dataUrl.split(",");
            const byteString = atob(parts[1] ?? "");
            const mimeString = (parts[0] ?? "").split(":")[1]?.split(";")[0] ?? "image/png";
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            resolve(new Blob([ab], { type: mimeString }));
        }
        catch (err) {
            reject(err);
        }
        finally {
            stage.destroy();
        }
    });
}
// ─── Drawing helpers ──────────────────────────────────────────────────────────
function drawBoundary(layer, project, ppm, padding) {
    const verts = project.boundaryVertices;
    if (verts && verts.length >= 3) {
        const points = verts.flatMap((v) => [v.x * ppm + padding, v.y * ppm + padding]);
        layer.add(new Konva.Line({
            points,
            closed: true,
            fill: COLORS["boundary"]?.fill ?? "#c8e6c9",
            stroke: COLORS["boundary"]?.stroke ?? "#2e7d32",
            strokeWidth: 2,
            opacity: 0.8,
        }));
    }
    else {
        layer.add(new Konva.Rect({
            x: padding,
            y: padding,
            width: project.dimensions.width * ppm,
            height: project.dimensions.height * ppm,
            fill: COLORS["boundary"]?.fill ?? "#c8e6c9",
            stroke: COLORS["boundary"]?.stroke ?? "#2e7d32",
            strokeWidth: 2,
            opacity: 0.8,
        }));
    }
}
function drawElement(layer, el, ppm, padding, showLabels) {
    const x = el.position.x * ppm + padding;
    const y = el.position.y * ppm + padding;
    const w = el.size.width * ppm;
    const h = el.size.height * ppm;
    const colors = getElementColors(el.type);
    const group = new Konva.Group({
        x: x + w / 2,
        y: y + h / 2,
        rotation: el.rotation,
        offsetX: w / 2,
        offsetY: h / 2,
    });
    if (el.type === "tree" || el.type === "plant") {
        // Draw as circle (canopy from above)
        const radius = Math.min(w, h) / 2;
        group.add(new Konva.Circle({
            x: w / 2,
            y: h / 2,
            radius,
            fill: colors.fill,
            stroke: colors.stroke,
            strokeWidth: 1.5,
            opacity: 0.85,
        }));
    }
    else if (el.type === "pool") {
        // Draw as rounded rectangle
        group.add(new Konva.Rect({
            x: 0,
            y: 0,
            width: w,
            height: h,
            cornerRadius: Math.min(w, h) * 0.2,
            fill: colors.fill,
            stroke: colors.stroke,
            strokeWidth: 1.5,
            opacity: 0.9,
        }));
    }
    else {
        // Default rectangle
        group.add(new Konva.Rect({
            x: 0,
            y: 0,
            width: w,
            height: h,
            fill: colors.fill,
            stroke: colors.stroke,
            strokeWidth: 1.5,
            opacity: 0.85,
        }));
    }
    if (showLabels) {
        const label = el.assetId.replace(/-/g, " ");
        group.add(new Konva.Text({
            x: 0,
            y: h / 2 - 5,
            width: w,
            text: label,
            fontSize: 9,
            fill: "#333",
            align: "center",
        }));
    }
    layer.add(group);
}
function drawNorthArrow(layer, stageW) {
    const cx = stageW - 30;
    const cy = 30;
    // Arrow pointing up (north)
    layer.add(new Konva.Arrow({
        points: [cx, cy + 15, cx, cy - 10],
        pointerLength: 6,
        pointerWidth: 5,
        fill: "#333",
        stroke: "#333",
        strokeWidth: 1.5,
    }));
    layer.add(new Konva.Text({
        x: cx - 4,
        y: cy - 22,
        text: "N",
        fontSize: 12,
        fill: "#333",
        fontStyle: "bold",
    }));
}
function drawScaleBar(layer, ppm, stageH) {
    const barLength = 10 * ppm; // 10 metres
    const x = 20;
    const y = stageH - 20;
    layer.add(new Konva.Line({
        points: [x, y, x + barLength, y],
        stroke: "#333",
        strokeWidth: 2,
    }));
    // End caps
    layer.add(new Konva.Line({ points: [x, y - 4, x, y + 4], stroke: "#333", strokeWidth: 1.5 }));
    layer.add(new Konva.Line({
        points: [x + barLength, y - 4, x + barLength, y + 4],
        stroke: "#333",
        strokeWidth: 1.5,
    }));
    layer.add(new Konva.Text({
        x: x + barLength / 2 - 10,
        y: y - 14,
        text: "10 m",
        fontSize: 10,
        fill: "#333",
    }));
}
function drawCameraMarker(layer, camera, ppm, padding) {
    const cx = camera.x * ppm + padding;
    const cy = camera.y * ppm + padding;
    const tx = camera.targetX * ppm + padding;
    const ty = camera.targetY * ppm + padding;
    // Camera icon (circle)
    layer.add(new Konva.Circle({
        x: cx,
        y: cy,
        radius: 6,
        fill: "#d32f2f",
        stroke: "#b71c1c",
        strokeWidth: 1.5,
    }));
    // Direction arrow
    layer.add(new Konva.Arrow({
        points: [cx, cy, tx, ty],
        pointerLength: 8,
        pointerWidth: 6,
        fill: "#d32f2f",
        stroke: "#d32f2f",
        strokeWidth: 1.5,
        dash: [4, 3],
    }));
    // Target crosshair
    layer.add(new Konva.Circle({
        x: tx,
        y: ty,
        radius: 4,
        stroke: "#d32f2f",
        strokeWidth: 1,
    }));
}
//# sourceMappingURL=ReferenceRenderService.js.map