import { app, BrowserWindow, ipcMain, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import {
  listProjectsSQLite,
  getProjectSQLite,
  saveProjectSQLite,
  deleteProjectSQLite,
  exportProjectJSON,
  importProjectJSON,
  closeDb,
} from "./db.js";
import type { GardenProject } from "@mity-garden/domain";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env["NODE_ENV"] === "development";

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "mITyGarden",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    void win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    void win.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  buildMenu(win);
}

function buildMenu(win: BrowserWindow): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        { label: "New Garden...", accelerator: "CmdOrCtrl+N", click: () => win.webContents.send("menu:new-project") },
        { label: "Open Project...", accelerator: "CmdOrCtrl+O", click: () => win.webContents.send("menu:open-project") },
        { type: "separator" },
        { label: "Save", accelerator: "CmdOrCtrl+S", click: () => win.webContents.send("menu:save") },
        { label: "Export...", accelerator: "CmdOrCtrl+E", click: () => win.webContents.send("menu:export") },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", click: () => win.webContents.send("menu:undo") },
        { label: "Redo", accelerator: "CmdOrCtrl+Shift+Z", click: () => win.webContents.send("menu:redo") },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    { role: "help" },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// IPC handlers — LLM API key comes from environment variables only
ipcMain.handle("llm:get-config", () => {
  const openaiKey = process.env["MITY_GARDEN_OPENAI_API_KEY"] ?? "";
  const anthropicKey = process.env["MITY_GARDEN_ANTHROPIC_API_KEY"] ?? "";
  const provider = process.env["MITY_GARDEN_LLM_PROVIDER"] ?? "openai";
  return {
    provider,
    configured: openaiKey.length > 0 || anthropicKey.length > 0,
    // Keys are never sent to renderer — only the provider metadata
    hasOpenAI: openaiKey.length > 0,
    hasAnthropic: anthropicKey.length > 0,
  };
});

// LLM completions run in main process so API keys never leave the Node.js context
ipcMain.handle("llm:complete", async (_event, messages: Array<{ role: string; content: string }>) => {
  const openaiKey = process.env["MITY_GARDEN_OPENAI_API_KEY"];
  const anthropicKey = process.env["MITY_GARDEN_ANTHROPIC_API_KEY"];
  const provider = process.env["MITY_GARDEN_LLM_PROVIDER"] ?? "openai";

  if (provider === "anthropic" && anthropicKey) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env["MITY_GARDEN_LLM_MODEL"] ?? "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: messages.filter((m) => m.role !== "system"),
        system: messages.find((m) => m.role === "system")?.content ?? "",
      }),
    });
    const data = (await res.json()) as { content: Array<{ text: string }> };
    return { content: data.content[0]?.text ?? "" };
  }

  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: process.env["MITY_GARDEN_LLM_MODEL"] ?? "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" },
        max_tokens: 1024,
      }),
    });
    const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
    return { content: data.choices[0]?.message.content ?? "" };
  }

  throw new Error("No LLM provider configured");
});

// ─── SQLite DB IPC handlers ───────────────────────────────────────────────────

ipcMain.handle("db:list-projects", () => listProjectsSQLite());

ipcMain.handle("db:get-project", (_event, id: string) => getProjectSQLite(id));

ipcMain.handle("db:save-project", (_event, project: GardenProject) => {
  saveProjectSQLite(project);
  return true;
});

ipcMain.handle("db:delete-project", (_event, id: string) => {
  deleteProjectSQLite(id);
  return true;
});

ipcMain.handle("db:export-json", (_event, id: string) => exportProjectJSON(id));

ipcMain.handle("db:import-json", (_event, json: string) => importProjectJSON(json));

// ─── App lifecycle ────────────────────────────────────────────────────────────

void app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  closeDb();
  if (process.platform !== "darwin") app.quit();
});
