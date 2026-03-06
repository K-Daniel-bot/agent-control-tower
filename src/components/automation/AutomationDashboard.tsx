'use client'

import { AutomationProvider, useAutomation } from './context/AutomationContext'
import WorkflowCanvas from './WorkflowCanvas'
import NodePalette from './NodePalette'
import PropertyEditor from './PropertyEditor'
import { NocTheme } from '@/constants/nocTheme'

const FONT = "'JetBrains Mono', 'Fira Code', 'Menlo', monospace"

function StatusBadge({ color, label }: {
  readonly color: string
  readonly label: string
}) {
  return (
    <span style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 12px',
      background: `${color}15`,
      border: `1px solid ${color}40`,
      borderRadius: 16,
      fontSize: 11,
      color,
      fontWeight: 500,
      fontFamily: FONT,
    }}>
      <span style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 6px ${color}`,
      }} />
      {label}
    </span>
  )
}

function ToolbarButton({
  label, onClick, color, disabled,
}: {
  readonly label: string
  readonly onClick: () => void
  readonly color: string
  readonly disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '5px 14px',
        fontSize: 11,
        fontWeight: 500,
        fontFamily: FONT,
        background: disabled ? 'transparent' : `${color}18`,
        border: `1px solid ${disabled ? NocTheme.border : `${color}40`}`,
        borderRadius: 4,
        color: disabled ? NocTheme.textMuted : color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.12s',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  )
}

function AutomationContent() {
  const { state, runWorkflow } = useAutomation()
  const { isExecuting, nodes, executions } = state

  const lastExec = executions.length > 0 ? executions[executions.length - 1] : null
  const executionStatus = isExecuting ? 'running' : (lastExec?.status ?? 'idle')

  const statusConfig: Record<string, { color: string; label: string }> = {
    idle: { color: NocTheme.textMuted, label: '대기 중' },
    running: { color: '#f59e0b', label: '실행 중...' },
    completed: { color: NocTheme.green, label: '완료' },
    failed: { color: NocTheme.red, label: '실패' },
    pending: { color: NocTheme.textMuted, label: '대기' },
    cancelled: { color: NocTheme.textMuted, label: '취소됨' },
  }

  const currentStatus = statusConfig[executionStatus] ?? statusConfig.idle

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: NocTheme.background,
      fontFamily: FONT,
      color: NocTheme.textPrimary,
      overflow: 'hidden',
    }}>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        borderBottom: `1px solid ${NocTheme.border}`,
        height: 44,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em' }}>
            워크플로우 자동화
          </span>
          <StatusBadge
            color={currentStatus.color}
            label={currentStatus.label}
          />
          <span style={{
            fontSize: 10,
            color: NocTheme.textMuted,
            padding: '2px 8px',
            background: NocTheme.surfaceAlt,
            border: `1px solid ${NocTheme.border}`,
            borderRadius: 10,
          }}>
            노드 {nodes.length}개
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ToolbarButton
            label="▶ 실행"
            onClick={() => { void runWorkflow() }}
            color={NocTheme.green}
            disabled={isExecuting}
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Left: Node Palette */}
        <div style={{
          width: 200,
          flexShrink: 0,
          borderRight: `1px solid ${NocTheme.border}`,
          padding: '12px 10px',
          overflow: 'auto',
        }}>
          <NodePalette />
        </div>

        {/* Center: Workflow Canvas */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <WorkflowCanvas />
        </div>

        {/* Right: Property Editor */}
        <div style={{
          width: 260,
          flexShrink: 0,
          borderLeft: `1px solid ${NocTheme.border}`,
          padding: '12px 10px',
          overflow: 'auto',
        }}>
          <PropertyEditor />
        </div>
      </div>
    </div>
  )
}

export default function AutomationDashboard() {
  return (
    <AutomationProvider>
      <AutomationContent />
    </AutomationProvider>
  )
}
