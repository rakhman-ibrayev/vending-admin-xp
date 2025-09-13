import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vendingMachinesQueries } from './vending-machines.rq'
import { restockVendingMachine } from '@/lib/supabase/queries/restock-vending-machine'

export function useRestockVendingMachine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: restockVendingMachine,

    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: vendingMachinesQueries.machineProducts(variables.machineId)
          .queryKey
      })
    }
  })
}
