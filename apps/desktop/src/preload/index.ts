import { contextBridge, ipcRenderer } from "electron";

// Expose a safe, minimal API to the renderer — no Node.js APIs directly
contextBridge.exposeInMainWorld("mityGardenDesktop", {
  // LLM — completions run in main process so API keys stay in Node.js context
  llm: {
    getConfig: () => ipcRenderer.invoke("llm:get-config") as Promise<{
      provider: string;
      configured: boolean;
      hasOpenAI: boolean;
      hasAnthropic: boolean;
    }>,
    complete: (messages: Array<{ role: string; content: string }>) =>
      ipcRenderer.invoke("llm:complete", messages) as Promise<{ content: string }>,
  },

  // Menu events from main process
  onMenuEvent: (event: string, callback: () => void) => {
    ipcRenderer.on(`menu:${event}`, callback);
    return () => ipcRenderer.removeListener(`menu:${event}`, callback);
  },

  // Platform info
  platform: process.platform,
  isDesktop: true as const,
});

// Type declarations for renderer
declare global {
  interface Window {
    mityGardenDesktop?: {
      llm: {
        getConfig: () => Promise<{ provider: string; configured: boolean; hasOpenAI: boolean; hasAnthropic: boolean }>;
        complete: (messages: Array<{ role: string; content: string }>) => Promise<{ content: string }>;
      };
      onMenuEvent: (event: string, callback: () => void) => () => void;
      platform: string;
      isDesktop: true;
    };
  }
}
