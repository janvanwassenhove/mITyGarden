import { contextBridge, ipcRenderer } from "electron";

// Expose a safe, minimal API to the renderer — no Node.js APIs directly
contextBridge.exposeInMainWorld("mityGardenDesktop", {
  // LLM — completions run in main process so API keys stay in Node.js context
  llm: {
    getConfig: () =>
      ipcRenderer.invoke("llm:get-config") as Promise<{
        provider: string;
        configured: boolean;
        hasOpenAI: boolean;
        hasAnthropic: boolean;
      }>,
    complete: (messages: Array<{ role: string; content: string }>) =>
      ipcRenderer.invoke("llm:complete", messages) as Promise<{ content: string }>,
  },

  // SQLite project persistence via IPC (main process handles the DB)
  db: {
    listProjects: () =>
      ipcRenderer.invoke("db:list-projects") as Promise<
        Array<{ id: string; name: string; createdAt: string; updatedAt: string }>
      >,
    getProject: (id: string) => ipcRenderer.invoke("db:get-project", id) as Promise<unknown | null>,
    saveProject: (project: unknown) =>
      ipcRenderer.invoke("db:save-project", project) as Promise<boolean>,
    deleteProject: (id: string) => ipcRenderer.invoke("db:delete-project", id) as Promise<boolean>,
    exportJSON: (id: string) => ipcRenderer.invoke("db:export-json", id) as Promise<string | null>,
    importJSON: (json: string) =>
      ipcRenderer.invoke("db:import-json", json) as Promise<unknown | null>,
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
        getConfig: () => Promise<{
          provider: string;
          configured: boolean;
          hasOpenAI: boolean;
          hasAnthropic: boolean;
        }>;
        complete: (
          messages: Array<{ role: string; content: string }>
        ) => Promise<{ content: string }>;
      };
      db: {
        listProjects: () => Promise<
          Array<{ id: string; name: string; createdAt: string; updatedAt: string }>
        >;
        getProject: (id: string) => Promise<unknown | null>;
        saveProject: (project: unknown) => Promise<boolean>;
        deleteProject: (id: string) => Promise<boolean>;
        exportJSON: (id: string) => Promise<string | null>;
        importJSON: (json: string) => Promise<unknown | null>;
      };
      onMenuEvent: (event: string, callback: () => void) => () => void;
      platform: string;
      isDesktop: true;
    };
  }
}
