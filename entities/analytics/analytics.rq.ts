import { getProductSalesByDay } from '@/lib/supabase/queries/get-product-sales-by-day'

export const analyticsQueries = {
  all: () => ['analytics'] as const,

  salesByDay: (...args: Parameters<typeof getProductSalesByDay>) => ({
    queryKey: [...analyticsQueries.all(), 'salesByDay', ...args] as const,
    queryFn: () => getProductSalesByDay(...args)
  })
} as const
