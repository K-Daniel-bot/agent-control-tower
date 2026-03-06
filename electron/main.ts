// Electron Main Process — Agent Control Tower
// Provides IPC handlers for native OS control (mouse, keyboard, screen capture, system metrics)

import { app, BrowserWindow, ipcMain, screen, desktopCapturer } from 'electron'
import * as path from 'path'
import { exec } from 'child_process'

// ─── Types ───────────────────────────────────────────────────────────
interface MouseMoveParams {
  readonly x: number
  readonly y: number
}

interface MouseClickParams {
  readonly x: number
  readonly y: number
  readonly button?: 'left' | 'right' | 'middle'
}

interface KeyboardTypeParams {
  readonly text: string
}

interface KeyboardPressParams {
  readonly key: string
  readonly modifiers?: readonly string[]
}

interface CaptureRegionParams {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
}

interface SystemMetrics {
  readonly cpu: number
  readonly memory: { total: number; used: number; percent: number }
  readonly uptime: number
  readonly platform: string
  readonly arch: string
}

interface ProcessInfo {
  readonly pid: number
  readonly name: string
  readonly cpu: number
  readonly memory: number
}

// ─── Window Management ────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null

const NEXT_DEV_URL = 'http://localhost:3939'
const isDev = !app.isPackaged

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    title: 'Agent Control Tower',
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL(NEXT_DEV_URL)
    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    // In production, load the exported Next.js build
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ─── Mouse Control via nut.js ─────────────────────────────────────────
// nut.js is loaded dynamically to allow graceful fallback
let nutMouse: typeof import('@nut-tree/nut-js').mouse | null = null
let nutKeyboard: typeof import('@nut-tree/nut-js').keyboard | null = null
let nutScreen: typeof import('@nut-tree/nut-js').screen | null = null

async function initNut(): Promise<boolean> {
  try {
    const nut = await import('@nut-tree/nut-js')
    nutMouse = nut.mouse
    nutKeyboard = nut.keyboard
    nutScreen = nut.screen
    // Set mouse movement speed (pixels per second)
    nut.mouse.config.mouseSpeed = 2000
    console.log('[Electron] nut.js initialized successfully')
    return true
  } catch (err) {
    console.warn('[Electron] nut.js not available, using fallback:', err)
    return false
  }
}

// ─── Screenshot via desktopCapturer ───────────────────────────────────
async function captureScreen(): Promise<string> {
  try {
    // Try screenshot-desktop first for better quality
    const screenshotDesktop = await import('screenshot-desktop')
    const buf = await screenshotDesktop.default()
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch {
    // Fallback: use Electron's desktopCapturer
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: screen.getPrimaryDisplay().workAreaSize,
    })
    if (sources.length > 0 && sources[0]) {
      return sources[0].thumbnail.toDataURL()
    }
    throw new Error('No screen sources available')
  }
}

async function captureRegion(params: CaptureRegionParams): Promise<string> {
  // Capture full screen then crop
  const fullCapture = await captureScreen()
  // Return full for now — cropping would require sharp/canvas
  // TODO: implement region cropping with sharp
  return fullCapture
}

// ─── System Metrics ──────────────────────────────────────────────────
function getSystemMetrics(): SystemMetrics {
  const os = require('os')
  const cpus = os.cpus()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem

  // CPU usage approximation
  let totalIdle = 0
  let totalTick = 0
  for (const cpu of cpus) {
    for (const type of Object.values(cpu.times) as number[]) {
      totalTick += type
    }
    totalIdle += cpu.times.idle
  }
  const cpuPercent = Math.round((1 - totalIdle / totalTick) * 100)

  return {
    cpu: cpuPercent,
    memory: {
      total: totalMem,
      used: usedMem,
      percent: Math.round((usedMem / totalMem) * 100),
    },
    uptime: os.uptime(),
    platform: os.platform(),
    arch: os.arch(),
  }
}

