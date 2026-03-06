'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { WorkflowNodeData } from '@/types/automation'
import { NocTheme } from '@/constants/nocTheme'

const COLOR = '#a855f7'

function ConditionNode({ data, selected }: NodeProps) {
  const d = data as unknown as WorkflowNodeData
  return (
    <div style={{
      padding: '12px 16px',
      background: NocTheme.background,
      border: `2px solid ${selected ? COLOR : `${COLOR}60`}`,
      borderRadius: 8,
      minWidth: 160,
      fontFamily: "'JetBrains Mono', monospace",
      boxShadow: selected ? `0 0 12px ${COLOR}30` : 'none',
      transition: 'all 0.15s',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: COLOR, width: 8, height: 8 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 12 }}>🔀</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: COLOR }}>조건</span>
      </div>
      <div style={{ fontSize: 12, color: NocTheme.textPrimary, fontWeight: 600 }}>
        {d.label}
      </div>
      {d.description && (
        <div style={{ fontSize: 9, color: NocTheme.textMuted, marginTop: 4 }}>
          {d.description}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 9, color: '#10b981' }}>True ✓</span>
        <span style={{ fontSize: 9, color: '#ef4444' }}>False ✗</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" style={{ background: '#10b981', width: 8, height: 8, left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ background: '#ef4444', width: 8, height: 8, left: '70%' }} />
    </div>
  )
}

export default memo(ConditionNode)
