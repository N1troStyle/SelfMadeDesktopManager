import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  ipcMain.handle('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle('window:toggle-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return

    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  })

  ipcMain.handle('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle('storage:choose-folder', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Choose a folder to explore',
      properties: ['openDirectory']
    })

    if (result.canceled || !result.filePaths[0]) {
      return null
    }

    return result.filePaths[0]
  })

  
ipcMain.handle('storage:list-directory', async (_event, directoryPath: unknown) => {
  if (typeof directoryPath !== 'string' || !path.isAbsolute(directoryPath)) {
    throw new Error('Invalid directory path')
  }

 const getFolderSize = async (folderPath: string): Promise<number> => {
    let totalSize = 0

    try {
      const entries = await readdir(folderPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(folderPath, entry.name)

        try {
          if (entry.isDirectory()) {
            totalSize += await getFolderSize(fullPath)
          } else if (entry.isFile()) {
            const details = await stat(fullPath)
            totalSize += details.size
          }
        } catch {
          // Ignoră elementele pentru care nu există acces.
        }
      }
    } catch {
      // Ignoră folderele care nu pot fi citite.
    }

    return totalSize
  }

  const entries = await readdir(directoryPath, { withFileTypes: true })

  const items = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directoryPath, entry.name)

      try {
        const details = await stat(fullPath)
        const isDirectory = entry.isDirectory()

        const size = isDirectory
          ? await getFolderSize(fullPath)
          : details.size

        return {
          name: entry.name,
          path: fullPath,
          type: isDirectory ? ('directory' as const) : ('file' as const),
          size,
          modifiedAt: details.mtime.toISOString()
        }
      } catch {
        return {
          name: entry.name,
          path: fullPath,
          type: entry.isDirectory() ? ('directory' as const) : ('file' as const),
          size: 0,
          modifiedAt: null
        }
      }
    })
  )

  return items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1
    }

    return a.name.localeCompare(b.name)
  })
})


  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
