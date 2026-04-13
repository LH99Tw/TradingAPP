import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { ensureRuntimeDataDir } from '../../service/runtime-data'

const createWindow = (): void => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 760,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: true
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  const rendererUrl = process.env.ELECTRON_RENDERER_URL
  if (rendererUrl) {
    win.loadURL(rendererUrl)
    return
  }

  win.loadFile(join(__dirname, '../renderer/index.html'))
}

app.whenReady().then(() => {
  const dataDir = ensureRuntimeDataDir(app.getAppPath())
  process.env.TRADINGAPP_DATA_DIR = dataDir

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
