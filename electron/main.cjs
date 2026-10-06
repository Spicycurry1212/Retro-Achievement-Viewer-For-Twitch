const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const { existsSync, mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { pathToFileURL } = require("node:url");

let window;
const port = Number(process.env.RETROUNLOCK_PORT || 17382);

function ensureUserConfig() {
  const dataDir = app.getPath("userData");
  mkdirSync(dataDir, { recursive: true });
  const envPath = join(dataDir, ".env");
  if (!existsSync(envPath)) {
    writeFileSync(envPath, [
      "# This file stays on this Windows account. Never share it.",
      "RETROACHIEVEMENTS_API_KEY=",
      "RETROACHIEVEMENTS_USERNAME=",
      "POLL_INTERVAL_MS=10000",
      `PORT=${port}`,
      "",
    ].join("\n"), "utf8");
  }
  return dataDir;
}

async function startServer() {
  const dataDir = ensureUserConfig();
  const appRoot = app.getAppPath();
  // Loading the server inside Electron's main process is reliable in packaged
  // Windows builds. Spawning the packaged Electron binary with
  // ELECTRON_RUN_AS_NODE can silently fail, leaving the UI without its API.
  process.env.RETROUNLOCK_APP_ROOT = appRoot;
  process.env.RETROUNLOCK_DATA_DIR = dataDir;
  process.env.PORT = String(port);
  await import(pathToFileURL(join(appRoot, "server.js")).href);
}

function createWindow() {
  window = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 980,
    minHeight: 720,
    backgroundColor: "#0a0910",
    autoHideMenuBar: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  window.loadURL(`http://127.0.0.1:${port}`);
  window.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
}

function setLanguage(language) {
  if (!window || window.isDestroyed()) return;
  window.webContents.executeJavaScript(`localStorage.setItem("retrounlock-language", "${language}"); location.reload();`);
}

app.whenReady().then(async () => {
  try {
    await startServer();
  } catch (error) {
    dialog.showErrorBox("RetroUnlock could not start", `The local server failed to start.\n\n${error.message}`);
    app.quit();
    return;
  }
  createWindow();
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: "RetroUnlock", submenu: [
      { label: "Open configuration folder / Ouvrir le dossier de configuration", click: () => shell.openPath(app.getPath("userData")) },
      { label: "Language / Langue", submenu: [
        { label: "English", click: () => setLanguage("en") },
        { label: "Français", click: () => setLanguage("fr") },
      ] },
      { role: "quit", label: "Quit RetroUnlock / Quitter RetroUnlock" },
    ] },
  ]));
});

app.on("window-all-closed", () => app.quit());
