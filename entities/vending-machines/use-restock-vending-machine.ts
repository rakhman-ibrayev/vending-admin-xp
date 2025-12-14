import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vendingMachinesQueries } from './vending-machines.rq'
import { restockVendingMachine } from '@/lib/supabase/queries/restock-vending-machine'
import { useBroadcastToMachine } from './use-broadcast-to-machine'
import { toast } from 'sonner'

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

      try {
        await broadcast({
          serial_number: machineSerialNumber,
          event: 'restock'
        })
      } catch (error) {
        toast.error('Не удалось оповестить аппарат', {
          description:
            'Изменения сохранены, но аппарат может не обновиться сразу',
          closeButton: true
        })
      }
    }
  })
}
