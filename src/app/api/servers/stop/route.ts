import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(req: Request) {
  try {
    const { id, port } = await req.json()

    if (!port) {
      return Response.json({ error: 'port is required' }, { status: 400 })
    }

    try {
      await execAsync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`)
    } catch {
      // Process might already be stopped
    }

    return Response.json({
      message: `Server on port ${port} stopped`,
      status: 'idle',
      id,
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
