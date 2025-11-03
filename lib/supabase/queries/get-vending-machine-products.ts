import { createClient } from '../client'

export const getVendingMachineProducts = async (machineId: number) => {
  const supabase = createClient()

  return await supabase
    .from('machine_products')
    .select(
      `
      id,
      slot_index,
      current_stock,
      max_capacity,
      last_restocked,
      created_at,
      products (
        id,
        name,
        price,
        sku,
        image,
        category,
        stock
      )
    `
    )
    .eq('machine_id', machineId)
    .order('slot_index')
}
