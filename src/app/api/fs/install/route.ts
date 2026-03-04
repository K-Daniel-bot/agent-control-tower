import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

interface InstallSkillBody {
  dirPath: string
  skill: {
    id: string
    name: string
    nameKo: string
    description: string
    detailedDescription: string
    command: string
    tags: readonly string[]
  }
}

function buildContent(skill: InstallSkillBody['skill']): string {
  return [
    '---',
    `description: ${skill.description}`,
    '---',
    '',
    `# ${skill.name} (${skill.nameKo})`,
    '',
    '## 명령어',
    '',
    '```bash',
    skill.command,
    '```',
    '',
    '## 상세 설명',
    '',
    skill.detailedDescription,
    '',
    '## 태그',
    '',
    skill.tags.map(t => `\`${t}\``).join(', '),
  ].join('\n')
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as InstallSkillBody
    const { dirPath, skill } = body

    if (!dirPath || !skill?.id) {
      return NextResponse.json({ error: 'dirPath and skill required' }, { status: 400 })
    }

    const resolved = path.resolve(dirPath)

    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
      return NextResponse.json({ error: 'Directory not found' }, { status: 404 })
    }

    const content = buildContent(skill)
    const fileName = `${skill.id}.md`

    // 1) .claude/skills/
    const claudeSkillsDir = path.join(resolved, '.claude', 'skills')
    fs.mkdirSync(claudeSkillsDir, { recursive: true })
    const claudePath = path.join(claudeSkillsDir, fileName)
    fs.writeFileSync(claudePath, content, 'utf-8')

    // 2) .agents/skills/
    const agentsSkillsDir = path.join(resolved, '.agents', 'skills')
    fs.mkdirSync(agentsSkillsDir, { recursive: true })
    const agentsPath = path.join(agentsSkillsDir, fileName)
    fs.writeFileSync(agentsPath, content, 'utf-8')

    return NextResponse.json({
      paths: [claudePath, agentsPath],
      dirs: [claudeSkillsDir, agentsSkillsDir],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Install failed' },
      { status: 500 },
    )
  }
}
