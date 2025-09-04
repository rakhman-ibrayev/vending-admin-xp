import { getProducts } from '@/lib/supabase/queries/get-products'

export const productsQueries = {
  all: () => ['products'],

  list: (...args: Parameters<typeof getProducts>) => ({
    queryKey: [...productsQueries.all(), 'list'],
    queryFn: () => getProducts(...args)
  })
}
