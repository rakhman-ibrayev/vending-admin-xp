import { useQuery } from '@tanstack/react-query'
import { vendingMachinesQueries } from './vending-machines.rq'

export function useVendingMachine(id: number) {
  return useQuery({
    ...vendingMachinesQueries.machine(id)
  })
}
