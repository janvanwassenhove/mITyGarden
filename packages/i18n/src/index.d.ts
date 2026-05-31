import i18next from "i18next";
import type { i18n } from "i18next";
export type SupportedLocale = "en" | "nl" | "fr";
export declare const SUPPORTED_LOCALES: SupportedLocale[];
export declare const LOCALE_LABELS: Record<SupportedLocale, string>;
export interface I18nConfig {
  locale?: SupportedLocale;
  fallbackLocale?: SupportedLocale;
}
export declare function createI18n(config?: I18nConfig): i18n;
export declare function getSharedI18n(): i18n;
export declare function setSharedI18n(instance: i18n): void;
export { i18next };
export type { i18n };
//# sourceMappingURL=index.d.ts.map
