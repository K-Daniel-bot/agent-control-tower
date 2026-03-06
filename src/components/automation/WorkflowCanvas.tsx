'use client'

import { useCallback, useMemo } from 'react'
import {
  ReactFlow, Background, BackgroundVariant, Controls,
  type OnNodesChange, type OnEdgesChange, type OnConnect,
  type NodeTypes, type Connection,
  applyNodeChanges, applyEdgeChanges, addEdge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import TriggerNode from './nodes/TriggerNode'
import ConditionNode from './nodes/ConditionNode'
import ActionNode from './nodes/ActionNode'
import ParallelNode from './nodes/ParallelNode'
import { useAutomation } from './context/AutomationContext'
import type { WorkflowNodeData } from '@/types/automation'
import type { Node, Edge } from '@xyflow/react'

const nodeTypes: NodeTypes = {
  triggerNode: TriggerNode,
  conditionNode: ConditionNode,
  actionNode: ActionNode,
  parallelNode: ParallelNode,
}

export default function WorkflowCanvas() {
  const { state, setNodes, setEdges, selectNode } = useAutomation()
  const { nodes, edges } = state

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    const updated = applyNodeChanges(changes, [...nodes] as Node<WorkflowNodeData>[])
    setNodes(updated as Node<WorkflowNodeData>[])
  }, [nodes, setNodes])

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    const updated = applyEdgeChanges(changes, [...edges] as Edge[])
    setEdges(updated)
  }, [edges, setEdges])

  const onConnect: OnConnect = useCallback((connection: Connection) => {
    const updated = addEdge({ ...connection, animated: false }, [...edges] as Edge[])
    setEdges(updated)
  }, [edges, setEdges])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id)
  }, [selectNode])

  const onPaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  const defaultEdgeOptions = useMemo(() => ({
    style: { stroke: '#444', strokeWidth: 2 },
    type: 'smoothstep' as const,
  }), [])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={[...nodes] as Node[]}
        edges={[...edges] as Edge[]}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable
        nodesConnectable
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#000000' }}
      >
        <Background variant={BackgroundVariant.Dots} color="#222" gap={20} size={1} />
        <Controls
          showInteractive={false}
          style={{
            background: '#111',
            border: '1px solid #333',
            borderRadius: 6,
          }}
        />
      </ReactFlow>
    </div>
  )
}
