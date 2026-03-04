'use client'

import { ReactFlow, Background, BackgroundVariant, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AgentNode } from './AgentNode'
import { CustomEdge } from './CustomEdge'
import type { AgentNodeData } from './AgentNode'
import type { CustomEdgeData } from './CustomEdge'

// ─── Layout constants ────────────────────────────────────────────────
const COL_GAP = 120   // horizontal spacing between nodes
const ROW_GAP = 100   // vertical spacing between rows
const NODE_W = 80
const NODE_H = 60

function cx(col: number, totalCols: number): number {
  const totalWidth = (totalCols - 1) * COL_GAP
  return col * COL_GAP - totalWidth / 2
}

// ─── Node definitions ────────────────────────────────────────────────
type AppNode = Node<AgentNodeData>

const NODES: AppNode[] = [
  // Row 0: User Request (1 node)
  {
    id: 'user-1',
    type: 'agentNode',
    position: { x: cx(0, 1), y: 0 },
    data: { label: '사용자 요청', agentType: 'userRequest', status: 'active', tokenRate: 12 },
  },

  // Row 1: Planner Agent (2 nodes)
  {
    id: 'planner-1',
    type: 'agentNode',
    position: { x: cx(0, 2), y: ROW_GAP },
    data: { label: '플래너 A', agentType: 'planner', status: 'active', tokenRate: 48 },
  },
  {
    id: 'planner-2',
    type: 'agentNode',
    position: { x: cx(1, 2), y: ROW_GAP },
    data: { label: '플래너 B', agentType: 'planner', status: 'idle' },
  },

  // Row 2: Executor Agent (4 nodes)
  {
    id: 'exec-1',
    type: 'agentNode',
    position: { x: cx(0, 4), y: ROW_GAP * 2 },
    data: { label: '실행기 1', agentType: 'executor', status: 'active', tokenRate: 32 },
  },
  {
    id: 'exec-2',
    type: 'agentNode',
    position: { x: cx(1, 4), y: ROW_GAP * 2 },
    data: { label: '실행기 2', agentType: 'executor', status: 'active', tokenRate: 27 },
  },
  {
    id: 'exec-3',
    type: 'agentNode',
    position: { x: cx(2, 4), y: ROW_GAP * 2 },
    data: { label: '실행기 3', agentType: 'executor', status: 'warning', tokenRate: 15 },
  },
  {
    id: 'exec-4',
    type: 'agentNode',
    position: { x: cx(3, 4), y: ROW_GAP * 2 },
    data: { label: '실행기 4', agentType: 'executor', status: 'idle' },
  },

  // Row 3: Tool (6 nodes)
  {
    id: 'tool-1',
    type: 'agentNode',
    position: { x: cx(0, 6), y: ROW_GAP * 3 },
    data: { label: '도구 1', agentType: 'tool', status: 'active', tokenRate: 8 },
  },
  {
    id: 'tool-2',
    type: 'agentNode',
    position: { x: cx(1, 6), y: ROW_GAP * 3 },
    data: { label: '도구 2', agentType: 'tool', status: 'active', tokenRate: 11 },
  },
  {
    id: 'tool-3',
    type: 'agentNode',
    position: { x: cx(2, 6), y: ROW_GAP * 3 },
    data: { label: '도구 3', agentType: 'tool', status: 'active', tokenRate: 6 },
  },
  {
    id: 'tool-4',
    type: 'agentNode',
    position: { x: cx(3, 6), y: ROW_GAP * 3 },
    data: { label: '도구 4', agentType: 'tool', status: 'warning' },
  },
  {
    id: 'tool-5',
    type: 'agentNode',
    position: { x: cx(4, 6), y: ROW_GAP * 3 },
    data: { label: '도구 5', agentType: 'tool', status: 'idle' },
  },
  {
    id: 'tool-6',
    type: 'agentNode',
    position: { x: cx(5, 6), y: ROW_GAP * 3 },
    data: { label: '도구 6', agentType: 'tool', status: 'error' },
  },

  // Row 4: Verifier Agent (2 nodes)
  {
    id: 'verifier-1',
    type: 'agentNode',
    position: { x: cx(0, 2), y: ROW_GAP * 4 },
    data: { label: '검증기 A', agentType: 'verifier', status: 'active', tokenRate: 21 },
  },
  {
    id: 'verifier-2',
    type: 'agentNode',
    position: { x: cx(1, 2), y: ROW_GAP * 4 },
    data: { label: '검증기 B', agentType: 'verifier', status: 'idle' },
  },

  // Row 5: Result (1 node)
  {
    id: 'result-1',
    type: 'agentNode',
    position: { x: cx(0, 1), y: ROW_GAP * 5 },
    data: { label: '결과', agentType: 'result', status: 'active' },
  },
]