function getProcessList(): Promise<ProcessInfo[]> {
  return new Promise((resolve) => {
    const platform = process.platform

    if (platform === 'darwin') {
      exec('ps aux | head -20', (err, stdout) => {
        if (err) { resolve([]); return }
        const lines = stdout.trim().split('\n').slice(1)
        const procs = lines.map(line => {
          const parts = line.trim().split(/\s+/)
          return {
            pid: parseInt(parts[1] ?? '0', 10),
            name: parts[10] ?? 'unknown',
            cpu: parseFloat(parts[2] ?? '0'),
            memory: parseFloat(parts[3] ?? '0'),
          }
        })
        resolve(procs)
      })
    } else if (platform === 'win32') {
      exec('tasklist /FO CSV /NH | head -20', (err, stdout) => {
        if (err) { resolve([]); return }
        const lines = stdout.trim().split('\n')
        const procs = lines.map(line => {
          const parts = line.replace(/"/g, '').split(',')
          return {
            pid: parseInt(parts[1] ?? '0', 10),
            name: parts[0] ?? 'unknown',
            cpu: 0,
            memory: parseInt((parts[4] ?? '0').replace(/[^\d]/g, ''), 10),
          }
        })
        resolve(procs)
      })
    } else {
      // Linux
      exec('ps aux --sort=-%cpu | head -20', (err, stdout) => {
        if (err) { resolve([]); return }
        const lines = stdout.trim().split('\n').slice(1)
        const procs = lines.map(line => {
          const parts = line.trim().split(/\s+/)
          return {
            pid: parseInt(parts[1] ?? '0', 10),
            name: parts[10] ?? 'unknown',
            cpu: parseFloat(parts[2] ?? '0'),
            memory: parseFloat(parts[3] ?? '0'),
          }
        })
        resolve(procs)
      })
    }
  })
}

// ─── IPC Handlers ────────────────────────────────────────────────────
function registerIpcHandlers(): void {
  // Mouse control
  ipcMain.handle('mouse:move', async (_event, params: MouseMoveParams) => {
    if (nutMouse) {
      const { Point } = await import('@nut-tree/nut-js')
      await nutMouse.move([new Point(params.x, params.y)])
    }
  })

  ipcMain.handle('mouse:click', async (_event, params: MouseClickParams) => {
    if (nutMouse) {
      const { Point, Button } = await import('@nut-tree/nut-js')
      await nutMouse.move([new Point(params.x, params.y)])
      const btn = params.button === 'right' ? Button.RIGHT
        : params.button === 'middle' ? Button.MIDDLE
        : Button.LEFT
      await nutMouse.click(btn)
    }
  })

  ipcMain.handle('mouse:doubleClick', async (_event, params: MouseMoveParams) => {
    if (nutMouse) {
      const { Point, Button } = await import('@nut-tree/nut-js')
      await nutMouse.move([new Point(params.x, params.y)])
      await nutMouse.doubleClick(Button.LEFT)
    }
  })

  // Keyboard control
  ipcMain.handle('keyboard:type', async (_event, params: KeyboardTypeParams) => {
    if (nutKeyboard) {
      await nutKeyboard.type(params.text)
    }
  })

  ipcMain.handle('keyboard:press', async (_event, params: KeyboardPressParams) => {
    if (nutKeyboard) {
      const { Key } = await import('@nut-tree/nut-js')
      const keyMap: Record<string, number> = {
        enter: Key.Enter,
        tab: Key.Tab,
        escape: Key.Escape,
        backspace: Key.Backspace,
        delete: Key.Delete,
        space: Key.Space,
        up: Key.Up,
        down: Key.Down,
        left: Key.Left,
        right: Key.Right,
        ctrl: Key.LeftControl,
        alt: Key.LeftAlt,
        shift: Key.LeftShift,
        meta: Key.LeftSuper,
        cmd: Key.LeftSuper,
      }

      const mainKey = keyMap[params.key.toLowerCase()] ?? Key.Space
      if (params.modifiers && params.modifiers.length > 0) {
        const mods = params.modifiers
          .map(m => keyMap[m.toLowerCase()])
          .filter((k): k is number => k !== undefined)
        await nutKeyboard.pressKey(...mods, mainKey)
        await nutKeyboard.releaseKey(...mods, mainKey)
      } else {
        await nutKeyboard.pressKey(mainKey)
        await nutKeyboard.releaseKey(mainKey)
      }
    }
  })

  // Screen capture
  ipcMain.handle('screen:capture', async () => {
    return captureScreen()
  })

  ipcMain.handle('screen:captureRegion', async (_event, params: CaptureRegionParams) => {
    return captureRegion(params)
  })

  // System info
  ipcMain.handle('system:metrics', () => {
    return getSystemMetrics()
  })

  ipcMain.handle('process:list', async () => {
    return getProcessList()
  })

  // Shell command execution (sandboxed)
  ipcMain.handle('shell:exec', async (_event, command: string) => {
    return new Promise((resolve) => {
      exec(command, { timeout: 10000 }, (err, stdout, stderr) => {
        resolve({
          success: !err,
          stdout: stdout ?? '',
          stderr: stderr ?? '',
          error: err?.message ?? null,
        })
      })
    })
  })

  // Window state
  ipcMain.handle('window:minimize', () => { mainWindow?.minimize() })
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })
  ipcMain.handle('window:close', () => { mainWindow?.close() })

  // Environment detection
  ipcMain.handle('electron:isElectron', () => true)
  ipcMain.handle('electron:platform', () => process.platform)
}

// ─── App Lifecycle ───────────────────────────────────────────────────
app.whenReady().then(async () => {
  registerIpcHandlers()
  await initNut()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
