'use client'

import React from 'react'
import type { ApprovalRequest } from '@/types/remote'
import SeverityBadge from './SeverityBadge'

interface ApprovalQueueProps {
  readonly queue: readonly ApprovalRequest[]
  readonly onApprove: (id: string) => void
  readonly onDeny: (id: string) => void
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const buttonBase: React.CSSProperties = {
  padding: '4px 12px', border: 'none', borderRadius: 4,
  fontSize: 11, fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer',
}

export default function ApprovalQueue({ queue, onApprove, onDeny }: ApprovalQueueProps) {
  if (queue.length === 0) {
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
        대기 중인 승인 요청이 없습니다
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {queue.map((item, index) => (
        <div
          key={item.id}
          style={{
            padding: 12,
            border: '1px solid #333333',
            borderRadius: 6,
            backgroundColor: 'rgba(255,255,255,0.02)',
            animation: 'fadeSlideIn 0.3s ease-out',
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <SeverityBadge severity={item.severity} />
            {item.severity === 'low' && (
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: '#10b981',
                  backgroundColor: 'rgba(16,185,129,0.12)',
                  padding: '1px 6px',
                  borderRadius: 4,
                }}
              >
                자동 실행
              </span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#666', fontFamily: 'monospace' }}>
              {formatTime(item.timestamp)}
            </span>
          </div>

          <div style={{ fontSize: 12, color: '#e0e0e0', fontFamily: 'monospace', marginBottom: 4 }}>
            {item.description}
          </div>

          <div style={{ fontSize: 11, color: '#888', fontFamily: 'monospace', marginBottom: 8 }}>
            대상: {item.target}
          </div>

          {item.severity === 'high' && (
            <div
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#ef4444',
                backgroundColor: 'rgba(239,68,68,0.08)',
                padding: '4px 8px',
                borderRadius: 4,
                marginBottom: 8,
                borderLeft: '2px solid #ef4444',
              }}
            >
              이중 검증 필요
            </div>
          )}

          {item.severity === 'blocked' ? (
            <div
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#6b7280',
                fontWeight: 600,
              }}
            >
              차단됨
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onApprove(item.id)}
                style={{
                  ...buttonBase,
                  backgroundColor: 'rgba(16,185,129,0.15)',
                  color: '#10b981',
                }}
              >
                승인
              </button>
              <button
                onClick={() => onDeny(item.id)}
                style={{
                  ...buttonBase,
                  backgroundColor: 'rgba(239,68,68,0.15)',
                  color: '#ef4444',
                }}
              >
                거부
              </button>
            </div>
          )}

          <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
      ))}
    </div>
  )
}
