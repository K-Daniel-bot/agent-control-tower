// useElectronAPI — React hook for Electron IPC communication
// Falls back to mock implementations when running in browser

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Types ───────────────────────────────────────────────────────────
interface ElectronMouseAPI {
  readonly move: (x: number, y: number) => Promise<void>
  readonly click: (x: number, y: number, button?: 'left' | 'right' | 'middle') => Promise<void>
  readonly doubleClick: (x: number, y: number) => Promise<void>
}

interface ElectronKeyboardAPI {
  readonly type: (text: string) => Promise<void>
  readonly press: (key: string, modifiers?: string[]) => Promise<void>
}

interface ElectronScreenAPI {
  readonly capture: () => Promise<string>
  readonly captureRegion: (x: number, y: number, w: number, h: number) => Promise<string>
}

interface ElectronSystemAPI {
  readonly metrics: () => Promise<SystemMetrics>
  readonly processList: () => Promise<ProcessInfo[]>
}

interface ElectronShellAPI {
  readonly exec: (command: string) => Promise<ShellResult>
}

export interface SystemMetrics {
  readonly cpu: number
  readonly memory: { readonly total: number; readonly used: number; readonly percent: number }
  readonly uptime: number
  readonly platform: string
  readonly arch: string
}

export interface ProcessInfo {
  readonly pid: number
  readonly name: string
  readonly cpu: number
  readonly memory: number
}

export interface ShellResult {
  readonly success: boolean
  readonly stdout: string
  readonly stderr: string
  readonly error: string | null
}

export interface ElectronAPI {
  readonly isElectron: boolean
  readonly platform: string
  readonly mouse: ElectronMouseAPI
  readonly keyboard: ElectronKeyboardAPI
  readonly screen: ElectronScreenAPI
  readonly system: ElectronSystemAPI
  readonly shell: ElectronShellAPI
}

// ─── Window type augmentation ────────────────────────────────────────
declare global {
  interface Window {
    electronAPI?: {
      mouse: {
        move: (x: number, y: number) => Promise<void>
        click: (x: number, y: number, button?: string) => Promise<void>
        doubleClick: (x: number, y: number) => Promise<void>
      }
      keyboard: {
        type: (text: string) => Promise<void>
        press: (key: string, modifiers?: string[]) => Promise<void>
      }
      screen: {
        capture: () => Promise<string>
        captureRegion: (x: number, y: number, w: number, h: number) => Promise<string>
      }
      system: {
        metrics: () => Promise<SystemMetrics>
        processList: () => Promise<ProcessInfo[]>
      }
      shell: {
        exec: (command: string) => Promise<ShellResult>
      }
      isElectron: () => Promise<boolean>
      platform: () => Promise<string>
    }
  }
}

// ─── Mock Implementations ────────────────────────────────────────────
const rand = (min: number, max: number) => min + Math.random() * (max - min)

const mockMouse: ElectronMouseAPI = {
  move: async (x, y) => {
    console.log(`[Mock] Mouse move: (${x}, ${y})`)
  },
  click: async (x, y, button) => {
    console.log(`[Mock] Mouse ${button ?? 'left'} click: (${x}, ${y})`)
  },
  doubleClick: async (x, y) => {
    console.log(`[Mock] Mouse double click: (${x}, ${y})`)
  },
}

const mockKeyboard: ElectronKeyboardAPI = {
  type: async (text) => {
    console.log(`[Mock] Keyboard type: "${text}"`)
  },
  press: async (key, modifiers) => {
    console.log(`[Mock] Keyboard press: ${modifiers?.join('+') ?? ''}${key}`)
  },
}

const mockScreen: ElectronScreenAPI = {
  capture: async () => {
    console.log('[Mock] Screen capture')
    // Return a 1x1 transparent pixel
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg=='
  },
  captureRegion: async (x, y, w, h) => {
    console.log(`[Mock] Screen capture region: (${x}, ${y}, ${w}, ${h})`)
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg=='
  },
}

const mockSystem: ElectronSystemAPI = {
  metrics: async () => ({
    cpu: Math.round(rand(10, 80)),
    memory: {
      total: 17179869184,
      used: Math.round(rand(4000000000, 14000000000)),
      percent: Math.round(rand(30, 85)),
    },
    uptime: Math.round(rand(3600, 86400 * 7)),
    platform: 'browser',
    arch: 'wasm',
  }),
  processList: async () => {
    const names = ['chrome', 'node', 'next-server', 'terminal-server', 'vscode', 'finder', 'agent-core']
    return names.map((name, i) => ({
      pid: 1000 + i * 100 + Math.floor(rand(0, 99)),
      name,
      cpu: Math.round(rand(0, 30) * 10) / 10,
      memory: Math.round(rand(0, 10) * 10) / 10,
    }))
  },
}

const mockShell: ElectronShellAPI = {
  exec: async (command) => {
    console.log(`[Mock] Shell exec: ${command}`)
    return {
      success: true,
      stdout: `[Mock] Command "${command}" executed successfully`,
      stderr: '',
      error: null,
    }
  },
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useElectronAPI(): ElectronAPI {
  const [isElectron, setIsElectron] = useState(false)
  const [platform, setPlatform] = useState('browser')
  const apiRef = useRef<ElectronAPI | null>(null)

  useEffect(() => {
    async function detect() {
      if (typeof window !== 'undefined' && window.electronAPI) {
        try {
          const result = await window.electronAPI.isElectron()
          if (result) {
            setIsElectron(true)
            const p = await window.electronAPI.platform()
            setPlatform(p)
          }
        } catch {
          // Not in Electron
        }
      }
    }
    void detect()
  }, [])

  // Build the API object
  if (!apiRef.current || apiRef.current.isElectron !== isElectron) {
    if (isElectron && typeof window !== 'undefined' && window.electronAPI) {
      const eApi = window.electronAPI
      apiRef.current = {
        isElectron: true,
        platform,
        mouse: eApi.mouse,
        keyboard: eApi.keyboard,
        screen: eApi.screen,
        system: eApi.system,
        shell: eApi.shell,
      }
    } else {
      apiRef.current = {
        isElectron: false,
        platform: 'browser',
        mouse: mockMouse,
        keyboard: mockKeyboard,
        screen: mockScreen,
        system: mockSystem,
        shell: mockShell,
      }
    }
  }

  return apiRef.current
}

// ─── Screen Capture Loop Hook ────────────────────────────────────────
export function useScreenCapture(intervalMs: number = 1000) {
  const api = useElectronAPI()
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const startCapture = useCallback(() => {
    setIsCapturing(true)
  }, [])

  const stopCapture = useCallback(() => {
    setIsCapturing(false)
  }, [])

  useEffect(() => {
    if (!isCapturing) return

    let mounted = true
    const tick = async () => {
      if (!mounted) return
      try {
        const img = await api.screen.capture()
        if (mounted) setScreenshot(img)
      } catch (err) {
        console.error('[ScreenCapture] Error:', err)
      }
    }

    void tick()
    const id = setInterval(() => { void tick() }, intervalMs)

    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [isCapturing, intervalMs, api])

  return { screenshot, isCapturing, startCapture, stopCapture }
}
