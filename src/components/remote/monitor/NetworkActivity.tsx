'use client'

import React from 'react'
import { NocTheme } from '@/constants/nocTheme'
import { useRemote } from '../context/RemoteContext'

const HIGH_TRAFFIC_THRESHOLD = 5000

function formatSpeed(kbps: number): string {
  if (kbps >= 1024) return `${(kbps / 1024).toFixed(1)} MB/s`
  return `${kbps.toFixed(0)} KB/s`
}

function getSpeedColor(kbps: number): string {
  if (kbps > HIGH_TRAFFIC_THRESHOLD) return NocTheme.orange
  return NocTheme.green
}

export default function NetworkActivity() {
  const { state } = useRemote()
  const { upload, download } = state.systemMetrics.network

  const uploadColor = getSpeedColor(upload)
  const downloadColor = getSpeedColor(download)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, color: uploadColor }}>{'▲'}</span>
        <span
          style={{
            fontSize: 11,
            color: uploadColor,
            minWidth: 70,
            textAlign: 'right',
            transition: 'color 0.3s ease',
          }}
        >
          {formatSpeed(upload)}
        </span>
      </div>
      <div
        style={{
          width: 1,
          height: 16,
          backgroundColor: NocTheme.border,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, color: downloadColor }}>{'▼'}</span>
        <span
          style={{
            fontSize: 11,
            color: downloadColor,
            minWidth: 70,
            textAlign: 'right',
            transition: 'color 0.3s ease',
          }}
        >
          {formatSpeed(download)}
        </span>
      </div>
    </div>
  )
}
