import { createClient } from '../client'
import { formatDate } from '@/lib/dates/format-date'
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

  return {
    ...data,
    originalStatus: data.status,
    lastSeenFormatted: formatDate(data.last_seen),
    createdAtFormatted: formatDate(data.created_at, { format: 'datetime' }),
    status: getMachineStatus(data.last_seen, data.status)
  }
}
