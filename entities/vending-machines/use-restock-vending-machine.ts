import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vendingMachinesQueries } from './vending-machines.rq'
import { restockVendingMachine } from '@/lib/supabase/queries/restock-vending-machine'
import { useBroadcastToMachine } from './use-broadcast-to-machine'

export function useRestockVendingMachine(machineSerialNumber: string) {
  const queryClient = useQueryClient()
  const { mutateAsync: broadcast } = useBroadcastToMachine()

  return useMutation({
    mutationFn: restockVendingMachine,

    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: vendingMachinesQueries.machineProducts(variables.machineId)
          .queryKey
      })

      await broadcast({
        serial_number: machineSerialNumber,
        event: 'restock'
      })
    }
  })
}
