import { useQuery } from '@tanstack/react-query'
import { vendingMachinesQueries } from './vending-machines.rq'

export function useVendingMachineOrders(
  ...args: Parameters<typeof vendingMachinesQueries.machineOrders>
) {
  return useQuery({
    ...vendingMachinesQueries.machineOrders(...args)
  })
}
