'use client'

import React from 'react'
import type { ApprovalRecord } from '@/types/remote'
import SeverityBadge from './SeverityBadge'

interface ApprovalHistoryProps {
  readonly history: readonly ApprovalRecord[]
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const DECISION_CONFIG = {
  approved: { label: '승인', color: '#10b981' },
  denied: { label: '거부', color: '#ef4444' },
} as const

const RESPONDED_BY_LABEL: Record<string, string> = {
  voice: '음성',
  ui: 'UI',
  auto: '자동',
}

export default function ApprovalHistory({ history }: ApprovalHistoryProps) {
  const visibleItems = history.slice(0, 10)

  if (visibleItems.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          color: '#666',
          fontFamily: 'monospace',
          fontSize: 13,
        }}
      >
        처리된 요청이 없습니다
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxHeight: 400,
        overflowY: 'auto',
      }}
    >
      {visibleItems.map((record) => {
        const decision = DECISION_CONFIG[record.decision]
        return (
          <div
            key={record.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderBottom: '1px solid #222',
              fontFamily: 'monospace',
              fontSize: 11,
            }}
          >
            <span style={{ color: '#555', minWidth: 64, flexShrink: 0 }}>
              {formatTime(record.respondedAt)}
            </span>

            <SeverityBadge severity={record.request.severity} />

            <span
              style={{
                color: '#ccc',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {record.request.description}
            </span>

            <span
              style={{
                color: decision.color,
                fontWeight: 600,
                minWidth: 32,
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              {decision.label}
            </span>

            <span style={{ color: '#666', minWidth: 28, textAlign: 'right', flexShrink: 0 }}>
              {RESPONDED_BY_LABEL[record.respondedBy] ?? record.respondedBy}
            </span>
          </div>
        )
      })}
    </div>
  )
}
