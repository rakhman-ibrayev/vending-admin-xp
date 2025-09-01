import { useQuery } from '@tanstack/react-query'
import { vendingMachinesQueries } from './vending-machines.rq'

export function useVendingMachineProducts(id: number) {
  return useQuery({
    ...vendingMachinesQueries.machineProducts(id)
  })
}
