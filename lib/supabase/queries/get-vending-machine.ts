import { createClient } from '../client'
import { formatDate, isOlderThan } from '../helpers'

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

  // Use the formatter utility
  const actualStatus = isOlderThan(data.last_seen, 4) ? 'offline' : data.status

  return {
    ...data,
    status: actualStatus,
    originalStatus: data.status,
    lastSeenFormatted: formatDate(data.last_seen),
    createdAtFormatted: formatDate(data.created_at, { format: 'datetime' })
  }
}
