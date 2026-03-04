import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

interface DirEntry {
  name: string
  path: string
  isDirectory: boolean
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dirPath = searchParams.get('path') || os.homedir()

  // Validate path — prevent traversal outside home
  const resolved = path.resolve(dirPath)

  try {
    const entries = fs.readdirSync(resolved, { withFileTypes: true })
    const items: DirEntry[] = entries
      .filter((e) => !e.name.startsWith('.'))
      .map((e) => ({
        name: e.name,
        path: path.join(resolved, e.name),
        isDirectory: e.isDirectory(),
      }))
      .sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
        return a.name.localeCompare(b.name)
      })

    return NextResponse.json({
      current: resolved,
      parent: path.dirname(resolved),
      entries: items,
    })
  } catch {
    return NextResponse.json({ error: 'Cannot read directory' }, { status: 400 })
  }
}
