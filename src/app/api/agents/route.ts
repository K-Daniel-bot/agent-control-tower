import { NextResponse } from 'next/server'
import { getAgents, createAgent } from '@/data/agentSettingsData'
import type { AgentConfig } from '@/data/agentSettingsData'

export async function GET() {
  const agents = getAgents()
  return NextResponse.json({ data: agents, total: agents.length })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const requiredFields: (keyof Omit<AgentConfig, 'id' | 'createdAt' | 'updatedAt'>)[] = [
      'name', 'englishRole', 'model', 'status', 'maxTokens', 'temperature', 'systemPrompt', 'tools',
    ]
    const missing = requiredFields.filter((f) => !(f in body))
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    const agent = createAgent({
      name: body.name,
      englishRole: body.englishRole,
      model: body.model,
      status: body.status,
      maxTokens: body.maxTokens,
      temperature: body.temperature,
      systemPrompt: body.systemPrompt,
      tools: body.tools,
    })

    return NextResponse.json({ data: agent }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
