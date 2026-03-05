export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { id, url } = await req.json()

    if (!url) {
      return Response.json({ error: 'url is required' }, { status: 400 })
    }

    const start = Date.now()
    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })
      const latencyMs = Date.now() - start

      return Response.json({
        ok: res.ok,
        statusCode: res.status,
        latencyMs,
        checkedAt: new Date().toISOString(),
        id,
      })
    } catch {
      return Response.json({
        ok: false,
        statusCode: 0,
        latencyMs: Date.now() - start,
        checkedAt: new Date().toISOString(),
        id,
      })
    }
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
