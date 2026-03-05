'use client'

import { useEffect, useRef } from 'react'
import { useOrchestra } from '@/context/AgentOrchestraContext'
import type { AgentStatus, AgentMessage } from '@/types/topology'

// ── Status config ──────────────────────────────────────────────
const STATUS_CONFIG: Record<AgentStatus, { color: string; label: string; pulse: boolean }> = {
  spawning:  { color: '#6b7280', label: '초기화',  pulse: false },
  active:    { color: '#3b82f6', label: '활성',    pulse: true  },
  working:   { color: '#00ff88', label: '실행',    pulse: true  },
  idle:      { color: '#505661', label: '대기',    pulse: false },
  error:     { color: '#ef4444', label: '오류',    pulse: true  },
  complete:  { color: '#374151', label: '완료',    pulse: false },
}

const TYPE_COLORS: Record<string, string> = {
  orchestrator: '#ffd700',
  planner:      '#8b5cf6',
  executor:     '#3b82f6',
  tool:         '#06b6d4',
  verifier:     '#10b981',
  result:       '#00ff88',
}

const MSG_TYPE_CONFIG = {
  task:   { color: '#3b82f6', icon: '→' },
  result: { color: '#00ff88', icon: '✓' },
  error:  { color: '#ef4444', icon: '✗' },
  system: { color: '#6b7280', icon: '◆' },
}

// ── Agent status row ────────────────────────────────────────────
function AgentRow({ agent }: { agent: ReturnType<typeof useOrchestra>['state']['agents'][number] }) {
  const cfg = STATUS_CONFIG[agent.status]
  const typeColor = TYPE_COLORS[agent.identity.agentType] ?? '#6b7280'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '5px 8px',
        borderRadius: 4,
        background: agent.status === 'error'
          ? 'rgba(239,68,68,0.05)'
          : agent.status === 'working' || agent.status === 'active'
          ? 'rgba(0,255,136,0.03)'
          : 'transparent',
        border: `1px solid ${agent.status === 'error' ? 'rgba(239,68,68,0.2)' : '#333333'}`,
        marginBottom: 3,
      }}
    >
      {/* Status dot */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.color,
          boxShadow: cfg.pulse ? `0 0 5px ${cfg.color}` : 'none',
          flexShrink: 0,
          animation: cfg.pulse ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
        }}
      />

      {/* Name + type */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: typeColor,
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {agent.identity.englishRole}
        </div>
        <div style={{ fontSize: 8, color: '#505661', letterSpacing: '0.02em' }}>
          {cfg.label}
          {agent.tokenRate > 0 && (
            <span style={{ color: '#6b7280', marginLeft: 4 }}>
              {agent.tokenRate}t/s
            </span>
          )}
        </div>
      </div>

      {/* Latency */}
      {agent.latencyMs > 0 && agent.status !== 'complete' && (
        <div
          style={{
            fontSize: 8,
            color: agent.latencyMs > 500 ? '#f59e0b' : '#505661',
            fontFamily: 'monospace',
            flexShrink: 0,
          }}
        >
          {agent.latencyMs}ms
        </div>
      )}
    </div>
  )
}

// ── Conversation message row ────────────────────────────────────
function MessageRow({ msg }: { msg: AgentMessage }) {
  const cfg = MSG_TYPE_CONFIG[msg.type]
  const time = new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div
      style={{
        padding: '5px 8px',
        borderLeft: `2px solid ${cfg.color}40`,
        marginBottom: 4,
        background: `${cfg.color}05`,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 2,
        }}
      >
        <span style={{ fontSize: 8, color: cfg.color, fontWeight: 700 }}>
          {cfg.icon}
        </span>
        <span style={{ fontSize: 8, color: cfg.color, fontWeight: 600 }}>
          {msg.fromLabel}
        </span>
        {msg.toLabel !== 'ALL' && (
          <>
            <span style={{ fontSize: 7, color: '#374151' }}>→</span>
            <span style={{ fontSize: 8, color: '#6b7280' }}>{msg.toLabel}</span>
          </>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 7, color: '#374151', fontFamily: 'monospace' }}>
          {time}
        </span>
      </div>

      {/* Message body */}
      <div
        style={{
          fontSize: 9,
          color: '#9ca3af',
          lineHeight: 1.5,
          wordBreak: 'break-word',
        }}
      >
        {msg.message}
      </div>
    </div>
  )
}

// ── Main LeftPanel ──────────────────────────────────────────────
export default function LeftPanel() {
  const { state } = useOrchestra()
  const msgEndRef = useRef<HTMLDivElement>(null)

  const activeAgents = state.agents.filter(
    (a) => a.status !== 'complete',
  )
  const completedAgents = state.agents.filter((a) => a.status === 'complete')

  // Auto-scroll conversation log to bottom
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages.length])

  return (
    <div
      style={{
        width: 220,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        borderRight: '1px solid #333333',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* ── Agent Status Section ── */}
      <div
        style={{
          flex: '0 0 auto',
          maxHeight: '50%',
          display: 'flex',
          flexDirection: 'column',
          borderBottom: '1px solid #333333',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px 6px',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: '#505661',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            에이전트 상태
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {state.agents.length > 0 && (
              <>
                <span style={{ fontSize: 8, color: '#00ff88', fontFamily: 'monospace' }}>
                  {activeAgents.length}
                </span>
                <span style={{ fontSize: 7, color: '#374151' }}>/</span>
                <span style={{ fontSize: 8, color: '#505661', fontFamily: 'monospace' }}>
                  {state.agents.length}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Agent list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
          {state.agents.length === 0 ? (
            <div
              style={{
                padding: '16px 0',
                textAlign: 'center',
                fontSize: 9,
                color: '#374151',
                letterSpacing: '0.05em',
              }}
            >
              에이전트 없음
            </div>
          ) : (
            <>
              {activeAgents.map((agent) => (
                <AgentRow key={agent.identity.id} agent={agent} />
              ))}
              {completedAgents.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: 7,
                      color: '#374151',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      padding: '4px 2px 3px',
                      marginTop: 4,
                    }}
                  >
                    완료 ({completedAgents.length})
                  </div>
                  {completedAgents.map((agent) => (
                    <AgentRow key={agent.identity.id} agent={agent} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Conversation Log Section ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px 6px',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: '#505661',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            대화 로그
          </span>
          {state.messages.length > 0 && (
            <span style={{ fontSize: 8, color: '#374151', fontFamily: 'monospace' }}>
              {state.messages.length}
            </span>
          )}
        </div>

        {/* Message list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
          {state.messages.length === 0 ? (
            <div
              style={{
                padding: '16px 0',
                textAlign: 'center',
                fontSize: 9,
                color: '#374151',
                letterSpacing: '0.05em',
              }}
            >
              대화 없음
            </div>
          ) : (
            state.messages.map((m) => (
              <MessageRow key={m.id} msg={m} />
            ))
          )}
          <div ref={msgEndRef} />
        </div>
      </div>
    </div>
  )
}
