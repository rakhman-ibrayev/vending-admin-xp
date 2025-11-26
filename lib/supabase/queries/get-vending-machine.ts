import { createClient } from '../client'
import { formatDate } from '@/lib/dates/format-date'
import type { DefaultResponse } from '@/lib/types'
import type { Telemetry } from '@/app/api/vending-machines/telemetry/route'
import { getMachineStatus } from '@/lib/dates/get-machine-status'

export const getVendingMachine = async (id: number) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('vending_machines')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching vending machine:', error)
    return null
  }

  const result = {
    ...data,
    originalStatus: data.status,
    lastSeenFormatted: formatDate(data.last_seen),
    createdAtFormatted: formatDate(data.created_at, { format: 'datetime' }),
    status: getMachineStatus(data.last_seen, data.status)
  }

  const telemetryRes = await fetch(
    `/api/vending-machines/telemetry?machineId=${id}`
  )

  if (telemetryRes.ok) {
    const payload: DefaultResponse<Telemetry> = await telemetryRes.json()

    if (payload?.success && payload?.data) {
      return {
        ...result,
        lastSeenFormatted: formatDate(payload.data.lastSeen),
        status: getMachineStatus(payload.data.lastSeen, data.status),
        temperature: payload.data.temperature
      }
    }
  }

  return result
}
