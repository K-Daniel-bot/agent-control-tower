import { spawn, exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface ProcessInfo {
  name: string
  port?: number
  running: boolean
  uptime?: number
  logs: string[]
}

// Store process info in memory
const processCache = new Map<string, ProcessInfo>()

export async function GET() {
  const SERVERS = [
    { name: 'Next.js App', port: 3000 },
    { name: 'Terminal Server', port: 3001 },
  ]

  const statuses = await Promise.all(
    SERVERS.map(async (server) => {
      try {
        // Check if port is open
        const { stdout } = await execAsync(
          `lsof -i :${server.port} 2>/dev/null | grep -c LISTEN`,
          { timeout: 2000 }
        ).catch(() => ({ stdout: '0' }))

        const isRunning = parseInt(stdout) > 0
        const cached = processCache.get(server.name)

        return {
          name: server.name,
          port: server.port,
          status: isRunning ? 'running' : cached?.status === 'starting' ? 'starting' : 'idle',
          uptime: isRunning && cached?.uptime ? cached.uptime + 1 : undefined,
          logs: cached?.logs || [],
        }
      } catch {
        const cached = processCache.get(server.name)
        return {
          name: server.name,
          port: server.port,
          status: cached?.status || 'idle',
          uptime: cached?.uptime,
          logs: cached?.logs || ['Unable to check status'],
        }
      }
    })
  )

  return Response.json(statuses)
}
