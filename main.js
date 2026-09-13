// Optional: wraps the built web app (the /dist folder) in a native
// desktop window using Electron. See README.md "Desktop app" section
// for setup — most people won't need this, since the PWA already
// installs as a desktop app from Chrome/Edge with zero extra tooling.

import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 860,
    minWidth: 360,
    title: "Ember & Co",
    icon: path.join(__dirname, "../public/icons/icon-512.png"),
    webPreferences: {
      contextIsolation: true,
    },
  });
  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
