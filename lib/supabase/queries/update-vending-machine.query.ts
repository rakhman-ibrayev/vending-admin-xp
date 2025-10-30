import { createClient } from '../client'
import type { Database } from '../database.types'

export const updateVendingMachine = async ({
  id,
  machineData
}: {
  id: number
  machineData: Database['public']['Tables']['vending_machines']['Update']
}) => {
  const supabase = createClient()

  return await supabase
    .from('vending_machines')
    .update(machineData)
    .eq('id', id)
    .select()
    .single()
}
