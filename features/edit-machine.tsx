'use client'

import { AddMachineDialog } from '@/components/add-machine-dialog'
import { Button } from '@/components/ui/button'
import { useUpdateVendingMachine } from '@/entities/vending-machines/use-update-vending-machine'
import { useVendingMachine } from '@/entities/vending-machines/use-vending-machine'
import { Edit } from 'lucide-react'
import { useState } from 'react'

interface EditMachineProps {
  machineId: number
}

const EditMachine = ({ machineId }: EditMachineProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const machineQuery = useVendingMachine(machineId)
  const updateMutation = useUpdateVendingMachine()

  if (machineQuery.isLoading || !machineQuery.data) {
    return null
  }

  const machine = machineQuery.data

  return (
    <>
      <Button variant="ghost" onClick={() => setEditDialogOpen(true)}>
        <Edit />
      </Button>

      <AddMachineDialog
        isEditing
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        defaultValues={{
          serial_number: machine.serial_number || '',
          name: machine.name || '',
          location: machine.location || '',
          latitude: machine.latitude || undefined,
          longitude: machine.longitude || undefined,
          num_slots: machine.num_slots || 0,
          // Pass the stored serial settings so saving an edit doesn't reset
          // them to the dialog's new-machine defaults.
          baud_rate: machine.baud_rate,
          device_path: machine.device_path,
          parity: machine.parity,
          data_bits: machine.data_bits,
          stop_bits: machine.stop_bits,
          surveillance_url: machine.surveillance_url || undefined,
          technician_password: machine.technician_password || '',
          description: machine.description || '',
          support_contacts: machine.support_contacts || ''
        }}
        onSubmit={async values => {
          await updateMutation.mutateAsync({
            id: machine.id,
            machineData: values
          })
          setEditDialogOpen(false)
        }}
      />
    </>
  )
}

export { EditMachine, type EditMachineProps }
