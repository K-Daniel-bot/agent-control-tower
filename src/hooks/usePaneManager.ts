import { useReducer } from 'react'
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

type PaneAction =
  | { readonly type: 'SPLIT_PANE'; readonly paneId: PaneId; readonly direction: SplitDirection }
  | { readonly type: 'CLOSE_PANE'; readonly paneId: PaneId }
  | { readonly type: 'SET_ACTIVE_PANE'; readonly paneId: PaneId }
  | { readonly type: 'RESET_ALL' }

function createInitialState(): PaneManagerState {
  const pane = createInitialPane()
  return { root: pane, activePaneId: pane.id }
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
      return createInitialState()
    }

    default:
      return state
  }
}

export function usePaneManager() {
  const [paneState, paneDispatch] = useReducer(paneReducer, null, createInitialState)
  return { paneState, paneDispatch } as const
}

export type { PaneAction }
