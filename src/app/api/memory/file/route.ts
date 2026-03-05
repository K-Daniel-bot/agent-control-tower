import { readFile } from 'fs/promises'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { path: filePath } = await req.json()

    if (!filePath || typeof filePath !== 'string') {
      return Response.json({ error: 'path is required' }, { status: 400 })
    }

    // Security: only allow reading from .claude directory
    if (!filePath.includes('.claude')) {
      return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    const content = await readFile(filePath, 'utf-8')
    return Response.json({ content, path: filePath })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to read file' },
      { status: 500 }
    )
  }
}
