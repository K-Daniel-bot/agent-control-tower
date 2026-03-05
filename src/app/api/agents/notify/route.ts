import { NextResponse } from 'next/server'
import { broadcast, type AgentEvent } from '@/lib/agentEventBus'

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()

    const { type, agentId } = body
    if (!type || !agentId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, agentId' },
        { status: 400 }
      )
    }

    const validTypes = ['spawn', 'status', 'complete', 'remove', 'message']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const event: AgentEvent = {
      type: body.type,
      agentId: body.agentId,
      agentType: body.agentType,
      name: body.name,
      status: body.status,
      tokenRate: body.tokenRate,
      latencyMs: body.latencyMs,
      message: body.message,
      timestamp: Date.now(),
    }

    broadcast(event)

    return NextResponse.json({ ok: true, event })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
