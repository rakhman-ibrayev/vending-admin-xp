import { NextRequest, NextResponse } from 'next/server'
import { withMachineAuth } from '@/lib/supabase/machine-decorator'
import type { Machine } from '@/lib/supabase/machine-auth'
import type { RouteResponse } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

export type Telemetry = {
  temperature: number
  lastSeen: string
}

export type TelemetryEntry = {
  id: number
  telemetry: Telemetry
}

type TelemetryRequest = {
  temperature: number
}

const machinesTelemetry = new Map<number, Telemetry>()

async function updateTelemetry(
  machine: Machine,
  req: NextRequest
): RouteResponse<{ id: number }> {
  try {
    const body: TelemetryRequest = await req.json()
    const machineId = machine.id

    machinesTelemetry.set(machineId, {
      temperature: body.temperature,
      lastSeen: new Date().toISOString()
    })

    return NextResponse.json({ success: true, data: { id: machineId } })
  } catch (error) {
    console.error('Unexpected error updating telemetry:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withMachineAuth(updateTelemetry)

export async function GET(
  request: NextRequest
): RouteResponse<Telemetry | TelemetryEntry[]> {
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

  const searchParams = request.nextUrl.searchParams
  const machineIdParam = searchParams.get('machineId')

  if (!machineIdParam) {
    const allMachinesTelemetry = Array.from(machinesTelemetry.entries()).map(
      ([id, telemetry]) => ({
        id,
        telemetry
      })
    )

    return NextResponse.json({ success: true, data: allMachinesTelemetry })
  }

  const machineId = parseInt(machineIdParam, 10)

  if (isNaN(machineId)) {
    return NextResponse.json(
      { success: false, message: 'machineId must be a valid number' },
      { status: 400 }
    )
  }

  const telemetry = machinesTelemetry.get(machineId)

  return NextResponse.json({ success: true, data: telemetry })
}
