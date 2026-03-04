import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

interface AgentSaveBody {
  id: string
  name: string
  rank: string
  roleType: string
  roleLabel: string
  roleDescription: string
  inferredSummary: string
  skills: readonly string[]
  icon?: string
  createdAt: number
}

function buildAgentMarkdown(agent: AgentSaveBody): string {
  return [
    '---',
    `description: ${agent.inferredSummary || agent.roleLabel}`,
    '---',
    '',
    `# ${agent.icon ?? '🤖'} ${agent.name}`,
    '',
    `**직급**: ${agent.rank}  `,
    `**역할**: ${agent.roleLabel} (${agent.roleType})  `,
    `**생성일**: ${new Date(agent.createdAt).toLocaleDateString('ko-KR')}`,
    '',
    '## 역할 설명',
    '',
    agent.roleDescription || '(설명 없음)',
    '',
    '## 추론된 역할',
    '',
    agent.inferredSummary || agent.roleLabel,
    '',
    '## 스킬',
    '',
    agent.skills.map(s => `- \`${s}\``).join('\n'),
  ].join('\n')
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as AgentSaveBody

    if (!body.id || !body.name) {
      return NextResponse.json({ error: 'id and name required' }, { status: 400 })
    }

    const agentsDir = path.join(os.homedir(), '.claude', 'agents')
    fs.mkdirSync(agentsDir, { recursive: true })

    const fileName = `${body.id.replace(/[^a-zA-Z0-9-_]/g, '-')}.md`
    const filePath = path.join(agentsDir, fileName)
    fs.writeFileSync(filePath, buildAgentMarkdown(body), 'utf-8')

    return NextResponse.json({ path: filePath })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Save failed' },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const agentsDir = path.join(os.homedir(), '.claude', 'agents')

    if (!fs.existsSync(agentsDir)) {
      return NextResponse.json({ agents: [], dir: agentsDir })
    }

    const files = fs.readdirSync(agentsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const filePath = path.join(agentsDir, f)
        const content = fs.readFileSync(filePath, 'utf-8')
        const descMatch = content.match(/^description:\s*(.+)$/m)
        const titleMatch = content.match(/^#\s+(.+)$/m)
        return {
          fileName: f,
          path: filePath,
          name: titleMatch?.[1]?.replace(/^[^\s]+\s+/, '') ?? f.replace('.md', ''),
          description: descMatch?.[1] ?? '',
        }
      })

    return NextResponse.json({ agents: files, dir: agentsDir })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Read failed' },
      { status: 500 },
    )
  }
}
