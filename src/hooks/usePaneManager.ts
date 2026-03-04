import { useReducer, useEffect } from 'react'
import type { PaneId, SplitDirection, PaneManagerState } from '@/types/terminal'
import {
  createInitialPane,
  splitLeaf,
  removeLeaf,
  collectLeafIds,
  countLeaves,
  getNewPaneIdFromSplit,
} from '@/utils/splitTreeUtils'

const MAX_PANES = 6
const STORAGE_KEY = 'act-pane-layout'

type PaneAction =
  | { readonly type: 'SPLIT_PANE'; readonly paneId: PaneId; readonly direction: SplitDirection }
  | { readonly type: 'CLOSE_PANE'; readonly paneId: PaneId }
  | { readonly type: 'SET_ACTIVE_PANE'; readonly paneId: PaneId }
  | { readonly type: 'RESET_ALL' }

function freshState(): PaneManagerState {
  const pane = createInitialPane()
  return { root: pane, activePaneId: pane.id }
}

function loadFromStorage(): PaneManagerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PaneManagerState
    if (parsed?.root && parsed?.activePaneId) return parsed
    return null
  } catch {
    return null
  }
}

function createInitialState(): PaneManagerState {
  if (typeof window !== 'undefined') {
    const stored = loadFromStorage()
    if (stored) return stored
  }
  return freshState()
}

function paneReducer(state: PaneManagerState, action: PaneAction): PaneManagerState {
  switch (action.type) {
    case 'SPLIT_PANE': {
      if (countLeaves(state.root) >= MAX_PANES) return state
      const newRoot = splitLeaf(state.root, action.paneId, action.direction)
      if (newRoot === state.root) return state
      const newPaneId = getNewPaneIdFromSplit(state.root, newRoot)
      return {
        root: newRoot,
        activePaneId: newPaneId ?? state.activePaneId,
      }
    }

    case 'CLOSE_PANE': {
      if (countLeaves(state.root) <= 1) return state
      const newRoot = removeLeaf(state.root, action.paneId)
      if (!newRoot) return state
      const remaining = collectLeafIds(newRoot)
      const newActive = remaining.includes(state.activePaneId)
        ? state.activePaneId
        : remaining[0]
      return { root: newRoot, activePaneId: newActive }
    }

    case 'SET_ACTIVE_PANE': {
      if (state.activePaneId === action.paneId) return state
      return { ...state, activePaneId: action.paneId }
    }

    case 'RESET_ALL': {
      try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
      return freshState()
    }

    default:
      return state
  }
}

export function usePaneManager() {
  const [paneState, paneDispatch] = useReducer(paneReducer, null, createInitialState)

  // Persist layout to localStorage on every state change (except after RESET_ALL which clears it)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(paneState))
    } catch { /* ignore */ }
  }, [paneState])

  return { paneState, paneDispatch } as const
}

export type { PaneAction }
