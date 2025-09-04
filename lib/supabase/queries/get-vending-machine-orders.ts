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
  sort?: OrdersSortParams,
  pagination?: PaginationParams
) => {
  const supabase = createClient()

  // Set default pagination values
  const page = pagination?.page ?? 1
  const pageSize = pagination?.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

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
      machine_products (
        slot_index,
        current_stock,
        max_capacity,
        products (
          id,
          name,
          price,
          sku,
          image,
          category
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

  // Apply pagination
  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('Error fetching orders:', error)
    throw error
  }

  const totalPages = Math.ceil((count || 0) / pageSize)

  return {
    orders: data || [],
    pagination: {
      currentPage: page,
      pageSize,
      totalCount: count || 0,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    filters: filters || {},
    sort: sort || { field: 'created_at', direction: 'desc' }
  }
}
