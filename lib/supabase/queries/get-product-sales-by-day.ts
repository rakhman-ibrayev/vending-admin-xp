import { createClient } from '../client'

export interface ProductSalesByDayFilters {
  startDate?: string
  endDate?: string
  machineId?: number
  productId?: number
}

export const getProductSalesByDay = async (
  filters?: ProductSalesByDayFilters
) => {
  const supabase = createClient()

  let query = supabase.from('product_sales_by_day').select(`
      *,
      products (
        id,
        name,
        sku,
        category
      ),
      vending_machines (
        id,
        name,
        location
      )
    `)

  // Apply date range filter
  if (filters?.startDate) {
    query = query.gte('day', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('day', filters.endDate)
  }

  // Apply machine filter
  if (filters?.machineId) {
    query = query.eq('machine_id', filters.machineId)
  }

  // Apply product filter
  if (filters?.productId) {
    query = query.eq('product_id', filters.productId)
  }

  // Order by day descending (most recent first)
  query = query.order('day', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching product sales by day:', error)
    throw error
  }

  return {
    sales: data || [],
    filters: filters || {}
  }
}
