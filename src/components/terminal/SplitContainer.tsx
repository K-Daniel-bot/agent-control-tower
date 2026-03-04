'use client'

import type { PaneId, SplitNode, TerminalConfig } from '@/types/terminal'
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
  if (node.type === 'leaf') {
    return (
      <TerminalPane
        paneId={node.id}
        isActive={node.id === activePaneId}
        isVisible={isVisible}
        config={config}
        showCloseButton={totalLeaves > 1}
        onFocus={onPaneClick}
        onClose={onClosePane}
        onConnectionChange={onConnectionChange}
        registerSendCommand={registerSendCommand}
        unregisterSendCommand={unregisterSendCommand}
      />
    )
  }

  const isHorizontal = node.direction === 'horizontal'
  const firstSize = `${node.ratio * 100}%`
  const secondSize = `${(1 - node.ratio) * 100}%`

  const sharedProps = {
    activePaneId,
    isVisible,
    config,
    totalLeaves,
    onPaneClick,
    onClosePane,
    onConnectionChange,
    registerSendCommand,
    unregisterSendCommand,
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'column' : 'row',
        width: '100%',
        height: '100%',
        gap: 0,
      }}
    >
      <div style={{ [isHorizontal ? 'height' : 'width']: firstSize, overflow: 'hidden', minWidth: 0, minHeight: 0 }}>
        <SplitContainer node={node.first} {...sharedProps} />
      </div>

      {/* Divider */}
      <div
        style={{
          [isHorizontal ? 'height' : 'width']: 3,
          background: 'rgba(0,255,136,0.15)',
          flexShrink: 0,
          cursor: isHorizontal ? 'row-resize' : 'col-resize',
        }}
      />

      <div style={{ [isHorizontal ? 'height' : 'width']: secondSize, overflow: 'hidden', minWidth: 0, minHeight: 0 }}>
        <SplitContainer node={node.second} {...sharedProps} />
      </div>
    </div>
  )
}
