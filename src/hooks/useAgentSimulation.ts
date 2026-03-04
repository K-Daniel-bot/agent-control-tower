'use client'

import { useCallback, useRef } from 'react'
import type { OrchestraAction, TopologyAgentType } from '@/types/topology'
import {
  createOrchestratorIdentity,
  createAgentIdentity,
  resetNamePool,
} from '@/data/koreanNamePool'

interface SimulationStep {
  delay: number
  action: () => OrchestraAction | OrchestraAction[]
}

function jitter(base: number): number {
  return base + Math.random() * 800 - 400
}

function buildSimulationSteps(): SimulationStep[] {
  const usedNames: string[] = []

  const makeAgent = (type: TopologyAgentType, role: string) => {
    const identity = createAgentIdentity(type, role, usedNames)
    usedNames.push(identity.koreanName)
    return identity
  }

  // Pre-generate all identities
  const ceo = createOrchestratorIdentity()
  const planner1 = makeAgent('planner', 'Planner A')
  const planner2 = makeAgent('planner', 'Planner B')
  const executor1 = makeAgent('executor', 'Executor A')
  const executor2 = makeAgent('executor', 'Executor B')
  const executor3 = makeAgent('executor', 'Executor C')
  const tool1 = makeAgent('tool', 'Browser')
  const tool2 = makeAgent('tool', 'Filesystem')
  const tool3 = makeAgent('tool', 'Git')
  const tool4 = makeAgent('tool', 'Shell')
  const verifier1 = makeAgent('verifier', 'Verifier A')
  const verifier2 = makeAgent('verifier', 'Verifier B')

  return [
    // Phase: Start
    { delay: 0, action: () => ({ type: 'SET_PHASE', payload: 'running' }) },

    // CEO spawns first
    { delay: 300, action: () => ({ type: 'SPAWN_AGENT', payload: ceo }) },
    { delay: jitter(800), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: ceo.id, status: 'active', tokenRate: 120, latencyMs: 45 } }) },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: ceo.id, status: 'working', tokenRate: 156, latencyMs: 52 } }) },

    // Planners spawn
    { delay: jitter(1200), action: () => ({ type: 'SPAWN_AGENT', payload: planner1 }) },
    {
      delay: jitter(400),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${ceo.id}-${planner1.id}`, sourceId: ceo.id, targetId: planner1.id, status: 'normal', dataRate: 48 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${ceo.id}-${planner1.id}`, sourceId: ceo.id, targetId: planner1.id, type: 'communicates' } },
      ],
    },
    { delay: jitter(600), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: planner1.id, status: 'active', tokenRate: 88, latencyMs: 120 } }) },

    { delay: jitter(800), action: () => ({ type: 'SPAWN_AGENT', payload: planner2 }) },
    {
      delay: jitter(400),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${ceo.id}-${planner2.id}`, sourceId: ceo.id, targetId: planner2.id, status: 'normal', dataRate: 35 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${ceo.id}-${planner2.id}`, sourceId: ceo.id, targetId: planner2.id, type: 'communicates' } },
      ],
    },
    { delay: jitter(600), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: planner2.id, status: 'working', tokenRate: 72, latencyMs: 95 } }) },

    // Planners start working
    { delay: jitter(1000), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: planner1.id, status: 'working', tokenRate: 105, latencyMs: 89 } }) },

    // Executors spawn
    { delay: jitter(1500), action: () => ({ type: 'SPAWN_AGENT', payload: executor1 }) },
    {
      delay: jitter(300),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${planner1.id}-${executor1.id}`, sourceId: planner1.id, targetId: executor1.id, status: 'normal', dataRate: 62 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${planner1.id}-${executor1.id}`, sourceId: planner1.id, targetId: executor1.id, type: 'depends' } },
      ],
    },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor1.id, status: 'active', tokenRate: 48, latencyMs: 245 } }) },

    { delay: jitter(800), action: () => ({ type: 'SPAWN_AGENT', payload: executor2 }) },
    {
      delay: jitter(300),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${planner1.id}-${executor2.id}`, sourceId: planner1.id, targetId: executor2.id, status: 'normal', dataRate: 55 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${planner1.id}-${executor2.id}`, sourceId: planner1.id, targetId: executor2.id, type: 'depends' } },
      ],
    },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor2.id, status: 'working', tokenRate: 92, latencyMs: 180 } }) },

    { delay: jitter(600), action: () => ({ type: 'SPAWN_AGENT', payload: executor3 }) },
    {
      delay: jitter(300),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${planner2.id}-${executor3.id}`, sourceId: planner2.id, targetId: executor3.id, status: 'normal', dataRate: 40 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${planner2.id}-${executor3.id}`, sourceId: planner2.id, targetId: executor3.id, type: 'depends' } },
      ],
    },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor3.id, status: 'active', tokenRate: 65, latencyMs: 310 } }) },

    // Executors start working
    { delay: jitter(800), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor1.id, status: 'working', tokenRate: 78, latencyMs: 198 } }) },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor3.id, status: 'working', tokenRate: 85, latencyMs: 267 } }) },

    // Tools spawn
    { delay: jitter(1200), action: () => ({ type: 'SPAWN_AGENT', payload: tool1 }) },
    {
      delay: jitter(200),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${executor1.id}-${tool1.id}`, sourceId: executor1.id, targetId: tool1.id, status: 'normal', dataRate: 30 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${executor1.id}-${tool1.id}`, sourceId: executor1.id, targetId: tool1.id, type: 'uses' } },
      ],
    },
    { delay: jitter(400), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: tool1.id, status: 'working', tokenRate: 25, latencyMs: 450 } }) },

    { delay: jitter(600), action: () => ({ type: 'SPAWN_AGENT', payload: tool2 }) },
    {
      delay: jitter(200),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${executor2.id}-${tool2.id}`, sourceId: executor2.id, targetId: tool2.id, status: 'normal', dataRate: 42 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${executor2.id}-${tool2.id}`, sourceId: executor2.id, targetId: tool2.id, type: 'uses' } },
      ],
    },
    { delay: jitter(400), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: tool2.id, status: 'working', tokenRate: 38, latencyMs: 320 } }) },

    { delay: jitter(500), action: () => ({ type: 'SPAWN_AGENT', payload: tool3 }) },
    {
      delay: jitter(200),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${executor3.id}-${tool3.id}`, sourceId: executor3.id, targetId: tool3.id, status: 'normal', dataRate: 28 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${executor3.id}-${tool3.id}`, sourceId: executor3.id, targetId: tool3.id, type: 'uses' } },
      ],
    },
    { delay: jitter(400), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: tool3.id, status: 'active', tokenRate: 15, latencyMs: 180 } }) },

    { delay: jitter(400), action: () => ({ type: 'SPAWN_AGENT', payload: tool4 }) },
    {
      delay: jitter(200),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${executor3.id}-${tool4.id}`, sourceId: executor3.id, targetId: tool4.id, status: 'normal', dataRate: 35 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${executor3.id}-${tool4.id}`, sourceId: executor3.id, targetId: tool4.id, type: 'uses' } },
      ],
    },
    { delay: jitter(400), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: tool4.id, status: 'working', tokenRate: 22, latencyMs: 140 } }) },

    // Some warnings/errors for realism
    { delay: jitter(2000), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor2.id, status: 'error', tokenRate: 0, latencyMs: 890 } }) },
    { delay: jitter(1500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor2.id, status: 'working', tokenRate: 45, latencyMs: 220 } }) },

    // Verifiers spawn
    { delay: jitter(2000), action: () => ({ type: 'SPAWN_AGENT', payload: verifier1 }) },
    {
      delay: jitter(300),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${tool1.id}-${verifier1.id}`, sourceId: tool1.id, targetId: verifier1.id, status: 'normal', dataRate: 52 } },
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${tool2.id}-${verifier1.id}`, sourceId: tool2.id, targetId: verifier1.id, status: 'normal', dataRate: 44 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${tool1.id}-${verifier1.id}`, sourceId: tool1.id, targetId: verifier1.id, type: 'depends' } },
      ],
    },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: verifier1.id, status: 'working', tokenRate: 95, latencyMs: 78 } }) },

    { delay: jitter(800), action: () => ({ type: 'SPAWN_AGENT', payload: verifier2 }) },
    {
      delay: jitter(300),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${tool3.id}-${verifier2.id}`, sourceId: tool3.id, targetId: verifier2.id, status: 'normal', dataRate: 38 } },
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${tool4.id}-${verifier2.id}`, sourceId: tool4.id, targetId: verifier2.id, status: 'normal', dataRate: 30 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${tool3.id}-${verifier2.id}`, sourceId: tool3.id, targetId: verifier2.id, type: 'depends' } },
      ],
    },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: verifier2.id, status: 'working', tokenRate: 82, latencyMs: 95 } }) },

    // Completion cascade
    { delay: jitter(3000), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: tool1.id } }) },
    { delay: jitter(500), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: tool2.id } }) },
    { delay: jitter(400), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: tool3.id } }) },
    { delay: jitter(300), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: tool4.id } }) },
    { delay: jitter(1000), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: verifier1.id } }) },
    { delay: jitter(500), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: verifier2.id } }) },
    { delay: jitter(800), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: executor1.id } }) },
    { delay: jitter(400), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: executor2.id } }) },
    { delay: jitter(300), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: executor3.id } }) },
    { delay: jitter(600), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: planner1.id } }) },
    { delay: jitter(300), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: planner2.id } }) },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: ceo.id, status: 'complete', tokenRate: 0, latencyMs: 0 } }) },

    // Phase complete
    { delay: jitter(1000), action: () => ({ type: 'SET_PHASE', payload: 'complete' }) },
  ]
}

export function useAgentSimulation(
  dispatch: React.Dispatch<OrchestraAction>
) {
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

  const startSimulation = useCallback(() => {
    clearAllTimeouts()
    resetNamePool()
    dispatch({ type: 'RESET' })

    const steps = buildSimulationSteps()
    let cumulativeDelay = 0

    for (const step of steps) {
      cumulativeDelay += step.delay
      const timeout = setTimeout(() => {
        const result = step.action()
        if (Array.isArray(result)) {
          result.forEach((a) => dispatch(a))
        } else {
          dispatch(result)
        }
      }, cumulativeDelay)
      timeoutsRef.current = [...timeoutsRef.current, timeout]
    }
  }, [dispatch, clearAllTimeouts])

  const resetSimulation = useCallback(() => {
    clearAllTimeouts()
    resetNamePool()
    dispatch({ type: 'RESET' })
  }, [dispatch, clearAllTimeouts])

  return { startSimulation, resetSimulation }
}
