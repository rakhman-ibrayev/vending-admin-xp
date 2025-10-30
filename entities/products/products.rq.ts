import { getProducts } from '@/lib/supabase/queries/get-products'

export const productsQueries = {
  all: () => ['products'] as const,

  list: (...args: Parameters<typeof getProducts>) => ({
    queryKey: [...productsQueries.all(), 'list'] as const,
    queryFn: () => getProducts(...args)
  })
} as const
