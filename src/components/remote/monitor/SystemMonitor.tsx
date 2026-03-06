'use client'

import React from 'react'
import { NocTheme } from '@/constants/nocTheme'
import ResourceUsage from './ResourceUsage'
import NetworkActivity from './NetworkActivity'
import ThreatDetector from './ThreatDetector'

const cardStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 12px',
  minWidth: 0,
}

const dividerStyle: React.CSSProperties = {
  width: 1,
  alignSelf: 'stretch',
  backgroundColor: NocTheme.border,
  flexShrink: 0,
}

export default function SystemMonitor() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        backgroundColor: NocTheme.surface,
        border: `1px solid ${NocTheme.border}`,
        borderRadius: 4,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace",
        overflow: 'hidden',
      }}
    >
      {/* CPU */}
      <div style={cardStyle}>
        <ResourceUsage type="cpu" />
      </div>

      <div style={dividerStyle} />

      {/* RAM */}
      <div style={cardStyle}>
        <ResourceUsage type="ram" />
      </div>

      <div style={dividerStyle} />

      {/* Network */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <NetworkActivity />
      </div>

      <div style={dividerStyle} />

      {/* Security Status */}
      <div style={cardStyle}>
        <ThreatDetector />
      </div>
    </div>
  )
}
