// Server-side event bus for agent state changes
// Like a radio tower: notify POST writes events, SSE stream reads them

type Listener = (event: AgentEvent) => void

export interface AgentEvent {
  readonly type: 'spawn' | 'status' | 'complete' | 'remove' | 'message'
  readonly agentId: string
  readonly agentType?: string
  readonly name?: string
  readonly status?: string
  readonly tokenRate?: number
  readonly latencyMs?: number
  readonly message?: string
  readonly timestamp: number
}

const listeners = new Set<Listener>()

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function broadcast(event: AgentEvent): void {
  for (const listener of listeners) {
    listener(event)
  }
}
