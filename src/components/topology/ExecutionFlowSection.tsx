'use client'

import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useOrchestra } from '@/context/AgentOrchestraContext'
import { useExecutionFlowLayout } from '@/hooks/useExecutionFlowLayout'
import { AgentNode } from './AgentNode'
import { CustomEdge } from './CustomEdge'
import { UserRequestNode } from './UserRequestNode'
import { WarningNode } from './WarningNode'
import SectionHeader from './SectionHeader'

const nodeTypes: NodeTypes = {
  agentNode: AgentNode,
  userRequestNode: UserRequestNode,
  warningNode: WarningNode,
}

const edgeTypes: EdgeTypes = {
  customEdge: CustomEdge,
}

function EmptyState() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#333333',
          animation: 'pulse-dot 2s ease-in-out infinite',
        }}
      />
      <span
        style={{
          fontSize: 11,
          color: '#505661',
          letterSpacing: '0.05em',
        }}
      >
        에이전트 대기 중...
      </span>
    </div>
  )
}

function FlowContent() {
  const { state } = useOrchestra()
  const { nodes, edges } = useExecutionFlowLayout(state)
  const { fitView } = useReactFlow()

  const onNodesChange = useCallback(() => {
    setTimeout(() => fitView({ padding: 0.3, duration: 300 }), 50)
  }, [fitView])

  // Trigger fitView when nodes count changes
  const isEmpty = nodes.length === 0

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {isEmpty && <EmptyState />}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        onInit={() => {
          setTimeout(() => fitView({ padding: 0.3, duration: 500 }), 100)
        }}
        onNodesChange={onNodesChange}
        proOptions={{ hideAttribution: true }}
        style={{ opacity: isEmpty ? 0.3 : 1, transition: 'opacity 0.5s' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#333333"
          gap={20}
          size={1}
        />
      </ReactFlow>
    </div>
  )
}

export function ExecutionFlowSection() {
  return (
    <div
      style={{
        flex: '4 1 0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      <SectionHeader title="Execution Flow (React Flow)" accentColor="#00ff88" />
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <ReactFlowProvider>
          <FlowContent />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default ExecutionFlowSection
