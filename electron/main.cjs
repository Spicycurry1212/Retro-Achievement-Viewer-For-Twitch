const { app, BrowserWindow, Menu, shell } = require("electron");
const { existsSync, mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { spawn } = require("node:child_process");

let window;
let server;
const port = Number(process.env.RETROUNLOCK_PORT || 3000);

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

function startServer() {
  const dataDir = ensureUserConfig();
  const appRoot = app.getAppPath();
  server = spawn(process.execPath, [join(appRoot, "server.js")], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", RETROUNLOCK_APP_ROOT: appRoot, RETROUNLOCK_DATA_DIR: dataDir, PORT: String(port) },
    stdio: "ignore",
    windowsHide: true,
  });
}

function createWindow() {
  window = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 980,
    minHeight: 720,
    backgroundColor: "#0a0910",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  window.loadURL(`http://127.0.0.1:${port}`);
  window.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
}

app.whenReady().then(() => {
  startServer();
  setTimeout(createWindow, 800);
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: "RetroUnlock", submenu: [
      { label: "Open configuration folder", click: () => shell.openPath(app.getPath("userData")) },
      { role: "quit", label: "Quit RetroUnlock" },
    ] },
  ]));
});

app.on("window-all-closed", () => app.quit());
app.on("before-quit", () => { if (server && !server.killed) server.kill(); });
