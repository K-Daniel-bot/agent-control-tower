'use client'

import {
  createContext, useContext, useReducer, useCallback,
  useEffect, type ReactNode,
} from 'react'
import type { Node, Edge } from '@xyflow/react'
import type {
  WorkflowDefinition, WorkflowExecution, WorkflowNodeData,
  ExecutionStatus, ExecutionLogEntry,
} from '@/types/automation'

const uid = () => `wf-${Date.now()}-${Math.floor(Math.random() * 10000)}`

interface AutomationState {
  readonly workflows: readonly WorkflowDefinition[]
  readonly currentWorkflowId: string | null
  readonly nodes: readonly Node<WorkflowNodeData>[]
  readonly edges: readonly Edge[]
  readonly selectedNodeId: string | null
  readonly executions: readonly WorkflowExecution[]
  readonly isExecuting: boolean
}

type AutomationAction =
  | { type: 'SET_NODES'; nodes: Node<WorkflowNodeData>[] }
  | { type: 'SET_EDGES'; edges: Edge[] }
  | { type: 'ADD_NODE'; node: Node<WorkflowNodeData> }
  | { type: 'UPDATE_NODE_DATA'; nodeId: string; data: Partial<WorkflowNodeData> }
  | { type: 'DELETE_NODE'; nodeId: string }
  | { type: 'SELECT_NODE'; nodeId: string | null }
  | { type: 'SET_CURRENT_WORKFLOW'; workflowId: string | null }
  | { type: 'ADD_WORKFLOW'; workflow: WorkflowDefinition }
  | { type: 'START_EXECUTION'; executionId: string }
  | { type: 'UPDATE_EXECUTION'; executionId: string; status: ExecutionStatus; logs: readonly ExecutionLogEntry[] }
  | { type: 'FINISH_EXECUTION' }
  | { type: 'LOAD_STATE'; state: Partial<AutomationState> }

const DEFAULT_WORKFLOW: WorkflowDefinition = {
  id: 'wf-default',
  name: '새 워크플로우',
  description: '드래그 앤 드롭으로 워크플로우를 구성하세요',
  status: 'draft',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const INITIAL_NODES: Node<WorkflowNodeData>[] = [
  {
    id: 'trigger-1',
    type: 'triggerNode',
    position: { x: 250, y: 50 },
    data: {
      label: '스케줄 트리거',
      nodeType: 'trigger',
      config: { triggerType: 'schedule', cron: '0 9 * * *' },
      description: '매일 오전 9시 실행',
    },
  },
  {
    id: 'action-1',
    type: 'actionNode',
    position: { x: 250, y: 200 },
    data: {
      label: '데이터 수집',
      nodeType: 'action',
      config: { actionType: 'http_request', method: 'GET', url: 'https://api.example.com/data' },
      description: 'API에서 데이터 가져오기',
    },
  },
  {
    id: 'condition-1',
    type: 'conditionNode',
    position: { x: 250, y: 370 },
    data: {
      label: '데이터 검증',
      nodeType: 'condition',
      config: { operator: 'greater', field: 'count', value: '10' },
      description: '데이터가 10개 이상인지 확인',
    },
  },
  {
    id: 'action-2',
    type: 'actionNode',
    position: { x: 100, y: 540 },
    data: {
      label: '보고서 생성',
      nodeType: 'action',
      config: { actionType: 'agent_command', command: 'generate_report' },
      description: 'AI 에이전트에게 보고서 작성 명령',
    },
  },
  {
    id: 'action-3',
    type: 'actionNode',
    position: { x: 420, y: 540 },
    data: {
      label: '알림 전송',
      nodeType: 'action',
      config: { actionType: 'send_message', body: '데이터 부족 알림' },
      description: '관리자에게 알림 전송',
    },
  },
]

const INITIAL_EDGES: Edge[] = [
  { id: 'e-t1-a1', source: 'trigger-1', target: 'action-1', animated: true },
  { id: 'e-a1-c1', source: 'action-1', target: 'condition-1' },
  { id: 'e-c1-a2', source: 'condition-1', target: 'action-2', label: 'True', sourceHandle: 'true' },
  { id: 'e-c1-a3', source: 'condition-1', target: 'action-3', label: 'False', sourceHandle: 'false' },
]

const initialState: AutomationState = {
  workflows: [DEFAULT_WORKFLOW],
  currentWorkflowId: 'wf-default',
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  selectedNodeId: null,
  executions: [],
  isExecuting: false,
}

function automationReducer(state: AutomationState, action: AutomationAction): AutomationState {
  switch (action.type) {
    case 'SET_NODES':
      return { ...state, nodes: action.nodes }
    case 'SET_EDGES':
      return { ...state, edges: action.edges }
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.node] }
    case 'UPDATE_NODE_DATA': {
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id === action.nodeId
            ? { ...n, data: { ...n.data, ...action.data } }
            : n
        ),
      }
    }
    case 'DELETE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter(n => n.id !== action.nodeId),
        edges: state.edges.filter(e => e.source !== action.nodeId && e.target !== action.nodeId),
        selectedNodeId: state.selectedNodeId === action.nodeId ? null : state.selectedNodeId,
      }
    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.nodeId }
    case 'SET_CURRENT_WORKFLOW':
      return { ...state, currentWorkflowId: action.workflowId }
    case 'ADD_WORKFLOW':
      return { ...state, workflows: [...state.workflows, action.workflow] }
    case 'START_EXECUTION':
      return {
        ...state,
        isExecuting: true,
        executions: [...state.executions, {
          id: action.executionId,
          workflowId: state.currentWorkflowId ?? '',
          status: 'running',
          startedAt: Date.now(),
          logs: [],
        }],
      }
    case 'UPDATE_EXECUTION': {
      return {
        ...state,
        executions: state.executions.map(e =>
          e.id === action.executionId
            ? { ...e, status: action.status, logs: action.logs, completedAt: action.status !== 'running' ? Date.now() : undefined }
            : e
        ),
      }
    }
    case 'FINISH_EXECUTION':
      return { ...state, isExecuting: false }
    case 'LOAD_STATE':
      return { ...state, ...action.state }
    default:
      return state
  }
}

