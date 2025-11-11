import { createClient } from '../client'

export interface ProductsFilterParams {
  category?: string
  minPrice?: number
  maxPrice?: number
  minStock?: number
  maxStock?: number
}

export interface ProductsSortParams {
  field?: 'price' | 'created_at' | 'category' | 'stock'
  direction?: 'asc' | 'desc'
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export const getProducts = async (
  filters?: ProductsFilterParams,
  sort?: ProductsSortParams,
  pagination?: PaginationParams
) => {
  const supabase = createClient()

  // Set default sort values
  const sortField = sort?.field ?? 'name'
  const sortDirection = sort?.direction ?? 'asc'

  // Build the base query
  let query = supabase
    .from('products')
    .select('*', { count: pagination ? 'exact' : undefined })
    .gt('price', 0)

  // Apply optional filters
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice)
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice)
  }

  if (filters?.minStock !== undefined) {
    query = query.gte('stock', filters.minStock)
  }

  if (filters?.maxStock !== undefined) {
    query = query.lte('stock', filters.maxStock)
  }

  // Apply sorting
  query = query.order(sortField, { ascending: sortDirection === 'asc' })

  // Handle pagination (if provided)
  if (pagination) {
    const page = pagination.page ?? 1
    const pageSize = pagination.pageSize ?? 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }

    const totalPages = Math.ceil((count || 0) / pageSize)

    return {
      products: data || [],
      pagination: {
        currentPage: page,
        pageSize,
        totalCount: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: filters || {},
      sort: sort || { field: 'name', direction: 'asc' }
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }

  return {
    products: data || [],
    pagination: null,
    filters: filters || {},
    sort: sort || { field: 'name', direction: 'asc' }
  }
}
