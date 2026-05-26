import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { useTranslation } from "react-i18next";
import { GardenImageService, DEFAULT_VIEW, DEFAULT_ENHANCEMENTS, DEFAULT_STRICTNESS, } from "@mity-garden/llm";
import { generateReferenceImage } from "@mity-garden/canvas-engine";
// ─── Helper ───────────────────────────────────────────────────────────────────
function resolveImageSrc(img) {
    if (img.url)
        return img.url;
    if (img.base64)
        return `data:${img.mimeType};base64,${img.base64}`;
    return "";
}
// ─── Saved settings key ───────────────────────────────────────────────────────
const SETTINGS_KEY = "mityGarden.aiRender.settings";
function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
function saveSettings(s) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    }
    catch {
        // localStorage may be unavailable
    }
}
// ─── Component ────────────────────────────────────────────────────────────────
export function AIRenderPanel({ project, imageProvider, imageProviderOptions, onImageProviderChange, onOpenSettings, }) {
    const { t } = useTranslation("common");
    const imageService = React.useMemo(() => new GardenImageService(imageProvider), [imageProvider]);
    // ── State ─────────────────────────────────────────────────────────────────
    const saved = React.useMemo(() => loadSettings(), []);
    const [step, setStep] = React.useState("view");
    // View settings
    const [viewMode, setViewMode] = React.useState(saved?.view.mode ?? DEFAULT_VIEW.mode);
    const [realism, setRealism] = React.useState(saved?.view.realism ?? DEFAULT_VIEW.realism);
    const [lens, setLens] = React.useState(saved?.view.lens ?? DEFAULT_VIEW.lens);
    const [cameraHeight, setCameraHeight] = React.useState(saved?.view.cameraHeightMeters ?? DEFAULT_VIEW.cameraHeightMeters);
    const [cameraAngle, setCameraAngle] = React.useState(saved?.view.cameraAngleDegrees ?? DEFAULT_VIEW.cameraAngleDegrees);
    const [direction, setDirection] = React.useState(saved?.view.direction ?? DEFAULT_VIEW.direction);
    const [timeOfDay, setTimeOfDay] = React.useState(saved?.view.timeOfDay ?? DEFAULT_VIEW.timeOfDay);
    const [season, setSeason] = React.useState(saved?.view.season ?? DEFAULT_VIEW.season);
    // Strictness
    const [strictness, setStrictness] = React.useState(saved?.strictness ?? DEFAULT_STRICTNESS);
    // Enhancements
    const [enhancements, setEnhancements] = React.useState(saved?.enhancements ?? { ...DEFAULT_ENHANCEMENTS });
    // Generation state
    const [generatedImage, setGeneratedImage] = React.useState(null);
    const [promptPreview, setPromptPreview] = React.useState(null);
    const [imageLoading, setImageLoading] = React.useState(false);
    const [imageError, setImageError] = React.useState(null);
    const [referencePreview, setReferencePreview] = React.useState(null);
    const imageAvailable = imageProvider.isConfigured();
    // ── Persist settings ──────────────────────────────────────────────────────
    React.useEffect(() => {
        const view = {
            mode: viewMode,
            realism,
            lens,
            cameraHeightMeters: cameraHeight,
            cameraAngleDegrees: cameraAngle,
            direction,
            timeOfDay,
            season,
        };
        saveSettings({ view, enhancements, strictness });
    }, [viewMode, realism, lens, cameraHeight, cameraAngle, direction, timeOfDay, season, enhancements, strictness]);
    // ── Build scene options ───────────────────────────────────────────────────
    function buildOptions() {
        return {
            view: {
                mode: viewMode,
                realism,
                lens,
                cameraHeightMeters: cameraHeight,
                cameraAngleDegrees: cameraAngle,
                direction,
                timeOfDay,
                season,
            },
            enhancements,
            strictness,
        };
    }
    // ── Handlers ──────────────────────────────────────────────────────────────
    function handlePreviewPrompt() {
        const { prompt } = imageService.buildScenePrompt(project, buildOptions());
        setPromptPreview(prompt);
    }
    async function handleGenerateReference() {
        try {
            const blob = await generateReferenceImage(project, {
                showLabels: true,
                showNorthArrow: true,
                showScaleBar: true,
            });
            const url = URL.createObjectURL(blob);
            setReferencePreview(url);
        }
        catch (err) {
            console.error("[mITyGarden] Reference image error:", err);
        }
    }
    async function handleGenerate() {
        setImageLoading(true);
        setImageError(null);
        try {
            // Generate reference image for providers that support it
            let refBlob;
            if (imageService.supportsReferenceImage()) {
                refBlob = await generateReferenceImage(project, {
                    showLabels: true,
                    showNorthArrow: true,
                    showScaleBar: true,
                });
            }
            const img = await imageService.generateFromScene(project, buildOptions(), refBlob);
            setGeneratedImage(img);
            setStep("generate");
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : "Image generation failed.";
            console.error("[mITyGarden] AI render error:", msg);
            setImageError(msg);
        }
        finally {
            setImageLoading(false);
        }
    }
    // ── Styles ────────────────────────────────────────────────────────────────
    const labelStyle = {
        fontSize: 12,
        fontWeight: 600,
        color: "#555",
        display: "block",
        marginBottom: 4,
    };
    const selectStyle = {
        width: "100%",
        padding: "6px 8px",
        borderRadius: 6,
        border: "1px solid #ccc",
        fontSize: 12,
        background: "#fff",
        marginBottom: 10,
    };
    const chipStyle = (active) => ({
        padding: "5px 10px",
        borderRadius: 16,
        border: active ? "2px solid #4caf50" : "1px solid #ccc",
        background: active ? "#e8f5e9" : "#fff",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: active ? 700 : 400,
    });
    const primaryBtnStyle = {
        width: "100%",
        padding: "10px 16px",
        borderRadius: 8,
        border: "none",
        background: imageAvailable ? "#1565c0" : "#e0e0e0",
        color: imageAvailable ? "#fff" : "#999",
        fontWeight: 600,
        cursor: imageAvailable && !imageLoading ? "pointer" : "not-allowed",
        fontSize: 13,
    };
    const stepBtnStyle = (active) => ({
        flex: 1,
        padding: "6px 4px",
        border: "none",
        borderBottom: active ? "2px solid #1565c0" : "2px solid transparent",
        background: "none",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: active ? 700 : 400,
        color: active ? "#1565c0" : "#888",
    });
    // ── Render ────────────────────────────────────────────────────────────────
    return (_jsxs("div", { "data-testid": "ai-render-panel", children: [_jsx("div", { style: { display: "flex", marginBottom: 12 }, children: ["view", "camera", "enhancements", "generate"].map((s) => (_jsx("button", { style: stepBtnStyle(step === s), onClick: () => setStep(s), children: t(`llm.aiRender.steps.${s}`) }, s))) }), !imageAvailable && (_jsxs("div", { style: {
                    padding: 10,
                    background: "#fff3e0",
                    border: "1px solid #ffe0b2",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#e65100",
                    marginBottom: 12,
                }, children: [t("llm.imageNotConfigured"), onOpenSettings && (_jsx("button", { onClick: onOpenSettings, style: {
                            marginTop: 6,
                            padding: "3px 8px",
                            borderRadius: 4,
                            border: "1px solid #e65100",
                            background: "#fff",
                            color: "#e65100",
                            cursor: "pointer",
                            fontSize: 11,
                        }, children: t("llm.configureKeys") }))] })), step === "view" && (_jsxs("div", { children: [_jsx("label", { style: labelStyle, children: t("llm.aiRender.viewMode") }), _jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }, children: ["oblique_drone", "eye_level", "top_down", "cinematic"].map((m) => (_jsx("button", { style: chipStyle(viewMode === m), onClick: () => setViewMode(m), children: t(`llm.aiRender.viewModes.${m}`) }, m))) }), _jsx("label", { style: labelStyle, children: t("llm.aiRender.realism") }), _jsxs("select", { value: realism, onChange: (e) => setRealism(e.target.value), style: selectStyle, children: [_jsx("option", { value: "photorealistic", children: t("llm.aiRender.realismOptions.photorealistic") }), _jsx("option", { value: "architectural_visualization", children: t("llm.aiRender.realismOptions.architectural") }), _jsx("option", { value: "concept_render", children: t("llm.aiRender.realismOptions.concept") })] }), _jsx("label", { style: labelStyle, children: t("llm.aiRender.strictness") }), _jsxs("select", { value: strictness, onChange: (e) => setStrictness(e.target.value), style: selectStyle, children: [_jsx("option", { value: "creative", children: t("llm.aiRender.strictnessOptions.creative") }), _jsx("option", { value: "balanced", children: t("llm.aiRender.strictnessOptions.balanced") }), _jsx("option", { value: "strict", children: t("llm.aiRender.strictnessOptions.strict") }), _jsx("option", { value: "very_strict", children: t("llm.aiRender.strictnessOptions.veryStrict") })] }), _jsxs("button", { style: { ...primaryBtnStyle, background: "#4caf50", marginTop: 4 }, onClick: () => setStep("camera"), children: [t("common.next"), " \u2192"] })] })), step === "camera" && (_jsxs("div", { children: [_jsx("label", { style: labelStyle, children: t("llm.aiRender.cameraHeight") }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }, children: [_jsx("input", { type: "range", min: 5, max: 100, step: 5, value: cameraHeight, onChange: (e) => setCameraHeight(Number(e.target.value)), style: { flex: 1 } }), _jsxs("span", { style: { fontSize: 12, minWidth: 32 }, children: [cameraHeight, "m"] })] }), _jsx("label", { style: labelStyle, children: t("llm.aiRender.cameraAngle") }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }, children: [_jsx("input", { type: "range", min: 10, max: 90, step: 5, value: cameraAngle, onChange: (e) => setCameraAngle(Number(e.target.value)), style: { flex: 1 } }), _jsxs("span", { style: { fontSize: 12, minWidth: 32 }, children: [cameraAngle, "\u00B0"] })] }), _jsx("label", { style: labelStyle, children: t("llm.aiRender.direction") }), _jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }, children: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"].map((d) => (_jsx("button", { style: chipStyle(direction === d), onClick: () => setDirection(d), children: d }, d))) }), _jsx("label", { style: labelStyle, children: t("llm.aiRender.lens") }), _jsxs("select", { value: lens, onChange: (e) => setLens(e.target.value), style: selectStyle, children: [_jsx("option", { value: "wide_angle", children: t("llm.aiRender.lensOptions.wide") }), _jsx("option", { value: "natural", children: t("llm.aiRender.lensOptions.natural") }), _jsx("option", { value: "telephoto", children: t("llm.aiRender.lensOptions.telephoto") })] }), _jsx("label", { style: labelStyle, children: t("llm.aiRender.timeOfDay") }), _jsxs("select", { value: timeOfDay, onChange: (e) => setTimeOfDay(e.target.value), style: selectStyle, children: [_jsx("option", { value: "morning", children: t("llm.aiRender.timeOptions.morning") }), _jsx("option", { value: "summer_afternoon", children: t("llm.aiRender.timeOptions.afternoon") }), _jsx("option", { value: "golden_hour", children: t("llm.aiRender.timeOptions.goldenHour") }), _jsx("option", { value: "overcast", children: t("llm.aiRender.timeOptions.overcast") })] }), _jsx("label", { style: labelStyle, children: t("llm.aiRender.season") }), _jsxs("select", { value: season, onChange: (e) => setSeason(e.target.value), style: selectStyle, children: [_jsx("option", { value: "spring", children: t("llm.aiRender.seasonOptions.spring") }), _jsx("option", { value: "summer", children: t("llm.aiRender.seasonOptions.summer") }), _jsx("option", { value: "autumn", children: t("llm.aiRender.seasonOptions.autumn") }), _jsx("option", { value: "winter", children: t("llm.aiRender.seasonOptions.winter") })] }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsxs("button", { style: { flex: 1, ...primaryBtnStyle, background: "#757575" }, onClick: () => setStep("view"), children: ["\u2190 ", t("common.back")] }), _jsxs("button", { style: { flex: 1, ...primaryBtnStyle, background: "#4caf50" }, onClick: () => setStep("enhancements"), children: [t("common.next"), " \u2192"] })] })] })), step === "enhancements" && (_jsxs("div", { children: [Object.keys(enhancements).map((key) => (_jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12, cursor: "pointer" }, children: [_jsx("input", { type: "checkbox", checked: enhancements[key], onChange: (e) => setEnhancements({ ...enhancements, [key]: e.target.checked }) }), t(`llm.aiRender.enhancements.${key}`)] }, key))), imageProviderOptions && imageProviderOptions.filter((p) => p.available).length > 0 && (_jsxs("div", { style: { marginTop: 12 }, children: [_jsx("label", { style: labelStyle, children: t("llm.aiRender.imageProvider") }), _jsx("select", { value: imageProvider.name, onChange: (e) => onImageProviderChange?.(e.target.value), style: selectStyle, children: imageProviderOptions.filter((p) => p.available).map((p) => (_jsx("option", { value: p.id, children: p.label }, p.id))) })] })), _jsxs("div", { style: { display: "flex", gap: 8, marginTop: 8 }, children: [_jsxs("button", { style: { flex: 1, ...primaryBtnStyle, background: "#757575" }, onClick: () => setStep("camera"), children: ["\u2190 ", t("common.back")] }), _jsxs("button", { style: { flex: 1, ...primaryBtnStyle, background: "#4caf50" }, onClick: () => setStep("generate"), children: [t("common.next"), " \u2192"] })] })] })), step === "generate" && (_jsxs("div", { children: [_jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 10 }, children: [_jsx("button", { onClick: () => void handleGenerate(), disabled: !imageAvailable || imageLoading, "data-testid": "ai-render-generate-btn", style: { flex: 1, ...primaryBtnStyle }, children: imageLoading ? t("llm.generating") : `🖼 ${t("llm.aiRender.generate")}` }), _jsx("button", { onClick: handlePreviewPrompt, title: t("llm.previewPrompt"), style: {
                                    padding: "10px 10px",
                                    borderRadius: 8,
                                    border: "1px solid #ccc",
                                    background: "#fff",
                                    cursor: "pointer",
                                    fontSize: 13,
                                }, children: "\uD83D\uDCAC" })] }), _jsx("button", { onClick: () => void handleGenerateReference(), style: {
                            width: "100%",
                            padding: "7px 12px",
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: 12,
                            marginBottom: 10,
                        }, children: t("llm.aiRender.previewReference") }), referencePreview && (_jsxs("div", { style: { marginBottom: 12 }, children: [_jsx("img", { src: referencePreview, alt: "Reference layout", style: { width: "100%", borderRadius: 6, border: "1px solid #e0e0e0" } }), _jsx("p", { style: { fontSize: 10, color: "#888", margin: "4px 0 0" }, children: t("llm.aiRender.referenceHint") })] })), promptPreview && (_jsxs("details", { open: true, style: { marginBottom: 12 }, children: [_jsx("summary", { style: { fontSize: 12, color: "#888", cursor: "pointer" }, children: t("llm.previewPrompt") }), _jsx("p", { style: {
                                    fontSize: 11,
                                    color: "#666",
                                    background: "#f5f5f5",
                                    padding: 8,
                                    borderRadius: 4,
                                    marginTop: 4,
                                    lineHeight: 1.5,
                                    whiteSpace: "pre-wrap",
                                }, children: promptPreview })] })), imageError && (_jsx("p", { style: { color: "#c62828", fontSize: 13, marginBottom: 12 }, children: imageError })), generatedImage && (_jsxs("div", { children: [_jsx("img", { src: resolveImageSrc(generatedImage), alt: "AI-generated garden render", "data-testid": "ai-render-generated-image", style: {
                                    width: "100%",
                                    borderRadius: 8,
                                    border: "1px solid #e0e0e0",
                                    display: "block",
                                } }), _jsxs("div", { style: { display: "flex", gap: 8, marginTop: 8 }, children: [_jsxs("a", { href: resolveImageSrc(generatedImage), download: `${project.name.replace(/\s+/g, "-")}-ai-render.png`, style: {
                                            flex: 1,
                                            display: "block",
                                            textAlign: "center",
                                            padding: "7px 10px",
                                            borderRadius: 6,
                                            background: "#4caf50",
                                            color: "#fff",
                                            fontWeight: 600,
                                            fontSize: 12,
                                            textDecoration: "none",
                                        }, children: ["\u2B07 ", t("common.save")] }), _jsx("button", { onClick: () => setGeneratedImage(null), style: {
                                            padding: "7px 10px",
                                            borderRadius: 6,
                                            border: "1px solid #ccc",
                                            background: "#fff",
                                            cursor: "pointer",
                                            fontSize: 12,
                                        }, children: "\u2715" })] }), generatedImage.revisedPrompt && (_jsx("p", { style: { fontSize: 11, color: "#888", marginTop: 6, lineHeight: 1.4 }, children: _jsx("em", { children: generatedImage.revisedPrompt }) }))] })), _jsxs("button", { style: { ...primaryBtnStyle, background: "#757575", marginTop: 12 }, onClick: () => setStep("enhancements"), children: ["\u2190 ", t("common.back")] })] }))] }));
}
//# sourceMappingURL=AIRenderPanel.js.map