import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { MachineRestockDialog } from './machine-restock-dialog'
import { useRestockVendingMachine } from '@/entities/vending-machines/use-restock-vending-machine'

interface MachineRestockProps {
  machineId: number
  numSlots: number
  machineSerialNumber: string
}

const MachineRestock = ({
  machineId,
  numSlots,
  machineSerialNumber
}: MachineRestockProps) => {
  const [restockDialogOpen, setRestockDialogOpen] = useState(false)

  const restockMutation = useRestockVendingMachine(machineSerialNumber)

  return (
    <>
      <Button onClick={() => setRestockDialogOpen(true)} className="w-full">
        Пополнить товары
      </Button>

      {restockDialogOpen && (
        <MachineRestockDialog
          machineId={machineId}
          slotsCount={numSlots}
          onOpenChange={setRestockDialogOpen}
          onSubmit={async values => {
            const activeSlots = values.slots.filter(slot => slot.maxCapacity)

            const slots = activeSlots.map(slot => ({
              slotIndex: slot.slotNumber,
              productId: slot.product?.id ?? null,
              currentStock: slot.restockQty ?? 0,
              maxCapacity: slot.maxCapacity
            }))

            await restockMutation.mutateAsync({ machineId, slots })

            setRestockDialogOpen(false)
          }}
        />
      )}
    </>
  )
}

export { MachineRestock, type MachineRestockProps }
