'use client'

import { useReducer, useEffect, useRef } from 'react'
import type { TerminalConfig, ThemeName, CursorStyle } from '@/types/terminal'
import { DEFAULT_CONFIG } from '@/data/terminalThemes'

const STORAGE_KEY = 'act-terminal-config'

type Action =
  | { type: 'SET_FONT_SIZE'; payload: number }
  | { type: 'SET_FONT_FAMILY'; payload: string }
  | { type: 'SET_THEME'; payload: ThemeName }
  | { type: 'SET_CURSOR_STYLE'; payload: CursorStyle }
  | { type: 'SET_CURSOR_BLINK'; payload: boolean }
  | { type: 'SET_OPACITY'; payload: number }
  | { type: 'SET_SCROLLBACK'; payload: number }
  | { type: 'RESET' }

function reducer(state: TerminalConfig, action: Action): TerminalConfig {
  switch (action.type) {
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload }
    case 'SET_FONT_FAMILY':
      return { ...state, fontFamily: action.payload }
    case 'SET_THEME':
      return { ...state, themeName: action.payload }
    case 'SET_CURSOR_STYLE':
      return { ...state, cursorStyle: action.payload }
    case 'SET_CURSOR_BLINK':
      return { ...state, cursorBlink: action.payload }
    case 'SET_OPACITY':
      return { ...state, opacity: action.payload }
    case 'SET_SCROLLBACK':
      return { ...state, scrollback: action.payload }
    case 'RESET':
      return { ...DEFAULT_CONFIG }
    default:
      return state
  }
}

function loadConfig(): TerminalConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONFIG
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function useTerminalConfig() {
  const [config, dispatch] = useReducer(reducer, DEFAULT_CONFIG, loadConfig)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      // ignore storage errors
    }
  }, [config])

  return { config, dispatch }
}
