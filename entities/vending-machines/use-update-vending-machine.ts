import { updateVendingMachine } from '@/lib/supabase/queries/update-vending-machine.query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vendingMachinesQueries } from './vending-machines.rq'

export function useUpdateVendingMachine() {
  const queryClient = useQueryClient()

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

    onError: (_, { id }, context) => {
      queryClient.setQueryData(
        vendingMachinesQueries.machine(id).queryKey,
        context?.previousMachine
      )
    }
  })
}
