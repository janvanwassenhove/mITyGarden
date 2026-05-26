// ─── Storage keys ─────────────────────────────────────────────────────────────

const LS_OPENAI = "mitygarden_openai_key";
const LS_ANTHROPIC = "mitygarden_anthropic_key";
const LS_GEMINI = "mitygarden_gemini_key";
const LS_GOOGLE_MAPS = "mitygarden_google_maps_key";

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ApiKeys {
  openai: string;
  anthropic: string;
  gemini: string;
}

/** Keys stored by the user in localStorage. */
export function getApiKeys(): ApiKeys {
  return {
    openai: localStorage.getItem(LS_OPENAI) ?? "",
    anthropic: localStorage.getItem(LS_ANTHROPIC) ?? "",
    gemini: localStorage.getItem(LS_GEMINI) ?? "",
  };
}

export function saveApiKeys(keys: ApiKeys): void {
  setOrRemove(LS_OPENAI, keys.openai);
  setOrRemove(LS_ANTHROPIC, keys.anthropic);
  setOrRemove(LS_GEMINI, keys.gemini);
}

// ─── Google Maps key ──────────────────────────────────────────────────────────

/**
 * Returns the effective Google Maps API key.
 * Priority: env variable (build-time) → localStorage (user-entered).
 */
export function getGoogleMapsApiKey(): string {
  const envKey = import.meta.env.GOOGLE_MAPS_API_KEY;
  if (envKey && envKey.length > 0) return envKey;
  return localStorage.getItem(LS_GOOGLE_MAPS) ?? "";
}

export function saveGoogleMapsApiKey(key: string): void {
  setOrRemove(LS_GOOGLE_MAPS, key);
}

/**
 * Keys set as environment variables at build time.
 * Only the keys that are actually set are included in the returned object.
 */
export function getEnvApiKeys(): Partial<ApiKeys> {
  const result: Partial<ApiKeys> = {};
  const openai = import.meta.env.OPENAI_API_KEY;
  if (openai && openai.length > 0) result.openai = openai;
  const anthropic = import.meta.env.ANTHROPIC_API_KEY;
  if (anthropic && anthropic.length > 0) result.anthropic = anthropic;
  const gemini = import.meta.env.GEMINI_API_KEY;
  if (gemini && gemini.length > 0) result.gemini = gemini;
  return result;
}

/**
 * Resolved keys for runtime use.
 * Priority: environment variable → localStorage → empty string.
 */
export function getEffectiveApiKeys(): ApiKeys {
  const env = getEnvApiKeys();
  const local = getApiKeys();
  return {
    openai: env.openai ?? local.openai,
    anthropic: env.anthropic ?? local.anthropic,
    gemini: env.gemini ?? local.gemini,
  };
}

function setOrRemove(key: string, value: string): void {
  const trimmed = value.trim();
  if (trimmed.length > 0) {
    localStorage.setItem(key, trimmed);
  } else {
    localStorage.removeItem(key);
  }
}
