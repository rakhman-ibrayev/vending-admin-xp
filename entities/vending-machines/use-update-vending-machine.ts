import { updateVendingMachine } from '@/lib/supabase/queries/update-vending-machine.query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vendingMachinesQueries } from './vending-machines.rq'
import { useBroadcastToMachine } from './use-broadcast-to-machine'

export function useUpdateVendingMachine() {
  const queryClient = useQueryClient()
  const { mutateAsync: broadcast } = useBroadcastToMachine()

  return useMutation({
    mutationFn: updateVendingMachine,

    onMutate: async ({ id, machineData }) => {
      const machineQuery = vendingMachinesQueries.machine(id)

      await queryClient.cancelQueries({
        queryKey: machineQuery.queryKey
      })

      const previousMachine = queryClient.getQueryData<
        ReturnType<typeof machineQuery.queryFn>
      >(machineQuery.queryKey)

      queryClient.setQueryData(machineQuery.queryKey, {
        ...previousMachine,
        ...machineData
      })

      return { previousMachine }
    },

    onSuccess: async updatedMachine => {
      if (updatedMachine.data?.serial_number) {
        await broadcast({
          serial_number: updatedMachine.data.serial_number,
          event: 'update'
        })
      }
    },

    onError: (_, { id }, context) => {
      queryClient.setQueryData(
        vendingMachinesQueries.machine(id).queryKey,
        context?.previousMachine
      )
    }
  })
}
