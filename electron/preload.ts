// Electron Preload Script — Agent Control Tower
// Exposes safe IPC API to renderer process via contextBridge

import { contextBridge, ipcRenderer } from 'electron'

// Define the API shape exposed to renderer
const electronAPI = {
  // ─── Mouse ──────────────────────────────────────────────────
  mouse: {
    move: (x: number, y: number) =>
      ipcRenderer.invoke('mouse:move', { x, y }),
    click: (x: number, y: number, button?: 'left' | 'right' | 'middle') =>
      ipcRenderer.invoke('mouse:click', { x, y, button }),
    doubleClick: (x: number, y: number) =>
      ipcRenderer.invoke('mouse:doubleClick', { x, y }),
  },

  // ─── Keyboard ───────────────────────────────────────────────
  keyboard: {
    type: (text: string) =>
      ipcRenderer.invoke('keyboard:type', { text }),
    press: (key: string, modifiers?: string[]) =>
      ipcRenderer.invoke('keyboard:press', { key, modifiers }),
  },

  // ─── Screen ─────────────────────────────────────────────────
  screen: {
    capture: () =>
      ipcRenderer.invoke('screen:capture') as Promise<string>,
    captureRegion: (x: number, y: number, w: number, h: number) =>
      ipcRenderer.invoke('screen:captureRegion', { x, y, w, h }) as Promise<string>,
  },

  // ─── System ─────────────────────────────────────────────────
  system: {
    metrics: () =>
      ipcRenderer.invoke('system:metrics'),
    processList: () =>
      ipcRenderer.invoke('process:list'),
  },

  // ─── Shell ──────────────────────────────────────────────────
  shell: {
    exec: (command: string) =>
      ipcRenderer.invoke('shell:exec', command) as Promise<{
        success: boolean
        stdout: string
        stderr: string
        error: string | null
      }>,
  },

  // ─── Window ─────────────────────────────────────────────────
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },

  // ─── Environment ────────────────────────────────────────────
  isElectron: () => ipcRenderer.invoke('electron:isElectron') as Promise<boolean>,
  platform: () => ipcRenderer.invoke('electron:platform') as Promise<string>,
}

// Expose to renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type declaration for renderer usage
export type ElectronAPI = typeof electronAPI
