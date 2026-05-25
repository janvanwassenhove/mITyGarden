import i18next from "i18next";
import type { i18n } from "i18next";

// Import locale files (resolved at build time)
import enCommon from "./locales/en/common.json" with { type: "json" };
import nlCommon from "./locales/nl/common.json" with { type: "json" };
import frCommon from "./locales/fr/common.json" with { type: "json" };

export type SupportedLocale = "en" | "nl" | "fr";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "nl", "fr"];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: "English",
  nl: "Nederlands",
  fr: "Français",
};

export interface I18nConfig {
  locale?: SupportedLocale;
  fallbackLocale?: SupportedLocale;
}

export function createI18n(config: I18nConfig = {}): i18n {
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
let _sharedInstance: i18n | null = null;

export function getSharedI18n(): i18n {
  if (!_sharedInstance) {
    _sharedInstance = createI18n();
  }
  return _sharedInstance;
}

export function setSharedI18n(instance: i18n): void {
  _sharedInstance = instance;
}

// Re-export i18next for convenience
export { i18next };
export type { i18n };
