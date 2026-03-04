import { NextResponse } from 'next/server'
import { getAgentById, updateAgent, deleteAgent } from '@/data/agentSettingsData'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const agent = getAgentById(id)
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }
  return NextResponse.json({ data: agent })
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = await request.json()
    const updated = updateAgent(id, body)
    if (!updated) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const deleted = deleteAgent(id)
  if (!deleted) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }
  return NextResponse.json({ message: 'Agent deleted' })
}
