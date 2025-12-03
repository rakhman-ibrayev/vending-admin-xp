import { createClient } from '../client'

export interface OrdersFilterParams {
  startDate?: string // ISO string or date format
  endDate?: string // ISO string or date format
  status?: 'created' | 'paid' | 'failed'
}

export interface OrdersSortParams {
  field?: 'created_at' | 'status' | 'id'
  direction?: 'asc' | 'desc'
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export const getVendingMachineOrders = async (
  machineId: number,
  filters?: OrdersFilterParams,
  sort?: OrdersSortParams
) => {
  const supabase = createClient()

  // Set default sort values
  const sortField = sort?.field ?? 'created_at'
  const sortDirection = sort?.direction ?? 'desc'

  // Build the query
  let query = supabase
    .from('orders')
    .select(
      `
      id,
      status,
      created_at,
      machine_product_id,
      amount_paid,
      machine_products (
        slot_index,
        current_stock,
        max_capacity,
        products (
          name
        )
      )
    `,
      { count: 'exact' }
    )
    .eq('machine_id', machineId)

  // Apply optional filters
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  // Apply sorting
  query = query.order(sortField, { ascending: sortDirection === 'asc' })

  // Fetch all data without pagination
  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching orders:', error)
    throw error
  }

  return {
    orders: data || [],
    totalCount: count || 0,
    filters: filters || {},
    sort: sort || { field: 'created_at', direction: 'desc' }
  }
}
