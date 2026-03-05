import { readdir, stat, readFile } from 'fs/promises'
import path from 'path'
import os from 'os'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'

export const dynamic = 'force-dynamic'

const PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects')
const WORKLOG_FILE = path.join(os.homedir(), '.claude', 'work-log', 'buffer.jsonl')

interface MemoryFileInfo {
  path: string
  name: string
  sizeBytes: number
  modifiedAt: string
}

interface ProjectInfo {
  projectName: string
  projectPath: string
  projectDir: string
  files: MemoryFileInfo[]
  sessionCount: number
  lastActivity: string
}

interface SessionInfo {
  sessionId: string
  projectName: string
  cwd: string
  prompt: string
  startedAt: string
  endedAt?: string
  toolUses: { toolName: string; timestamp: string; isMcp: boolean; mcpServer?: string }[]
  writeCount: number
}

function dirNameToProjectName(dirName: string): string {
  // Convert "-Users-daniel-Desktop-agent-control-tower" to "agent control tower"
  const parts = dirName.replace(/^-/, '').split('-')
  // Find the last meaningful segment (after Desktop/ or the project name)
  const desktopIdx = parts.indexOf('Desktop')
  if (desktopIdx >= 0 && desktopIdx + 1 < parts.length) {
    return parts.slice(desktopIdx + 1).join(' ')
  }
  // Fallback: last part
  return parts[parts.length - 1] || dirName
}

function dirNameToPath(dirName: string): string {
  return dirName.replace(/^-/, '/').replace(/-/g, '/')
}

async function scanMemoryFiles(dirPath: string): Promise<MemoryFileInfo[]> {
  const results: MemoryFileInfo[] = []
  try {
    const memoryDir = path.join(dirPath, 'memory')
    const entries = await readdir(memoryDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.json') || entry.name.endsWith('.txt'))) {
        const fullPath = path.join(memoryDir, entry.name)
        try {
          const fileStat = await stat(fullPath)
          results.push({
            path: fullPath,
            name: entry.name,
            sizeBytes: fileStat.size,
            modifiedAt: fileStat.mtime.toISOString(),
          })
        } catch { /* skip */ }
      }
    }
  } catch { /* no memory dir */ }
  return results
}

async function parseWorkLog(): Promise<SessionInfo[]> {
  const sessions = new Map<string, SessionInfo>()

  try {
    const rl = createInterface({
      input: createReadStream(WORKLOG_FILE),
      crlfDelay: Infinity,
    })

    for await (const line of rl) {
      try {
        const obj = JSON.parse(line)
        const ev = obj.event
        const sid = obj.session_id

        if (ev === 'session_start') {
          sessions.set(sid, {
            sessionId: sid,
            projectName: obj.project_name ?? '',
            cwd: obj.cwd ?? '',
            prompt: (obj.prompt ?? '').slice(0, 200),
            startedAt: obj.ts ?? '',
            toolUses: [],
            writeCount: 0,
          })
        } else if (ev === 'tool_use' && sessions.has(sid)) {
          const session = sessions.get(sid)!
          const toolName = obj.tool_name ?? ''
          const toolUse = {
            toolName,
            timestamp: obj.ts ?? '',
            isMcp: obj.is_mcp ?? false,
            mcpServer: obj.mcp_server ?? undefined,
          }
          const isWrite = toolName === 'Write' || toolName === 'Edit'
          sessions.set(sid, {
            ...session,
            toolUses: [...session.toolUses, toolUse],
            writeCount: session.writeCount + (isWrite ? 1 : 0),
          })
        } else if (ev === 'session_end' && sessions.has(sid)) {
          const session = sessions.get(sid)!
          sessions.set(sid, { ...session, endedAt: obj.ts })
        }
      } catch { /* skip malformed line */ }
    }
  } catch { /* file not found */ }

  return Array.from(sessions.values())
    .filter((s) => !s.projectName.startsWith('octo-orch'))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
}

export async function GET() {
  // 1. Scan project memory directories
  const projects: ProjectInfo[] = []
  try {
    const entries = await readdir(PROJECTS_DIR, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue
      if (entry.name.startsWith('octo-orch') || entry.name.startsWith('-private-tmp')) continue

      const projectDir = path.join(PROJECTS_DIR, entry.name)
      const files = await scanMemoryFiles(projectDir)

      // Count jsonl session files
      let sessionCount = 0
      let lastActivity = ''
      try {
        const allFiles = await readdir(projectDir)
        for (const f of allFiles) {
          if (f.endsWith('.jsonl')) {
            sessionCount++
            const jsonlStat = await stat(path.join(projectDir, f))
            const modTime = jsonlStat.mtime.toISOString()
            if (modTime > lastActivity) lastActivity = modTime
          }
        }
      } catch { /* skip */ }

      // Also check memory file dates
      for (const f of files) {
        if (f.modifiedAt > lastActivity) lastActivity = f.modifiedAt
      }

      projects.push({
        projectName: dirNameToProjectName(entry.name),
        projectPath: dirNameToPath(entry.name),
        projectDir: entry.name,
        files,
        sessionCount,
        lastActivity,
      })
    }
  } catch { /* projects dir doesn't exist */ }

  // Sort by last activity
  projects.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())

  // 2. Parse work-log for session history
  const sessions = await parseWorkLog()

  // 3. Stats
  const totalMemoryFiles = projects.reduce((sum, p) => sum + p.files.length, 0)
  const totalSizeBytes = projects.reduce(
    (sum, p) => sum + p.files.reduce((s, f) => s + f.sizeBytes, 0),
    0
  )

  return Response.json({
    projects,
    sessions,
    totalMemoryFiles,
    totalSessions: sessions.length,
    totalSizeBytes,
  })
}
