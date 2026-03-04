'use client'

import { memo, useMemo } from 'react'
import IsometricRoom from './IsometricRoom'
import type { IsometricAgent } from './IsometricRoom'
import {
  IsometricTitleOverlay,
  IsometricLogoOverlay,
  IsometricStatusOverlays,
} from './IsometricEnvironment'
import type { AgentState } from '@/types/topology'
import { useIsometricLayout } from '@/hooks/useIsometricLayout'

interface AgentOperationsCenterProps {
  readonly agents: ReadonlyArray<AgentState>
  readonly phase?: 'idle' | 'running' | 'complete'
}

function AgentOperationsCenter({ agents }: AgentOperationsCenterProps) {
  const podPositions = useIsometricLayout(agents)

  const isometricAgents: ReadonlyArray<IsometricAgent> = useMemo(() => {
    return podPositions.map((pod) => ({
      agentId: pod.agentId,
      name: pod.name,
      agentType: pod.agentType,
      status: pod.status,
      isoX: pod.isoX,
      isoY: pod.isoY,
      color: pod.color,
      tokenRate: pod.tokenRate,
    }))
  }, [podPositions])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#080b14',
        overflow: 'hidden',
        borderRadius: 4,
      }}
    >
      {/* SVG isometric room */}
      <IsometricRoom agents={isometricAgents} />

      {/* HTML overlays */}
      <IsometricTitleOverlay />
      <IsometricLogoOverlay />
      <IsometricStatusOverlays />
    </div>
  )
}

export default memo(AgentOperationsCenter)
