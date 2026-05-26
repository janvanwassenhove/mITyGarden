import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef, useCallback, useEffect, useState } from "react";
import { Stage, Layer, Rect, Line, Text, Group, Transformer, Image as KonvaImage } from "react-konva";
import { useStore } from "zustand";
import { getAssetById } from "@mity-garden/asset-library";
import { getSharedI18n } from "@mity-garden/i18n";
import { BASE_PIXELS_PER_METER, metersToPixels, pixelsToMeters, snapToGrid, } from "@mity-garden/domain";
import { canvasStore } from "@mity-garden/domain";
import { projectStore } from "@mity-garden/domain";
// ─── Grid Lines ────────────────────────────────────────────────────────────────
function GridLines({ offsetX, offsetY, scale, gridSize, ppm, stageW, stageH, }) {
    const cellPx = metersToPixels(gridSize, ppm) * scale;
    if (cellPx < 6)
        return _jsx(_Fragment, {});
    const lines = [];
    const startX = (-offsetX % cellPx) - cellPx;
    const startY = (-offsetY % cellPx) - cellPx;
    for (let x = startX; x < stageW + cellPx; x += cellPx) {
        lines.push(_jsx(Rect, { x: x, y: 0, width: 0.5, height: stageH, fill: "rgba(0,0,0,0.08)" }, `vg-${x}`));
    }
    for (let y = startY; y < stageH + cellPx; y += cellPx) {
        lines.push(_jsx(Rect, { x: 0, y: y, width: stageW, height: 0.5, fill: "rgba(0,0,0,0.08)" }, `hg-${y}`));
    }
    return _jsx(_Fragment, { children: lines });
}
// ─── Generic URL image loader hook ───────────────────────────────────────────
//
// Loads any image URL (https:// or data:) into an HTMLImageElement.
// Sets crossOrigin="anonymous" for http(s) URLs so the image can be drawn
// to a canvas without tainting it (ESRI/tile services support CORS).
// Returns null while loading.
function useUrlImage(url) {
    const [img, setImg] = React.useState(null);
    React.useEffect(() => {
        if (!url) {
            setImg(null);
            return;
        }
        let cancelled = false;
        const image = new window.Image();
        if (url.startsWith("http"))
            image.crossOrigin = "anonymous";
        image.onload = () => { if (!cancelled)
            setImg(image); };
        image.onerror = () => { if (!cancelled)
            setImg(null); };
        image.src = url;
        return () => { cancelled = true; };
    }, [url]);
    return img;
}
/** Build an ESRI World Imagery static export URL from a geographic bounding box. */
function buildEsriMapUrl(bbox) {
    const { minLat, maxLat, minLng, maxLng } = bbox;
    const latBuf = (maxLat - minLat) * 0.05;
    const lngBuf = (maxLng - minLng) * 0.05;
    return [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export",
        `?bbox=${minLng - lngBuf},${minLat - latBuf},${maxLng + lngBuf},${maxLat + latBuf}`,
        "&bboxSR=4326&size=800,800&imageSR=4326&format=jpg&f=image",
    ].join("");
}
// ─── SVG image loader hook ────────────────────────────────────────────────────
//
// Converts an SVG string to an HTMLImageElement so Konva can render it.
// Returns null while loading (falls back to colored rect).
function useSvgImage(svgString) {
    const [img, setImg] = React.useState(null);
    React.useEffect(() => {
        if (!svgString) {
            setImg(null);
            return;
        }
        let cancelled = false;
        const image = new window.Image();
        image.onload = () => {
            if (!cancelled)
                setImg(image);
        };
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
        return () => {
            cancelled = true;
        };
    }, [svgString]);
    return img;
}
// ─── Single Element ────────────────────────────────────────────────────────────
function ElementShape({ el, ppm, selected, onClick, onDragEnd, onContextMenu, onDblClick, onMouseEnter, onMouseLeave, }) {
    const w = el.size.width * ppm;
    const h = el.size.height * ppm;
    const x = el.position.x * ppm;
    const y = el.position.y * ppm;
    const asset = getAssetById(el.assetId);
    const thumbnailImg = useSvgImage(asset?.thumbnail);
    // Fallback appearance (shown while SVG loads or if no asset found)
    const fill = FILL_BY_TYPE[el.type] ?? "#90a4ae";
    // Use || so that an empty customLabel (reset) falls back to the asset default name
    const assetName = el.customLabel || asset?.labels.en.name || el.assetId.split("-").slice(1).join(" ");
    const minDim = Math.min(w, h);
    const showLabel = minDim >= 40;
    const labelFontSize = Math.max(9, Math.min(13, minDim * 0.18));
    return (_jsxs(Group, { x: x, y: y, width: w, height: h, rotation: el.rotation, draggable: true, onClick: (e) => onClick(el.id, e), onDblClick: () => onDblClick(el.id), onContextMenu: (e) => onContextMenu(el.id, e), onDragEnd: (e) => {
            onDragEnd(el.id, e.target.x() / ppm, e.target.y() / ppm);
        }, onMouseEnter: (e) => onMouseEnter?.(el.id, e), onMouseLeave: () => onMouseLeave?.(el.id), id: el.id, children: [thumbnailImg ? (
            // Render the asset's own SVG thumbnail scaled to the element size
            _jsx(KonvaImage, { image: thumbnailImg, width: w, height: h })) : (
            // Fallback: colored rect while image loads
            _jsx(Rect, { width: w, height: h, fill: fill, stroke: "rgba(0,0,0,0.15)", strokeWidth: 1, cornerRadius: el.type === "tree" || el.type === "pool" ? minDim / 2 : 4, opacity: 0.85 })), showLabel && (_jsx(Text, { text: assetName, fontSize: labelFontSize, fill: "#1a1a1a", shadowColor: "rgba(255,255,255,0.9)", shadowBlur: 4, shadowOffsetX: 0, shadowOffsetY: 0, align: "center", verticalAlign: "middle", width: w, height: h, listening: false, ellipsis: true, wrap: "word" })), selected && (_jsx(Rect, { width: w, height: h, fill: "transparent", stroke: "#1565c0", strokeWidth: 2, dash: [5, 3] }))] }));
}
/** Element types for which a surface-area tooltip is shown on hover. */
const SURFACE_TYPES = new Set([
    "pool",
    "building",
    "grass-zone",
    "playground",
    "path",
    "furniture",
    "terrain",
    "terrace-tile",
]);
const FILL_BY_TYPE = {
    pool: "#81d4fa",
    tree: "#a5d6a7",
    plant: "#c8e6c9",
    "terrace-tile": "#d7ccc8",
    "grass-zone": "#dcedc8",
    playground: "#ffe082",
    path: "#bcaaa4",
    building: "#ef9a9a",
    "fence-wall-border": "#b0bec5",
    furniture: "#ffe0b2",
    terrain: "#c5e1a5",
    custom: "#e1bee7",
};
// ─── Context menu item ─────────────────────────────────────────────────────────
function CtxItem({ icon, label, testId, onClick, disabled = false, danger = false, }) {
    return (_jsxs("button", { "data-testid": testId, disabled: disabled, onClick: onClick, style: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "8px 14px",
            border: "none",
            background: "transparent",
            cursor: disabled ? "default" : "pointer",
            fontSize: 13,
            color: disabled ? "#bdbdbd" : danger ? "#c62828" : "#212121",
            textAlign: "left",
        }, onMouseEnter: (e) => {
            if (!disabled)
                e.currentTarget.style.background = danger ? "#ffebee" : "#f5f5f5";
        }, onMouseLeave: (e) => {
            e.currentTarget.style.background = "transparent";
        }, children: [_jsx("span", { style: { fontSize: 15, lineHeight: 1 }, children: icon }), label] }));
}
// ─── GardenCanvas ──────────────────────────────────────────────────────────────
export function GardenCanvas({ project, width, height, pendingAssetId = null, onAssetPlaced, }) {
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const containerRef = useRef(null);
    // Context menu
    const [ctxMenu, setCtxMenu] = useState(null);
    // Clipboard for copy / paste
    const [clipboard, setClipboard] = useState([]);
    // Rename overlay
    const [renameTarget, setRenameTarget] = useState(null);
    // Hover tooltip
    const [hoveredEl, setHoveredEl] = useState(null);
    const renameInputRef = useRef(null);
    const ppm = BASE_PIXELS_PER_METER;
    const gardenW = project.dimensions.width * ppm;
    const gardenH = project.dimensions.height * ppm;
    // Derive the map image URL: prefer geo-located ESRI export (from stored bounding box),
    // fall back to a stored data URL (image-trace mode).
    const mapUrl = project.mapBoundingBox
        ? buildEsriMapUrl(project.mapBoundingBox)
        : project.mapImageUrl;
    const mapImage = useUrlImage(mapUrl);
    // Convert boundary vertices (in metres) to canvas pixel polygon points
    const boundaryPoints = React.useMemo(() => {
        const verts = project.boundaryVertices;
        if (!verts || verts.length < 3)
            return null;
        const pts = [];
        for (const v of verts) {
            pts.push(v.x * ppm, v.y * ppm);
        }
        return pts;
    }, [project.boundaryVertices, ppm]);
    // Canvas state
    const offsetX = useStore(canvasStore, (s) => s.offsetX);
    const offsetY = useStore(canvasStore, (s) => s.offsetY);
    const scale = useStore(canvasStore, (s) => s.scale);
    const gridEnabled = useStore(canvasStore, (s) => s.gridEnabled);
    const gridSize = useStore(canvasStore, (s) => s.gridSize);
    const snapEnabled = useStore(canvasStore, (s) => s.snapEnabled);
    const selectedElementIds = useStore(canvasStore, (s) => s.selectedElementIds);
    const mapLayerVisible = useStore(canvasStore, (s) => s.mapLayerVisible);
    const { setOffset, setScale, selectElement, clearSelection } = canvasStore.getState();
    // Project actions
    const { addElement, updateElement, removeElement } = projectStore.getState();
    // Collect all elements across layers
    const allElements = project.layers.flatMap((l) => l.elements);
    const layerById = new Map(project.layers.map((l) => [l.id, l]));
    const elementLayerMap = new Map();
    for (const layer of project.layers) {
        for (const el of layer.elements) {
            elementLayerMap.set(el.id, layer.id);
        }
    }
    const defaultLayerId = project.layers[0]?.id ?? "";
    // Attach Transformer to selected nodes
    useEffect(() => {
        const tr = transformerRef.current;
        if (!tr || !stageRef.current)
            return;
        const stage = stageRef.current;
        const nodes = selectedElementIds
            .map((id) => stage.findOne(`#${id}`))
            .filter(Boolean);
        tr.nodes(nodes);
        tr.getLayer()?.batchDraw();
    }, [selectedElementIds]);
    // Delete key removes selected elements
    useEffect(() => {
        function onKeyDown(e) {
            if (e.key === "Escape") {
                setCtxMenu(null);
                return;
            }
            if (e.key !== "Delete" && e.key !== "Backspace")
                return;
            const target = e.target;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
                return;
            for (const id of canvasStore.getState().selectedElementIds) {
                const layerId = elementLayerMap.get(id);
                if (layerId)
                    removeElement(layerId, id);
            }
            clearSelection();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [allElements, removeElement, clearSelection, elementLayerMap]);
    // Dismiss context menu on outside click
    useEffect(() => {
        if (!ctxMenu)
            return;
        function onOutsideClick() { setCtxMenu(null); }
        window.addEventListener("mousedown", onOutsideClick);
        return () => window.removeEventListener("mousedown", onOutsideClick);
    }, [ctxMenu]);
    // Right-click on element → select + show context menu
    const handleElementContextMenu = useCallback((id, e) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
        // Ensure the right-clicked element is selected
        if (!canvasStore.getState().selectedElementIds.includes(id)) {
            selectElement(id, false);
        }
        // Position relative to canvas container
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect)
            return;
        setCtxMenu({ x: e.evt.clientX - rect.left, y: e.evt.clientY - rect.top });
    }, [selectElement]);
    // Copy selected elements to clipboard
    const handleCopy = useCallback(() => {
        const ids = canvasStore.getState().selectedElementIds;
        setClipboard(allElements.filter((el) => ids.includes(el.id)));
        setCtxMenu(null);
    }, [allElements]);
    // Paste clipboard elements with a small offset
    const handlePaste = useCallback(() => {
        const OFFSET = 0.5;
        for (const el of clipboard) {
            const newPos = { x: el.position.x + OFFSET, y: el.position.y + OFFSET };
            const newId = addElement(defaultLayerId, el.assetId, el.type, newPos, el.size);
            if (el.rotation !== 0 && newId) {
                updateElement(defaultLayerId, newId, { rotation: el.rotation });
            }
        }
        setCtxMenu(null);
    }, [clipboard, defaultLayerId, addElement, updateElement]);
    // Delete selected elements
    const handleDeleteSelected = useCallback(() => {
        const ids = canvasStore.getState().selectedElementIds;
        for (const id of ids) {
            const layerId = elementLayerMap.get(id);
            if (layerId)
                removeElement(layerId, id);
        }
        clearSelection();
        setCtxMenu(null);
    }, [elementLayerMap, removeElement, clearSelection]);
    // Start renaming: open the floating input pre-filled with the current label
    const handleStartRename = useCallback((id) => {
        const el = allElements.find((e) => e.id === id);
        if (!el)
            return;
        const asset = getAssetById(el.assetId);
        const current = el.customLabel ?? asset?.labels.en.name ?? el.assetId.split("-").slice(1).join(" ");
        setRenameTarget({ id, name: current });
        setCtxMenu(null);
    }, [allElements]);
    // Commit the rename: save customLabel, or store "" to reset to the asset default.
    // Note: exactOptionalPropertyTypes prevents passing undefined here; the display
    // uses || so an empty string falls through to the asset's built-in label.
    const handleRenameCommit = useCallback((id, newName) => {
        const layerId = elementLayerMap.get(id);
        if (layerId) {
            updateElement(layerId, id, { customLabel: newName.trim() });
        }
        setRenameTarget(null);
    }, [elementLayerMap, updateElement]);
    // Focus + select-all the rename input whenever it mounts
    useEffect(() => {
        if (renameTarget) {
            renameInputRef.current?.focus();
            renameInputRef.current?.select();
        }
    }, [renameTarget]);
    // Double-click on element → rename
    const handleElementDblClick = useCallback((id) => {
        handleStartRename(id);
    }, [handleStartRename]);
    // Pan: drag the stage background
    const handleStageDragEnd = useCallback((e) => {
        if (e.target !== stageRef.current)
            return;
        setOffset(e.target.x(), e.target.y());
    }, [setOffset]);
    // Zoom: mouse wheel
    const handleWheel = useCallback((e) => {
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage)
            return;
        const oldScale = scale;
        const pointer = stage.getPointerPosition();
        if (!pointer)
            return;
        const direction = e.evt.deltaY < 0 ? 1 : -1;
        const newScale = Math.max(0.1, Math.min(10, oldScale * (1 + direction * 0.1)));
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        setScale(newScale);
        setOffset(pointer.x - mousePointTo.x * newScale, pointer.y - mousePointTo.y * newScale);
    }, [scale, setScale, setOffset]);
    // Click on stage background: clear selection OR place asset (keeps asset selected for repeat placements)
    const handleStageClick = useCallback((e) => {
        if (e.target !== stageRef.current)
            return; // clicked on an element
        if (e.evt.button !== 0)
            return; // ignore right-click (handled by onContextMenu)
        if (pendingAssetId) {
            // Place asset at clicked position; stay in placement mode for the next click
            const stage = stageRef.current;
            if (!stage)
                return;
            const pointer = stage.getPointerPosition();
            if (!pointer)
                return;
            // Convert screen → world coords
            const worldX = pixelsToMeters((pointer.x - stage.x()) / scale, ppm);
            const worldY = pixelsToMeters((pointer.y - stage.y()) / scale, ppm);
            const pos = snapEnabled
                ? { x: snapToGrid(worldX, gridSize), y: snapToGrid(worldY, gridSize) }
                : { x: worldX, y: worldY };
            // Find asset definition for default size
            const asset = getAssetById(pendingAssetId);
            if (!asset)
                return;
            addElement(defaultLayerId, asset.id, asset.type, pos, asset.defaultSize);
            // Do NOT call onAssetPlaced here — keep asset selected so the user can
            // place more copies with additional left-clicks.
            return;
        }
        clearSelection();
    }, [pendingAssetId, scale, snapEnabled, gridSize, defaultLayerId, addElement, clearSelection]);
    // Right-click on stage background: cancel placement mode (or show nothing)
    const handleStageContextMenu = useCallback((e) => {
        if (e.target !== stageRef.current)
            return;
        if (pendingAssetId) {
            e.evt.preventDefault();
            onAssetPlaced?.();
        }
    }, [pendingAssetId, onAssetPlaced]);
    // Click on element: select it
    const handleElementClick = useCallback((id, e) => {
        e.cancelBubble = true;
        setCtxMenu(null);
        selectElement(id, e.evt.shiftKey);
    }, [selectElement]);
    // Drag element: update position
    const handleElementDragEnd = useCallback((id, worldX, worldY) => {
        const layerId = elementLayerMap.get(id);
        if (!layerId)
            return;
        const snapped = snapEnabled
            ? { x: snapToGrid(worldX, gridSize), y: snapToGrid(worldY, gridSize) }
            : { x: worldX, y: worldY };
        updateElement(layerId, id, { position: snapped });
    }, [elementLayerMap, snapEnabled, gridSize, updateElement]);
    const handleElementMouseEnter = useCallback((id, e) => {
        const el = allElements.find((el) => el.id === id);
        if (!el || !SURFACE_TYPES.has(el.type))
            return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect)
            return;
        setHoveredEl({ id, x: e.evt.clientX - rect.left, y: e.evt.clientY - rect.top });
    }, [allElements]);
    const handleElementMouseLeave = useCallback(() => {
        setHoveredEl(null);
    }, []);
    // Center view: start with garden centered
    const initOffsetX = (width - gardenW) / 2;
    const initOffsetY = (height - gardenH) / 2;
    const selectedCount = selectedElementIds.length;
    return (_jsxs("div", { ref: containerRef, style: { position: "relative", width, height, flexShrink: 0 }, children: [_jsxs(Stage, { ref: stageRef, width: width, height: height, x: offsetX !== 0 ? offsetX : initOffsetX, y: offsetY !== 0 ? offsetY : initOffsetY, scaleX: scale, scaleY: scale, draggable: true, onDragEnd: handleStageDragEnd, onWheel: handleWheel, onClick: handleStageClick, onContextMenu: handleStageContextMenu, style: { background: "#e8f5e9", cursor: pendingAssetId ? "crosshair" : "default" }, "data-testid": "garden-canvas-stage", children: [_jsxs(Layer, { children: [_jsx(Rect, { x: -width, y: -height, width: width * 3, height: height * 3, fill: "#f0f4e8", listening: false }), gridEnabled && (_jsx(GridLines, { offsetX: offsetX !== 0 ? offsetX : initOffsetX, offsetY: offsetY !== 0 ? offsetY : initOffsetY, scale: scale, gridSize: gridSize, ppm: ppm, stageW: width / scale, stageH: height / scale }))] }), mapImage && mapLayerVisible && (_jsx(Layer, { listening: false, children: _jsx(KonvaImage, { image: mapImage, x: 0, y: 0, width: gardenW, height: gardenH, opacity: 0.7, listening: false }) })), _jsxs(Layer, { children: [boundaryPoints ? (_jsx(Line, { points: boundaryPoints, closed: true, fill: "#c8e6c9", stroke: "#4caf50", strokeWidth: 2 / scale, listening: false })) : (_jsx(Rect, { x: 0, y: 0, width: gardenW, height: gardenH, fill: "#c8e6c9", stroke: "#4caf50", strokeWidth: 2 / scale, listening: false })), _jsx(Text, { x: 8 / scale, y: 8 / scale, text: `${project.name}  ${project.dimensions.width}m × ${project.dimensions.height}m`, fontSize: Math.max(10, 14 / scale), fill: "#2e7d32", listening: false })] }), _jsxs(Layer, { children: [allElements.map((el) => (_jsx(ElementShape, { el: el, ppm: ppm, selected: selectedElementIds.includes(el.id), onClick: handleElementClick, onDragEnd: handleElementDragEnd, onContextMenu: handleElementContextMenu, onDblClick: handleElementDblClick, onMouseEnter: handleElementMouseEnter, onMouseLeave: handleElementMouseLeave }, el.id))), _jsx(Transformer, { ref: transformerRef, rotateEnabled: true, keepRatio: false, onTransformEnd: (e) => {
                                    const node = e.target;
                                    const id = node.id();
                                    const layerId = elementLayerMap.get(id);
                                    if (!layerId)
                                        return;
                                    updateElement(layerId, id, {
                                        position: { x: node.x() / ppm, y: node.y() / ppm },
                                        size: { width: (node.width() * node.scaleX()) / ppm, height: (node.height() * node.scaleY()) / ppm },
                                        rotation: node.rotation(),
                                    });
                                    node.scaleX(1);
                                    node.scaleY(1);
                                } })] })] }), ctxMenu && (_jsxs("div", { "data-testid": "canvas-context-menu", onMouseDown: (e) => e.stopPropagation(), style: {
                    position: "absolute",
                    left: ctxMenu.x,
                    top: ctxMenu.y,
                    background: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    padding: "4px 0",
                    zIndex: 200,
                    minWidth: 160,
                    userSelect: "none",
                }, children: [_jsx(CtxItem, { icon: "\uD83D\uDCCB", label: getSharedI18n().t("canvas.contextMenu.copy"), testId: "ctx-copy", onClick: handleCopy }), _jsx(CtxItem, { icon: "\uD83D\uDCCC", label: clipboard.length > 0 ? getSharedI18n().t("canvas.contextMenu.pasteCount", { count: clipboard.length }) : getSharedI18n().t("canvas.contextMenu.paste"), testId: "ctx-paste", onClick: handlePaste, disabled: clipboard.length === 0 }), _jsx(CtxItem, { icon: "\u270F\uFE0F", label: getSharedI18n().t("canvas.contextMenu.rename"), testId: "ctx-rename", onClick: () => {
                            const ids = canvasStore.getState().selectedElementIds;
                            if (ids.length === 1)
                                handleStartRename(ids[0]);
                        }, disabled: selectedCount !== 1 }), _jsx("div", { style: { height: 1, background: "#f0f0f0", margin: "4px 0" } }), _jsx(CtxItem, { icon: "\uD83D\uDDD1", label: selectedCount > 1 ? getSharedI18n().t("canvas.contextMenu.deleteCount", { count: selectedCount }) : getSharedI18n().t("canvas.contextMenu.delete"), testId: "ctx-delete", onClick: handleDeleteSelected, danger: true })] })), (() => {
                const address = project.metadata.address ?? project.mapData?.address;
                const area = (project.dimensions.width * project.dimensions.height).toFixed(1);
                return (_jsxs("div", { style: {
                        position: "absolute",
                        bottom: 10,
                        left: 10,
                        background: "rgba(0,0,0,0.58)",
                        color: "#fff",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontFamily: "inherit",
                        pointerEvents: "none",
                        zIndex: 100,
                        maxWidth: 360,
                    }, children: [_jsxs("div", { style: { fontWeight: 600 }, children: [project.dimensions.width, "m \u00D7 ", project.dimensions.height, "m \u2014 ", area, " m\u00B2"] }), address && (_jsx("div", { style: { fontSize: 11, opacity: 0.85, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: address }))] }));
            })(), hoveredEl && (() => {
                const el = allElements.find((e) => e.id === hoveredEl.id);
                if (!el)
                    return null;
                const asset = getAssetById(el.assetId);
                const name = el.customLabel || asset?.labels.en.name || el.assetId.split("-").slice(1).join(" ");
                const area = (el.size.width * el.size.height).toFixed(1);
                return (_jsxs("div", { style: {
                        position: "absolute",
                        left: hoveredEl.x + 14,
                        top: hoveredEl.y + 16,
                        background: "rgba(33,33,33,0.82)",
                        color: "#fff",
                        borderRadius: 6,
                        padding: "5px 10px",
                        fontSize: 12,
                        fontFamily: "inherit",
                        pointerEvents: "none",
                        zIndex: 150,
                        whiteSpace: "nowrap",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
                    }, children: [name, " \u2014 ", area, " m\u00B2"] }));
            })(), renameTarget && (() => {
                const el = allElements.find((e) => e.id === renameTarget.id);
                if (!el)
                    return null;
                const stageX = offsetX !== 0 ? offsetX : initOffsetX;
                const stageY = offsetY !== 0 ? offsetY : initOffsetY;
                const screenX = el.position.x * ppm * scale + stageX;
                const screenY = el.position.y * ppm * scale + stageY;
                const screenW = Math.max(80, el.size.width * ppm * scale);
                const screenH = el.size.height * ppm * scale;
                return (_jsx("input", { ref: renameInputRef, "data-testid": "canvas-rename-input", value: renameTarget.name, onChange: (e) => setRenameTarget((r) => (r ? { ...r, name: e.target.value } : null)), onKeyDown: (e) => {
                        if (e.key === "Enter")
                            handleRenameCommit(renameTarget.id, renameTarget.name);
                        if (e.key === "Escape")
                            setRenameTarget(null);
                    }, onBlur: () => handleRenameCommit(renameTarget.id, renameTarget.name), style: {
                        position: "absolute",
                        left: screenX,
                        top: screenY + screenH / 2 - 14,
                        width: screenW,
                        height: 28,
                        fontSize: 13,
                        fontFamily: "inherit",
                        textAlign: "center",
                        border: "2px solid #1565c0",
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.97)",
                        outline: "none",
                        zIndex: 300,
                        padding: "0 6px",
                        boxSizing: "border-box",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                    } }));
            })()] }));
}
//# sourceMappingURL=GardenCanvas.js.map