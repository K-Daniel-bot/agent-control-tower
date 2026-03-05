import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const SAVE_PATH = path.join(process.env.HOME ?? '~', '.claude', 'saved-news.json')

async function readSavedNews(): Promise<unknown[]> {
  try {
    const content = await fs.readFile(SAVE_PATH, 'utf-8')
    return JSON.parse(content) as unknown[]
  } catch {
    return []
  }
}

async function writeSavedNews(data: unknown[]): Promise<void> {
  const dir = path.dirname(SAVE_PATH)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(SAVE_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET() {
  const saved = await readSavedNews()
  return NextResponse.json({ savedArticles: saved })
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { article?: { id?: string }; action?: string }

    if (!body.article || !body.article.id) {
      return NextResponse.json({ error: 'article required' }, { status: 400 })
    }

    const saved = await readSavedNews() as Array<{ id: string }>

    if (body.action === 'remove') {
      const filtered = saved.filter((a) => a.id !== body.article?.id)
      await writeSavedNews(filtered)
      return NextResponse.json({ savedArticles: filtered })
    }

    const exists = saved.some((a) => a.id === body.article?.id)
    if (!exists) {
      const updated = [...saved, { ...body.article, saved: true, savedAt: new Date().toISOString() }]
      await writeSavedNews(updated)
      return NextResponse.json({ savedArticles: updated })
    }

    return NextResponse.json({ savedArticles: saved })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
