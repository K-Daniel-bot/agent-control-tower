import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface ServerQuery {
  id: string
  name: string
  port: number
}

// Track uptime per server
const uptimeTracker = new Map<string, number>()

export async function GET() {
  // Legacy support: hardcoded servers
  const servers: ServerQuery[] = [
    { id: 'nextjs', name: 'Next.js App', port: 3000 },
    { id: 'terminal', name: 'Terminal Server', port: 3001 },
  ]
  return checkServers(servers)
}

export async function POST(req: Request) {
  try {
    const { servers } = await req.json() as { servers: ServerQuery[] }
    if (!servers || !Array.isArray(servers)) {
      return Response.json({ error: 'servers array required' }, { status: 400 })
    }
    return checkServers(servers)
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}

async function checkServers(servers: ServerQuery[]) {
  const statuses = await Promise.all(
    servers.map(async (server) => {
      try {
        const { stdout } = await execAsync(
          `lsof -i :${server.port} 2>/dev/null | grep -c LISTEN`,
          { timeout: 2000 }
        ).catch(() => ({ stdout: '0' }))

        const isRunning = parseInt(stdout.trim()) > 0

        if (isRunning) {
          const current = uptimeTracker.get(server.id) ?? 0
          uptimeTracker.set(server.id, current + 2)
        } else {
          uptimeTracker.delete(server.id)
        }

        return {
          id: server.id,
          name: server.name,
          port: server.port,
          status: isRunning ? 'running' : 'idle',
          uptime: isRunning ? uptimeTracker.get(server.id) : undefined,
          logs: [],
        }
      } catch {
        return {
          id: server.id,
          name: server.name,
          port: server.port,
          status: 'idle',
          uptime: undefined,
          logs: [],
        }
      }
    })
  )

  return Response.json(statuses)
}
