import { createVendingMachine } from '@/lib/supabase/queries/create-vending-machine.query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vendingMachinesQueries } from './vending-machines.rq'

export function useAddVendingMachine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVendingMachine,

    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: vendingMachinesQueries.list().queryKey
      })
    }
  })
}
