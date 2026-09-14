const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

let serverProcess;
const PORT = 3000;

function waitForServer(url, timeoutMs = 20000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, res => { res.resume(); resolve(); });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) reject(new Error('METASURE server did not start in time.'));
        else setTimeout(check, 250);
      });
      req.setTimeout(1000, () => req.destroy());
    };
    check();
  });
}

function startBackend() {
  const serverPath = path.join(process.resourcesPath, 'app.asar', 'dist', 'server.cjs');
  const fallback = path.join(__dirname, '..', 'dist', 'server.cjs');
  const executable = require('fs').existsSync(serverPath) ? serverPath : fallback;
  serverProcess = spawn(process.execPath, [executable], {
    env: { ...process.env, NODE_ENV: 'production', ELECTRON_RUN_AS_NODE: '1', METASURE_DESKTOP: '1' },
    cwd: path.dirname(executable),
    stdio: 'inherit',
    windowsHide: true,
  });
  serverProcess.on('exit', code => {
    if (!app.isQuitting && code !== 0) console.error(`METASURE backend exited with code ${code}`);
  });
}

async function createWindow() {
  startBackend();
  try { await waitForServer(`http://127.0.0.1:${PORT}/api/health`); }
  catch (err) {
    await dialog.showMessageBox({ type: 'error', title: 'METASURE startup error', message: err.message });
    app.quit(); return;
  }

  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    title: 'METASURE — NAWI Test & Compliance System',
    backgroundColor: '#f6f7f7',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  await win.loadURL(`http://127.0.0.1:${PORT}`);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => { app.isQuitting = true; if (serverProcess) serverProcess.kill(); });
