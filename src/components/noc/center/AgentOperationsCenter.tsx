'use client'

import { memo, useMemo } from 'react'
import OfficeRoom from './OfficeRoom'
import type { AgentState } from '@/types/topology'
import { useIsometricLayout } from '@/hooks/useIsometricLayout'

interface AgentOperationsCenterProps {
  readonly agents: ReadonlyArray<AgentState>
  readonly phase?: 'idle' | 'running' | 'complete'
}

function AgentOperationsCenter({ agents }: AgentOperationsCenterProps) {
  const podPositions = useIsometricLayout(agents)

  const agentData = useMemo(() => {
    return podPositions.map((pod) => ({
      agentId: pod.agentId,
      name: pod.name,
      agentType: pod.agentType,
      status: pod.status,
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
        background: 'transparent',
        overflow: 'hidden',
        borderRadius: 4,
      }}
    >
      {/* 3D Office Room */}
      <OfficeRoom />
    </div>
  )
}

export default memo(AgentOperationsCenter)
