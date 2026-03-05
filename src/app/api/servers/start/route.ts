import { spawn } from 'child_process'
import { existsSync } from 'fs'

export const dynamic = 'force-dynamic'

// Track running PIDs in memory for this server instance
const runningPids = new Map<string, number>()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, name, command, cwd } = body

    if (!command) {
      return Response.json({ error: 'command is required' }, { status: 400 })
    }

    const workDir = cwd || process.cwd()

    if (!existsSync(workDir)) {
      return Response.json(
        { error: `Working directory does not exist: ${workDir}` },
        { status: 400 }
      )
    }

    const proc = spawn(command, [], {
      cwd: workDir,
      stdio: 'ignore',
      detached: true,
      shell: true,
    })

    if (proc.pid) {
      runningPids.set(id ?? name, proc.pid)
    }

    proc.unref()

    return Response.json({
      message: `${name || id} started`,
      status: 'starting',
      pid: proc.pid,
      cwd: workDir,
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
