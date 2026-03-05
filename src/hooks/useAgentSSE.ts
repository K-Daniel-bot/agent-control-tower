'use client'

import { useEffect, useRef } from 'react'
import type { OrchestraAction, TopologyAgentType } from '@/types/topology'

let _sseSeq = 0

function generateId(prefix: string): string {
  return `${prefix}-${++_sseSeq}-${Date.now()}`
}

export function useAgentSSE(dispatch: React.Dispatch<OrchestraAction>): void {
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource('/api/agents/stream')
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        switch (data.type) {
          case 'spawn': {
            dispatch({ type: 'SET_PHASE', payload: 'running' })
            dispatch({
              type: 'SPAWN_AGENT',
              payload: {
                id: data.agentId,
                koreanName: data.name || data.agentId,
                title: data.agentType || 'agent',
                englishRole: data.name || data.agentId,
                agentType: (data.agentType || 'executor') as TopologyAgentType,
              },
            })
            break
          }
          case 'status': {
            dispatch({
              type: 'UPDATE_AGENT_STATUS',
              payload: {
                id: data.agentId,
                status: data.status || 'active',
                tokenRate: data.tokenRate,
                latencyMs: data.latencyMs,
              },
            })
            break
          }
          case 'complete': {
            dispatch({
              type: 'COMPLETE_AGENT',
              payload: { id: data.agentId },
            })
            break
          }
          case 'remove': {
            dispatch({
              type: 'REMOVE_AGENT',
              payload: { id: data.agentId },
            })
            break
          }
          case 'message': {
            dispatch({
              type: 'ADD_AGENT_MESSAGE',
              payload: {
                id: generateId('sse-msg'),
                fromId: data.agentId,
                toId: 'broadcast',
                fromLabel: data.name || data.agentId,
                toLabel: 'ALL',
                message: data.message || '',
                timestamp: data.timestamp || Date.now(),
                type: 'system',
              },
            })
            break
          }
        }
      } catch {
        // ignore malformed SSE data
      }
    }

    es.onerror = () => {
      // EventSource will auto-reconnect
    }

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [dispatch])
}
