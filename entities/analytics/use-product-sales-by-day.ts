import { useQuery } from '@tanstack/react-query'
import { analyticsQueries } from './analytics.rq'

export function useProductSalesByDay(
  ...args: Parameters<typeof analyticsQueries.salesByDay>
) {
  return useQuery({
    ...analyticsQueries.salesByDay(...args)
  })
}