interface AutomationContextValue {
  readonly state: AutomationState
  readonly setNodes: (nodes: Node<WorkflowNodeData>[]) => void
  readonly setEdges: (edges: Edge[]) => void
  readonly addNode: (nodeType: string, position: { x: number; y: number }) => void
  readonly updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void
  readonly deleteNode: (nodeId: string) => void
  readonly selectNode: (nodeId: string | null) => void
  readonly runWorkflow: () => Promise<void>
}

const AutomationContext = createContext<AutomationContextValue | null>(null)

export function AutomationProvider({ children }: { readonly children: ReactNode }) {
  const [state, dispatch] = useReducer(automationReducer, initialState)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('act-automation-state')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.nodes && parsed.edges) {
          dispatch({ type: 'LOAD_STATE', state: parsed })
        }
      }
    } catch { /* ignore */ }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('act-automation-state', JSON.stringify({
        nodes: state.nodes,
        edges: state.edges,
        workflows: state.workflows,
        currentWorkflowId: state.currentWorkflowId,
      }))
    } catch { /* ignore */ }
  }, [state.nodes, state.edges, state.workflows, state.currentWorkflowId])

  const setNodes = useCallback((nodes: Node<WorkflowNodeData>[]) => {
    dispatch({ type: 'SET_NODES', nodes })
  }, [])

  const setEdges = useCallback((edges: Edge[]) => {
    dispatch({ type: 'SET_EDGES', edges })
  }, [])

  const addNode = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const id = uid()
    const typeMap: Record<string, string> = {
      trigger: 'triggerNode',
      condition: 'conditionNode',
      action: 'actionNode',
      parallel: 'parallelNode',
    }
    const labelMap: Record<string, string> = {
      trigger: '새 트리거',
      condition: '새 조건',
      action: '새 액션',
      parallel: '새 병렬',
    }
    const configMap: Record<string, Record<string, unknown>> = {
      trigger: { triggerType: 'manual' },
      condition: { operator: 'equals', field: '', value: '' },
      action: { actionType: 'http_request', method: 'GET', url: '' },
      parallel: { maxParallel: 3 },
    }

    const node: Node<WorkflowNodeData> = {
      id,
      type: typeMap[nodeType] ?? 'actionNode',
      position,
      data: {
        label: labelMap[nodeType] ?? '새 노드',
        nodeType: nodeType as WorkflowNodeData['nodeType'],
        config: configMap[nodeType] ?? {},
      },
    }
    dispatch({ type: 'ADD_NODE', node })
  }, [])

  const updateNodeData = useCallback((nodeId: string, data: Partial<WorkflowNodeData>) => {
    dispatch({ type: 'UPDATE_NODE_DATA', nodeId, data })
  }, [])

  const deleteNode = useCallback((nodeId: string) => {
    dispatch({ type: 'DELETE_NODE', nodeId })
  }, [])

  const selectNode = useCallback((nodeId: string | null) => {
    dispatch({ type: 'SELECT_NODE', nodeId })
  }, [])

  const runWorkflow = useCallback(async () => {
    const execId = uid()
    dispatch({ type: 'START_EXECUTION', executionId: execId })

    const logs: ExecutionLogEntry[] = []
    const nodeOrder = [...state.nodes]

    for (const node of nodeOrder) {
      logs.push({
        timestamp: Date.now(),
        nodeId: node.id,
        nodeName: node.data.label,
        status: 'started',
        message: `${node.data.label} 실행 시작`,
      })
      dispatch({ type: 'UPDATE_EXECUTION', executionId: execId, status: 'running', logs: [...logs] })

      // Simulate execution delay
      await new Promise(r => setTimeout(r, 500 + Math.random() * 1500))

      const failed = Math.random() < 0.1
      logs.push({
        timestamp: Date.now(),
        nodeId: node.id,
        nodeName: node.data.label,
        status: failed ? 'failed' : 'completed',
        message: failed ? `${node.data.label} 실행 실패: 타임아웃` : `${node.data.label} 완료`,
        duration: Math.floor(500 + Math.random() * 1500),
      })

      if (failed) {
        dispatch({ type: 'UPDATE_EXECUTION', executionId: execId, status: 'failed', logs: [...logs] })
        dispatch({ type: 'FINISH_EXECUTION' })
        return
      }

      dispatch({ type: 'UPDATE_EXECUTION', executionId: execId, status: 'running', logs: [...logs] })
    }

    dispatch({ type: 'UPDATE_EXECUTION', executionId: execId, status: 'completed', logs: [...logs] })
    dispatch({ type: 'FINISH_EXECUTION' })
  }, [state.nodes])

  const value: AutomationContextValue = {
    state, setNodes, setEdges, addNode,
    updateNodeData, deleteNode, selectNode, runWorkflow,
  }

  return (
    <AutomationContext.Provider value={value}>
      {children}
    </AutomationContext.Provider>
  )
}

export function useAutomation(): AutomationContextValue {
  const ctx = useContext(AutomationContext)
  if (!ctx) throw new Error('useAutomation must be used within AutomationProvider')
  return ctx
}
