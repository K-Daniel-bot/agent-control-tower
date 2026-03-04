'use client'

import { useMemo } from 'react'
import type { PaneId, SplitNode, TerminalConfig } from '@/types/terminal'
import { collectLeafIds } from '@/utils/splitTreeUtils'
import TerminalPane from './TerminalPane'

interface SplitContainerProps {
  readonly node: SplitNode
  readonly activePaneId: PaneId
  readonly isVisible: boolean
  readonly config: TerminalConfig
  readonly totalLeaves: number
  readonly onPaneClick: (paneId: PaneId) => void
  readonly onClosePane: (paneId: PaneId) => void
  readonly onConnectionChange: (paneId: PaneId, status: 'connected' | 'disconnected' | 'connecting') => void
  readonly registerSendCommand: (paneId: PaneId, sender: (cmd: string) => void) => void
  readonly unregisterSendCommand: (paneId: PaneId) => void
}

interface Rect { left: number; top: number; width: number; height: number }
interface Divider extends Rect { direction: 'horizontal' | 'vertical' }

function computeRects(node: SplitNode, rect: Rect): Map<PaneId, Rect> {
  if (node.type === 'leaf') return new Map([[node.id, rect]])
  const isH = node.direction === 'horizontal'
  const r = node.ratio
  const first: Rect = isH
    ? { ...rect, height: rect.height * r }
    : { ...rect, width: rect.width * r }
  const second: Rect = isH
    ? { ...rect, top: rect.top + rect.height * r, height: rect.height * (1 - r) }
    : { ...rect, left: rect.left + rect.width * r, width: rect.width * (1 - r) }
  return new Map([...computeRects(node.first, first), ...computeRects(node.second, second)])
}

function computeDividers(node: SplitNode, rect: Rect): Divider[] {
  if (node.type === 'leaf') return []
  const isH = node.direction === 'horizontal'
  const r = node.ratio
  const divider: Divider = isH
    ? { left: rect.left, top: rect.top + rect.height * r, width: rect.width, height: 0, direction: 'horizontal' }
    : { left: rect.left + rect.width * r, top: rect.top, width: 0, height: rect.height, direction: 'vertical' }
  const first: Rect = isH ? { ...rect, height: rect.height * r } : { ...rect, width: rect.width * r }
  const second: Rect = isH
    ? { ...rect, top: rect.top + rect.height * r, height: rect.height * (1 - r) }
    : { ...rect, left: rect.left + rect.width * r, width: rect.width * (1 - r) }
  return [divider, ...computeDividers(node.first, first), ...computeDividers(node.second, second)]
}

const ROOT_RECT: Rect = { left: 0, top: 0, width: 100, height: 100 }

// Flat absolute-positioned layout.
// All TerminalPanes render at the same React tree depth — they are NEVER
// unmounted when the split tree changes. Only their CSS position/size updates.
export default function SplitContainer({
  node,
  activePaneId,
  isVisible,
  config,
  totalLeaves,
  onPaneClick,
  onClosePane,
  onConnectionChange,
  registerSendCommand,
  unregisterSendCommand,
}: SplitContainerProps) {
  const rects = useMemo(() => computeRects(node, ROOT_RECT), [node])
  const dividers = useMemo(() => computeDividers(node, ROOT_RECT), [node])
  const leafIds = useMemo(() => collectLeafIds(node), [node])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Dividers */}
      {dividers.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.direction === 'vertical' ? 3 : `${d.width}%`,
            height: d.direction === 'horizontal' ? 3 : `${d.height}%`,
            background: 'rgba(0,255,136,0.2)',
            zIndex: 1,
            cursor: d.direction === 'horizontal' ? 'row-resize' : 'col-resize',
          }}
        />
      ))}

      {/* Panes — stable keys, never unmount on split/close */}
      {leafIds.map((paneId) => {
        const rect = rects.get(paneId)
        if (!rect) return null
        return (
          <div
            key={paneId}
            style={{
              position: 'absolute',
              left: `${rect.left}%`,
              top: `${rect.top}%`,
              width: `${rect.width}%`,
              height: `${rect.height}%`,
              overflow: 'hidden',
            }}
          >
            <TerminalPane
              paneId={paneId}
              isActive={paneId === activePaneId}
              isVisible={isVisible}
              config={config}
              showCloseButton={totalLeaves > 1}
              onFocus={onPaneClick}
              onClose={onClosePane}
              onConnectionChange={onConnectionChange}
              registerSendCommand={registerSendCommand}
              unregisterSendCommand={unregisterSendCommand}
            />
          </div>
        )
      })}
    </div>
  )
}
