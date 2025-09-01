import { getVendingMachine } from '@/lib/supabase/queries/get-vending-machine'
import { getVendingMachineOrders } from '@/lib/supabase/queries/get-vending-machine-orders'
import { getVendingMachineProducts } from '@/lib/supabase/queries/get-vending-machine-products'
import { getVendingMachinesList } from '@/lib/supabase/queries/get-vending-machines-list'

export const vendingMachinesQueries = {
  all: () => ['machines'],

  list: () => ({
    queryKey: [...vendingMachinesQueries.all(), 'list'],
    queryFn: getVendingMachinesList
  }),

  machine: (id: number) => ({
    queryKey: [...vendingMachinesQueries.all(), id],
    queryFn: () => getVendingMachine(id)
  }),

  machineProducts: (id: number) => ({
    queryKey: [...vendingMachinesQueries.all(), id, 'products'],
    queryFn: () => getVendingMachineProducts(id)
  }),

  machineOrders: (...args: Parameters<typeof getVendingMachineOrders>) => ({
    queryKey: [...vendingMachinesQueries.all(), ...args, 'orders'],
    queryFn: () => getVendingMachineOrders(...args)
  })
}
