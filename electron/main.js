const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "AI Novel Studio",
    icon: path.join(__dirname, "../public/favicon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 去掉菜单栏（可选）
  win.setMenuBarVisibility(false);

  if (isDev) {
    // 开发模式：加载 Next.js dev server
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    // 生产模式：先启动 Next.js 再加载
    const { exec } = require("child_process");
    const server = exec("npx next start -p 3000", { cwd: path.join(__dirname, "..") });
    server.stdout.on("data", (d) => {
      if (d.includes("ready") || d.includes("localhost")) {
        win.loadURL("http://localhost:3000");
      }
    });
    // 兜底：1.5 秒后加载
    setTimeout(() => {
      if (!win.webContents.getURL().startsWith("http")) {
        win.loadURL("http://localhost:3000");
      }
    }, 1500);
  }

  // 外部链接用浏览器打开
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
