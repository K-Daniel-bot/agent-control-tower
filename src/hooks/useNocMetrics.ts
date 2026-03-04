import { useMemo, useRef, useEffect, useCallback } from 'react'
import type { OrchestraState } from '@/types/topology'
import {
  deriveTokenRatePoint,
  deriveContextUsagePoint,
  deriveCommunicationTrafficPoint,
  deriveEventCountGrid,
  deriveAgentStatusSummary,
  deriveChannelStatus,
  deriveToolStatus,
  type DataPoint,
} from '@/utils/nocDataTransform'

const BUFFER_SIZE = 30

function useTimeSeriesBuffer(
  derivePoint: () => DataPoint,
  intervalMs: number = 2000,
): DataPoint[] {
  const bufferRef = useRef<DataPoint[]>([])
  const tickRef = useRef(0)

  useEffect(() => {
    const timer = setInterval(() => {
      const point = derivePoint()
      bufferRef.current = [...bufferRef.current.slice(-(BUFFER_SIZE - 1)), point]
      tickRef.current += 1
    }, intervalMs)
    return () => clearInterval(timer)
  }, [derivePoint, intervalMs])

  return bufferRef.current
}

export function useNocMetrics(state: OrchestraState) {
  const deriveTokenRate = useCallback(
    () => deriveTokenRatePoint(state.agents),
    [state.agents],
  )

  const deriveContextUsage = useCallback(
    () => deriveContextUsagePoint(state.agents),
    [state.agents],
  )

  const deriveCommTraffic = useCallback(
    () => deriveCommunicationTrafficPoint(state.messages),
    [state.messages],
  )

  const tokenRateSeries = useTimeSeriesBuffer(deriveTokenRate)
  const contextUsageSeries = useTimeSeriesBuffer(deriveContextUsage)
  const communicationTraffic = useTimeSeriesBuffer(deriveCommTraffic)

  const eventCountGrid = useMemo(
    () => deriveEventCountGrid(state.agents, state.messages),
    [state.agents, state.messages],
  )

  const agentStatusSummary = useMemo(
    () => deriveAgentStatusSummary(state.agents),
    [state.agents],
  )

  const channelStatus = useMemo(
    () => deriveChannelStatus(state.executionEdges),
    [state.executionEdges],
  )

  const toolStatus = useMemo(
    () => deriveToolStatus(state.agents, state.dependencyLinks),
    [state.agents, state.dependencyLinks],
  )

  return {
    tokenRateSeries,
    contextUsageSeries,
    communicationTraffic,
    eventCountGrid,
    agentStatusSummary,
    channelStatus,
    toolStatus,
  }
}
