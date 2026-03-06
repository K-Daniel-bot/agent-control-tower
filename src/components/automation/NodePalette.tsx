'use client'

import { useCallback } from 'react'
import { NODE_TYPE_CONFIG, type WorkflowNodeType } from '@/types/automation'
import { NocTheme } from '@/constants/nocTheme'
import { useAutomation } from './context/AutomationContext'

const FONT = "'JetBrains Mono', 'Fira Code', 'Menlo', monospace"

const NODE_TYPES: readonly WorkflowNodeType[] = ['trigger', 'condition', 'action', 'parallel']

export default function NodePalette() {
  const { addNode } = useAutomation()

  const handleAdd = useCallback((type: WorkflowNodeType) => {
    const x = 200 + Math.random() * 200
    const y = 100 + Math.random() * 300
    addNode(type, { x, y })
  }, [addNode])

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: FONT, color: NocTheme.textPrimary,
      overflow: 'auto',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: NocTheme.textTertiary,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        marginBottom: 12,
      }}>
        노드 팔레트
      </div>
      <div style={{ fontSize: 9, color: NocTheme.textMuted, marginBottom: 16 }}>
        클릭하여 캔버스에 추가
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {NODE_TYPES.map(type => {
          const cfg = NODE_TYPE_CONFIG[type]
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleAdd(type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                background: `${cfg.color}08`,
                border: `1px solid ${cfg.color}30`,
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: FONT,
                textAlign: 'left',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = `${cfg.color}18`
                ;(e.currentTarget as HTMLElement).style.borderColor = `${cfg.color}50`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = `${cfg.color}08`
                ;(e.currentTarget as HTMLElement).style.borderColor = `${cfg.color}30`
              }}
            >
              <span style={{
                width: 32, height: 32, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${cfg.color}15`,
                fontSize: 16,
              }}>
                {cfg.icon}
              </span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>
                  {cfg.label}
                </div>
                <div style={{ fontSize: 9, color: NocTheme.textMuted, marginTop: 2 }}>
                  {cfg.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Workflow list */}
      <div style={{
        fontSize: 10, fontWeight: 700, color: NocTheme.textTertiary,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        marginTop: 24, marginBottom: 8,
      }}>
        실행 이력
      </div>
      <ExecutionHistory />
    </div>
  )
}

function ExecutionHistory() {
  const { state } = useAutomation()
  const executions = state.executions.slice(-5).reverse()

  if (executions.length === 0) {
    return (
      <div style={{ fontSize: 10, color: NocTheme.textMuted, padding: '8px 0' }}>
        실행 이력이 없습니다
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    completed: '#00ff88',
    failed: '#ef4444',
    running: '#f59e0b',
    pending: '#6b7280',
    cancelled: '#6b7280',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {executions.map(exec => (
        <div key={exec.id} style={{
          padding: '6px 8px',
          background: NocTheme.surfaceAlt,
          border: `1px solid ${NocTheme.border}`,
          borderRadius: 4,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: 9, fontWeight: 600,
              color: statusColors[exec.status] ?? '#6b7280',
            }}>
              {exec.status === 'completed' ? '✓ 완료' :
               exec.status === 'failed' ? '✗ 실패' :
               exec.status === 'running' ? '● 실행 중' : exec.status}
            </span>
            <span style={{ fontSize: 9, color: NocTheme.textMuted }}>
              {new Date(exec.startedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div style={{ fontSize: 9, color: NocTheme.textMuted, marginTop: 2 }}>
            {exec.logs.length}개 단계
          </div>
        </div>
      ))}
    </div>
  )
}
