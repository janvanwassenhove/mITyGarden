import i18next from "i18next";
// Import locale files (resolved at build time)
import enCommon from "./locales/en/common.json" with { type: "json" };
import nlCommon from "./locales/nl/common.json" with { type: "json" };
import frCommon from "./locales/fr/common.json" with { type: "json" };
export const SUPPORTED_LOCALES = ["en", "nl", "fr"];
export const LOCALE_LABELS = {
    en: "English",
    nl: "Nederlands",
    fr: "Français",
};
export function createI18n(config = {}) {
    const instance = i18next.createInstance();
    void instance.init({
        lng: config.locale ?? "en",
        fallbackLng: config.fallbackLocale ?? "en",
        ns: ["common"],
        defaultNS: "common",
        resources: {
            en: { common: enCommon },
            nl: { common: nlCommon },
            fr: { common: frCommon },
        },
        interpolation: {
            escapeValue: false, // React already escapes
        },
    });
    return instance;
}
// Singleton instance for use in shared packages
let _sharedInstance = null;
export function getSharedI18n() {
    if (!_sharedInstance) {
        _sharedInstance = createI18n();
    }
    return _sharedInstance;
}
export function setSharedI18n(instance) {
    _sharedInstance = instance;
}
// Re-export i18next for convenience
export { i18next };
//# sourceMappingURL=index.js.map