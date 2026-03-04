'use client'

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react'
import type {
  OrchestraState,
  OrchestraAction,
} from '@/types/topology'

const INITIAL_STATE: OrchestraState = {
  agents: [],
  executionEdges: [],
  dependencyLinks: [],
  phase: 'idle',
}

function orchestraReducer(
  state: OrchestraState,
  action: OrchestraAction
): OrchestraState {
  switch (action.type) {
    case 'SPAWN_AGENT':
      return {
        ...state,
        agents: [
          ...state.agents,
          {
            identity: action.payload,
            status: 'spawning',
            tokenRate: 0,
            latencyMs: 0,
            spawnedAt: Date.now(),
          },
        ],
      }

    case 'UPDATE_AGENT_STATUS':
      return {
        ...state,
        agents: state.agents.map((agent) =>
          agent.identity.id === action.payload.id
            ? {
                ...agent,
                status: action.payload.status,
                tokenRate: action.payload.tokenRate ?? agent.tokenRate,
                latencyMs: action.payload.latencyMs ?? agent.latencyMs,
              }
            : agent
        ),
      }

    case 'COMPLETE_AGENT':
      return {
        ...state,
        agents: state.agents.map((agent) =>
          agent.identity.id === action.payload.id
            ? { ...agent, status: 'complete', completedAt: Date.now() }
            : agent
        ),
      }

    case 'REMOVE_AGENT': {
      const removedId = action.payload.id
      return {
        ...state,
        agents: state.agents.filter((a) => a.identity.id !== removedId),
        executionEdges: state.executionEdges.filter(
          (e) => e.sourceId !== removedId && e.targetId !== removedId
        ),
        dependencyLinks: state.dependencyLinks.filter(
          (l) => l.sourceId !== removedId && l.targetId !== removedId
        ),
      }
    }

    case 'ADD_EXECUTION_EDGE':
      return {
        ...state,
        executionEdges: [...state.executionEdges, action.payload],
      }

    case 'ADD_DEPENDENCY_LINK':
      return {
        ...state,
        dependencyLinks: [...state.dependencyLinks, action.payload],
      }

    case 'SET_PHASE':
      return {
        ...state,
        phase: action.payload,
      }

    case 'RESET':
      return INITIAL_STATE

    default:
      return state
  }
}

interface OrchestraContextValue {
  state: OrchestraState
  dispatch: React.Dispatch<OrchestraAction>
}

const OrchestraContext = createContext<OrchestraContextValue | null>(null)

export function AgentOrchestraProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orchestraReducer, INITIAL_STATE)

  return (
    <OrchestraContext.Provider value={{ state, dispatch }}>
      {children}
    </OrchestraContext.Provider>
  )
}

export function useOrchestra(): OrchestraContextValue {
  const context = useContext(OrchestraContext)
  if (!context) {
    throw new Error('useOrchestra must be used within AgentOrchestraProvider')
  }
  return context
}

export function useAgents() {
  const { state } = useOrchestra()
  return state.agents
}

export function useOrchestraPhase() {
  const { state } = useOrchestra()
  return state.phase
}
