import { useQuery } from '@tanstack/react-query'
import { vendingMachinesQueries } from './vending-machines.rq'

export function useVendingMachinesList() {
  return useQuery({
    ...vendingMachinesQueries.list()
  })
}
