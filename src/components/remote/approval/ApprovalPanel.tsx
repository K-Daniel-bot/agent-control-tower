'use client'

import React, { useState } from 'react'
import type { ApprovalRequest, ApprovalRecord } from '@/types/remote'
import ApprovalQueue from './ApprovalQueue'
import ApprovalHistory from './ApprovalHistory'

type TabType = 'pending' | 'history'

interface ApprovalPanelProps {
  readonly queue: readonly ApprovalRequest[]
  readonly history: readonly ApprovalRecord[]
  readonly onApprove: (id: string) => void
  readonly onDeny: (id: string) => void
}

export default function ApprovalPanel({ queue, history, onApprove, onDeny }: ApprovalPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pending')

  const pendingCount = queue.filter((r) => r.status === 'pending').length

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    border: 'none',
    borderBottom: isActive ? '2px solid #00ff88' : '2px solid transparent',
    backgroundColor: 'transparent',
    color: isActive ? '#00ff88' : '#888',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: isActive ? 600 : 400,
    cursor: 'pointer',
    transition: 'color 0.2s, border-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  })

  return (
    <div
      style={{
        border: '1px solid #333333',
        borderRadius: 6,
        backgroundColor: 'transparent',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #333333',
        }}
      >
        <button
          onClick={() => setActiveTab('pending')}
          style={tabStyle(activeTab === 'pending')}
        >
          승인 대기
          {pendingCount > 0 && (
            <span
              style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 9999,
                minWidth: 18,
                textAlign: 'center',
                lineHeight: '14px',
              }}
            >
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={tabStyle(activeTab === 'history')}
        >
          처리 완료
        </button>
      </div>

      <div style={{ padding: 12 }}>
        {activeTab === 'pending' ? (
          <ApprovalQueue queue={queue} onApprove={onApprove} onDeny={onDeny} />
        ) : (
          <ApprovalHistory history={history} />
        )}
      </div>
    </div>
  )
}
