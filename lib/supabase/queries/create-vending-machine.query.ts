import { createClient } from '../client'
import type { Database } from '../database.types'

export const createVendingMachine = async (
  machineData: Database['public']['Tables']['vending_machines']['Insert']
) => {
  const supabase = createClient()

  return await supabase
    .from('vending_machines')
    .insert([machineData])
    .select()
    .single()
}
