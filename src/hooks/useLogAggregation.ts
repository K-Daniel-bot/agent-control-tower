'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { LogEntry, LogFilter, LogStats, LogLevel, LogSource } from '@/types/logs'
import { DEFAULT_LOG_FILTER, TIME_RANGE_MS } from '@/types/logs'

const uid = () => `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`
const rand = (min: number, max: number) => Math.random() * (max - min) + min
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

const MOCK_MESSAGES: readonly { source: LogSource; level: LogLevel; category: string; message: string; target: string }[] = [
  { source: 'agent_event', level: 'info', category: 'lifecycle', message: '에이전트 상태 변경: idle → running', target: 'agent-alpha' },
  { source: 'agent_event', level: 'info', category: 'task', message: '작업 큐에 새 태스크 추가됨', target: 'task-queue' },
  { source: 'agent_event', level: 'warning', category: 'performance', message: '에이전트 응답 시간 3.2초 (임계값: 2초)', target: 'agent-beta' },
  { source: 'agent_event', level: 'error', category: 'connection', message: '에이전트 연결 타임아웃 — 재연결 시도 중', target: 'agent-gamma' },
  { source: 'audit', level: 'info', category: 'access', message: '파일 읽기 성공: package.json', target: '/workspace/package.json' },
  { source: 'audit', level: 'warning', category: 'access', message: '민감 파일 접근 시도 차단: .env', target: '/workspace/.env' },
  { source: 'audit', level: 'info', category: 'approval', message: '승인 요청 생성: Chrome 브라우저 실행', target: 'chrome.exe' },
  { source: 'audit', level: 'info', category: 'approval', message: '승인 완료: 파일 생성 작업', target: '/tmp/output.json' },
  { source: 'remote_action', level: 'info', category: 'cursor', message: '커서 이동: (480, 320) → (920, 610)', target: 'Desktop' },
  { source: 'remote_action', level: 'info', category: 'keyboard', message: '키보드 입력: "npm run build"', target: 'Terminal' },
  { source: 'remote_action', level: 'info', category: 'click', message: '좌클릭: Submit 버튼', target: 'Button:Submit' },
  { source: 'remote_action', level: 'warning', category: 'blocked', message: '시스템 설정 변경 시도 차단', target: 'system_settings' },
  { source: 'system', level: 'info', category: 'startup', message: '시스템 초기화 완료', target: 'core' },
  { source: 'system', level: 'warning', category: 'resource', message: 'CPU 사용률 85% — 임계값 근접', target: 'cpu_monitor' },
  { source: 'system', level: 'info', category: 'network', message: 'WebSocket 연결 수립: terminal-server:3001', target: 'ws://localhost:3001' },
  { source: 'system', level: 'error', category: 'process', message: '프로세스 비정상 종료: PID 4821', target: 'worker-3' },
  { source: 'security', level: 'warning', category: 'threat', message: '비정상 아웃바운드 트래픽 감지: 45.33.32.156:4444', target: 'NetworkMonitor' },
  { source: 'security', level: 'critical', category: 'malware', message: '의심 프로세스 탐지: svchost_x86.exe (비정상 경로)', target: 'ProcessGuard' },
  { source: 'security', level: 'info', category: 'acl', message: 'ACL 규칙 적용: .env 파일 접근 차단', target: 'FileWatcher' },
  { source: 'security', level: 'warning', category: 'network', message: 'DNS 쿼리 차단: malware.bad.domain', target: 'DNSFilter' },
  { source: 'voice', level: 'info', category: 'command', message: '음성 명령 인식: "네이버 열어"', target: 'STT' },
  { source: 'voice', level: 'info', category: 'response', message: 'TTS 응답: "주인님, 네이버로 이동하겠습니다."', target: 'TTS' },
  { source: 'voice', level: 'warning', category: 'recognition', message: '음성 인식 실패 — 재시도 중', target: 'STT' },
  { source: 'workflow', level: 'info', category: 'execution', message: '워크플로우 실행 시작: "일일 보고서"', target: 'workflow-001' },
  { source: 'workflow', level: 'info', category: 'execution', message: '워크플로우 단계 완료: 데이터 수집', target: 'workflow-001:step-2' },
  { source: 'workflow', level: 'error', category: 'execution', message: '워크플로우 실행 실패: HTTP 요청 타임아웃', target: 'workflow-002:step-3' },
]

