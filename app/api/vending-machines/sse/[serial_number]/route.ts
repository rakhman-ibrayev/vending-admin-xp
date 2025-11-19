import { createClient } from '@/lib/supabase/server'
import type { RouteResponse } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'

const PING_INTERVAL_MS = 15000

export const dynamic = 'force-dynamic'

export const runtime = 'nodejs'

export type SSEEventName =
  | 'restock'
  | 'update'
  | 'connected'
  | 'closed'
  | 'ping'

type SSEConnection = {
  writer: WritableStreamDefaultWriter<Uint8Array>
  timeoutId: NodeJS.Timeout
  connectedAt: Date
}

type SSEEvent = {
  event: SSEEventName
  data?: any
}

const clients = new Map<string, SSEConnection>()

function writeEvent(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  event: SSEEvent
) {
  return writer.write(
    new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`)
  )
}

function sendToMachine(
  serial: string,
  event: SSEEventName,
  data?: any
): boolean {
  const client = clients.get(serial)

  if (!client) return false

  try {
    writeEvent(client.writer, { event, data })

    return true
  } catch (error) {
    console.error(`[SSE] Error sending to ${serial}:`, error)
    clients.delete(serial)

    return false
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ serial_number: string }> }
) {
  const { serial_number } = await params

  if (!serial_number) {
    return new NextResponse('Invalid serial number', { status: 400 })
  }

  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  // initial handshake
  writeEvent(writer, { event: 'connected', data: { time: Date.now() } })

  // periodic ping
  const interval = setInterval(() => {
    if (req.signal.aborted) {
      clearInterval(interval)
      return
    }

    writeEvent(writer, { event: 'ping', data: { ts: Date.now() } })
  }, PING_INTERVAL_MS)

  // delete existing client if reconnecting
  const existingClient = clients.get(serial_number)

  if (existingClient) {
    clearInterval(existingClient.timeoutId)
    existingClient.writer.close()
    clients.delete(serial_number)
  }

  // add new client
  clients.set(serial_number, {
    writer,
    connectedAt: new Date(),
    timeoutId: interval
  })

  // cleanup
  req.signal.addEventListener('abort', () => {
    clearInterval(interval)
    clients.delete(serial_number)
    writer.close()
  })

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform'
    }
  })
}

interface BroadcastRequest {
  event: SSEEventName
  data?: any
}

interface BroadcastResponse {
  message: string
}

/**
 * Internal API endpoint for broadcasting SSE events to vending machines.
 * This endpoint is authenticated via Supabase session cookies.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ serial_number: string }> }
): RouteResponse<BroadcastResponse> {
  const { serial_number } = await params

  if (!serial_number) {
    return new NextResponse('Invalid serial number', { status: 400 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: BroadcastRequest = await req.json()

    if (!body.event) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const sent = sendToMachine(serial_number, body.event, body.data)

    if (!sent) {
      return NextResponse.json(
        { success: false, message: 'Machine not connected, event not sent' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Event sent to machine'
      }
    })
  } catch (error) {
    console.error('Broadcast error:', error)

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