// ─── Edge definitions ─────────────────────────────────────────────────
type AppEdge = Edge<CustomEdgeData>

const EDGES: AppEdge[] = [
  // User → Planners
  { id: 'e-user-p1',    source: 'user-1',    target: 'planner-1', type: 'customEdge', data: { status: 'normal' } },
  { id: 'e-user-p2',    source: 'user-1',    target: 'planner-2', type: 'customEdge', data: { status: 'normal' } },

  // Planners → Executors
  { id: 'e-p1-e1',      source: 'planner-1', target: 'exec-1',    type: 'customEdge', data: { status: 'normal' } },
  { id: 'e-p1-e2',      source: 'planner-1', target: 'exec-2',    type: 'customEdge', data: { status: 'normal' } },
  { id: 'e-p2-e3',      source: 'planner-2', target: 'exec-3',    type: 'customEdge', data: { status: 'warning' } },
  { id: 'e-p2-e4',      source: 'planner-2', target: 'exec-4',    type: 'customEdge', data: { status: 'normal' } },

  // Executors → Tools
  { id: 'e-e1-t1',      source: 'exec-1',    target: 'tool-1',    type: 'customEdge', data: { status: 'normal' } },
  { id: 'e-e1-t2',      source: 'exec-1',    target: 'tool-2',    type: 'customEdge', data: { status: 'normal' } },
  { id: 'e-e2-t3',      source: 'exec-2',    target: 'tool-3',    type: 'customEdge', data: { status: 'normal' } },
  { id: 'e-e3-t4',      source: 'exec-3',    target: 'tool-4',    type: 'customEdge', data: { status: 'warning' } },
  { id: 'e-e4-t5',      source: 'exec-4',    target: 'tool-5',    type: 'customEdge', data: { status: 'normal' } },
  { id: 'e-e4-t6',      source: 'exec-4',    target: 'tool-6',    type: 'customEdge', data: { status: 'error' } },

  // Tools → Verifiers
  { id: 'e-t1-v1',      source: 'tool-1',    target: 'verifier-1', type: 'customEdge', data: { status: 'normal' } },
  { id: 'e-t2-v1',      source: 'tool-2',    target: 'verifier-1', type: 'customEdge', data: { status: 'normal' } },
  { id: 'e-t3-v1',      source: 'tool-3',    target: 'verifier-1', type: 'customEdge', data: { status: 'normal' } },
  { id: 'e-t4-v2',      source: 'tool-4',    target: 'verifier-2', type: 'customEdge', data: { status: 'warning' } },
  { id: 'e-t5-v2',      source: 'tool-5',    target: 'verifier-2', type: 'customEdge', data: { status: 'normal' } },
  { id: 'e-t6-v2',      source: 'tool-6',    target: 'verifier-2', type: 'customEdge', data: { status: 'error' } },

  // Verifiers → Result
  { id: 'e-v1-r',       source: 'verifier-1', target: 'result-1', type: 'customEdge', data: { status: 'normal' } },
  { id: 'e-v2-r',       source: 'verifier-2', target: 'result-1', type: 'customEdge', data: { status: 'normal' } },
]

// ─── Node / Edge type registries ──────────────────────────────────────
const nodeTypes = { agentNode: AgentNode }
const edgeTypes = { customEdge: CustomEdge }

// ─── Viewport offset: center the graph vertically in its container ───
const GRAPH_HEIGHT = ROW_GAP * 5 + NODE_H  // 560px
const defaultViewport = { x: 0, y: 0, zoom: 1 }

// ─── Component ────────────────────────────────────────────────────────
export default function TopologyMap() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
        position: 'relative',
      }}
    >
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.7); }
        }
      `}</style>

      <ReactFlow
        nodes={NODES}
        edges={EDGES}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={defaultViewport}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#1e2535"
          gap={20}
          size={1}
        />
      </ReactFlow>
    </div>
  )
}
