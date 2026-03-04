import { useState, useCallback, useEffect } from 'react'
import type { SavedAgent } from '@/types/agent'

const STORAGE_KEY = 'act-saved-agents'

function loadAgents(): SavedAgent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedAgent[]
  } catch {
    return []
  }
}

function persist(agents: SavedAgent[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(agents)) } catch { /* ignore */ }
}

export function useAgentStorage() {
  const [agents, setAgents] = useState<SavedAgent[]>([])

  useEffect(() => { setAgents(loadAgents()) }, [])

  const addAgent = useCallback((agent: SavedAgent) => {
    setAgents(prev => {
      const next = [...prev, agent]
      persist(next)
      return next
    })
  }, [])

  const deleteAgent = useCallback((id: string) => {
    setAgents(prev => {
      const next = prev.filter(a => a.id !== id)
      persist(next)
      return next
    })
  }, [])

  return { agents, addAgent, deleteAgent } as const
}
