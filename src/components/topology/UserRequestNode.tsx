'use client'

import { Handle, Position } from '@xyflow/react'

export function UserRequestNode() {
  return (
    <div
      style={{
        width: 82,
        height: 52,
        background: 'rgba(241,245,249,0.07)',
        border: '1.5px solid rgba(226,232,240,0.4)',
        borderRadius: 26,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        boxShadow: '0 0 10px rgba(226,232,240,0.08)',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {/* Person icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill="#cbd5e1" opacity="0.85" />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke="#cbd5e1"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>

      <span
        style={{
          fontSize: 7.5,
          fontWeight: 700,
          color: '#94a3b8',
          letterSpacing: '0.04em',
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        USER{'\n'}REQUEST
      </span>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#64748b',
          border: '2px solid #64748b',
          width: 7,
          height: 7,
        }}
      />
    </div>
  )
}

export default UserRequestNode