function generateInitialLogs(count: number): readonly LogEntry[] {
  const entries: LogEntry[] = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const template = pick(MOCK_MESSAGES)
    entries.push({
      id: uid(),
      timestamp: now - (count - i) * Math.floor(rand(5000, 30000)),
      level: template.level,
      source: template.source,
      category: template.category,
      message: template.message,
      target: template.target,
    })
  }
  return entries.sort((a, b) => b.timestamp - a.timestamp)
}

function filterLogs(logs: readonly LogEntry[], filter: LogFilter): readonly LogEntry[] {
  const now = Date.now()
  const rangeMs = TIME_RANGE_MS[filter.timeRange]

  return logs.filter(log => {
    if (!filter.sources.includes(log.source)) return false
    if (!filter.levels.includes(log.level)) return false
    if (rangeMs !== Infinity && now - log.timestamp > rangeMs) return false
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase()
      const match =
        log.message.toLowerCase().includes(q) ||
        log.target?.toLowerCase().includes(q) ||
        log.category.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })
}

function computeStats(logs: readonly LogEntry[]): LogStats {
  const countByLevel: Record<LogLevel, number> = { debug: 0, info: 0, warning: 0, error: 0, critical: 0 }
  const countBySource: Record<LogSource, number> = {
    agent_event: 0, audit: 0, remote_action: 0, system: 0, security: 0, voice: 0, workflow: 0,
  }

  for (const log of logs) {
    countByLevel[log.level]++
    countBySource[log.source]++
  }

  const errorCount = countByLevel.error + countByLevel.critical
  const now = Date.now()
  const recentCount = logs.filter(l => now - l.timestamp < 60_000).length

  return {
    totalCount: logs.length,
    countByLevel,
    countBySource,
    errorRate: logs.length > 0 ? Math.round((errorCount / logs.length) * 1000) / 10 : 0,
    recentPerMinute: recentCount,
  }
}

export function useLogAggregation() {
  const [allLogs, setAllLogs] = useState<readonly LogEntry[]>(() => generateInitialLogs(80))
  const [filter, setFilter] = useState<LogFilter>(DEFAULT_LOG_FILTER)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Generate new logs periodically
  useEffect(() => {
    if (isPaused) return
    intervalRef.current = setInterval(() => {
      const template = pick(MOCK_MESSAGES)
      const newLog: LogEntry = {
        id: uid(),
        timestamp: Date.now(),
        level: template.level,
        source: template.source,
        category: template.category,
        message: template.message,
        target: template.target,
      }
      setAllLogs(prev => {
        const next = [newLog, ...prev]
        return next.length > 500 ? next.slice(0, 500) : next
      })
    }, Math.floor(rand(2000, 6000)))

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused])

  const filteredLogs = filterLogs(allLogs, filter)
  const stats = computeStats(filteredLogs)

  const updateFilter = useCallback((partial: Partial<LogFilter>) => {
    setFilter(prev => ({ ...prev, ...partial }))
  }, [])

  const toggleSource = useCallback((source: LogSource) => {
    setFilter(prev => {
      const has = prev.sources.includes(source)
      return {
        ...prev,
        sources: has
          ? prev.sources.filter(s => s !== source)
          : [...prev.sources, source],
      }
    })
  }, [])

  const toggleLevel = useCallback((level: LogLevel) => {
    setFilter(prev => {
      const has = prev.levels.includes(level)
      return {
        ...prev,
        levels: has
          ? prev.levels.filter(l => l !== level)
          : [...prev.levels, level],
      }
    })
  }, [])

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])

  const clearLogs = useCallback(() => {
    setAllLogs([])
  }, [])

  return {
    logs: filteredLogs,
    allLogs,
    filter,
    stats,
    isPaused,
    updateFilter,
    toggleSource,
    toggleLevel,
    togglePause,
    clearLogs,
  }
}
