import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(req: Request) {
  try {
    const { name } = await req.json()

    if (!name) {
      return Response.json({ error: 'Server name required' }, { status: 400 })
    }

    let port: number | null = null

    switch (name) {
      case 'Next.js App':
        port = 3000
        break
      case 'Terminal Server':
        port = 3001
        break
      default:
        return Response.json({ error: 'Unknown server' }, { status: 400 })
    }

    if (!port) {
      return Response.json({ error: 'Could not determine port' }, { status: 400 })
    }

    try {
      // Kill process on port
      await execAsync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`)
    } catch {
      // Process might already be stopped
    }

    return Response.json({
      message: `${name} stopped`,
      status: 'idle',
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
