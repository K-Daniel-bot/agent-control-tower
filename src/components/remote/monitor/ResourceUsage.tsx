'use client'

import React from 'react'
import { NocTheme } from '@/constants/nocTheme'
import { useRemote } from '../context/RemoteContext'

interface ResourceUsageProps {
  readonly type: 'cpu' | 'ram' | 'disk'
}

const LABELS: Record<string, string> = {
  cpu: 'CPU',
  ram: 'RAM',
  disk: 'DISK',
}

const ICONS: Record<string, string> = {
  cpu: '\u2699',
  ram: '\u26A1',
  disk: '\u25CF',
}

function getBarColor(percent: number): string {
  if (percent > 80) return NocTheme.red
  if (percent > 50) return NocTheme.orange
  return NocTheme.green
}

function formatValue(
  type: string,
  metrics: { readonly cpu: number; readonly ram: { readonly used: number; readonly total: number }; readonly disk: { readonly used: number; readonly total: number } }
): string {
  if (type === 'cpu') return `${metrics.cpu}%`
  if (type === 'ram') return `${metrics.ram.used.toFixed(1)}G / ${metrics.ram.total}G`
  return `${metrics.disk.used.toFixed(0)}G / ${metrics.disk.total}G`
}

function getPercent(
  type: string,
  metrics: { readonly cpu: number; readonly ram: { readonly used: number; readonly total: number }; readonly disk: { readonly used: number; readonly total: number } }
): number {
  if (type === 'cpu') return metrics.cpu
  if (type === 'ram') return (metrics.ram.used / metrics.ram.total) * 100
  return (metrics.disk.used / metrics.disk.total) * 100
}

export default function ResourceUsage({ type }: ResourceUsageProps) {
  const { state } = useRemote()
  const { systemMetrics } = state

  const percent = getPercent(type, systemMetrics)
  const color = getBarColor(percent)
  const value = formatValue(type, systemMetrics)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <span style={{ fontSize: 14, color, flexShrink: 0 }}>{ICONS[type]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 10, color: NocTheme.textSecondary, fontFamily: 'monospace' }}>
            {LABELS[type]}
          </span>
          <span style={{ fontSize: 10, color: NocTheme.textPrimary, fontFamily: 'monospace' }}>
            {value}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: 4,
            backgroundColor: NocTheme.border,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(percent, 100)}%`,
              height: '100%',
              backgroundColor: color,
              borderRadius: 2,
              transition: 'width 0.6s ease, background-color 0.3s ease',
            }}
          />
        </div>
      </div>
    </div>
  )
}
