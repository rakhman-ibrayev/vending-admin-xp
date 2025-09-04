import { useQuery } from '@tanstack/react-query'
import { productsQueries } from './products.rq'

export function useProductsList(
  ...args: Parameters<typeof productsQueries.list>
) {
  return useQuery({
    ...productsQueries.list(...args)
  })
}
