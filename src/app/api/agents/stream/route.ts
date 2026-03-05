import { subscribe } from '@/lib/agentEventBus'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send heartbeat every 15s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
        }
      }, 15_000)

      const unsubscribe = subscribe((event) => {
        try {
          const data = JSON.stringify(event)
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        } catch {
          // stream closed
        }
      })

      // Cleanup when client disconnects
      const cancel = () => {
        clearInterval(heartbeat)
        unsubscribe()
      }

      // Store cancel for stream cancellation
      ;(controller as unknown as { _cancel: () => void })._cancel = cancel
    },
    cancel(controller) {
      const c = controller as unknown as { _cancel?: () => void }
      c._cancel?.()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
