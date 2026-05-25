// ─── Storage keys ─────────────────────────────────────────────────────────────

const LS_OPENAI = "mitygarden_openai_key";
const LS_ANTHROPIC = "mitygarden_anthropic_key";
const LS_GEMINI = "mitygarden_gemini_key";

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ApiKeys {
  openai: string;
  anthropic: string;
  gemini: string;
}

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

function setOrRemove(key: string, value: string): void {
  const trimmed = value.trim();
  if (trimmed.length > 0) {
    localStorage.setItem(key, trimmed);
  } else {
    localStorage.removeItem(key);
  }
}
