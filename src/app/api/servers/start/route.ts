import { spawn } from 'child_process'
import path from 'path'

// Store active processes
const processes = new Map<string, NodeJS.Timeout>()

export async function POST(req: Request) {
  try {
    const { name } = await req.json()

    if (!name) {
      return Response.json({ error: 'Server name required' }, { status: 400 })
    }

    // Check if already running
    if (processes.has(name)) {
      return Response.json({ error: `${name} is already running` }, { status: 400 })
    }

    const baseDir = path.join(process.cwd())
    let command = ''
    let args: string[] = []

    switch (name) {
      case 'Next.js App':
        command = 'npm'
        args = ['run', 'dev']
        break
      case 'Terminal Server':
        command = 'npm'
        args = ['run', 'dev:terminal']
        break
      default:
        return Response.json({ error: 'Unknown server' }, { status: 400 })
    }

    // Start the process
    const proc = spawn(command, args, {
      cwd: baseDir,
      stdio: 'ignore',
      detached: true,
    })

    // Don't wait for process
    proc.unref()

    // Store timeout to track it
    const timeout = setTimeout(() => {
      processes.delete(name)
    }, 60000) // Remove from tracking after 1 minute

    processes.set(name, timeout)

    return Response.json({
      message: `${name} started`,
      status: 'starting',
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
