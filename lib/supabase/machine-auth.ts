import { createDangerousServerClient } from './dangerous-server'

export interface Machine {
  id: number
  name: string | null
  serial_number: string
  status: string
  num_slots: number
}

/**
 * Authenticate a vending machine by its serial number from the request headers.
 * This bypasses RLS and should only be used for machine-specific operations.
 */
export async function authenticateMachine(
  req: Request
): Promise<Machine | null> {
  const serialNumber = req.headers.get('x-serial-number')

  if (!serialNumber) {
    return null
  }

  try {
    const supabase = createDangerousServerClient()

    const { data: machine, error } = await supabase
      .from('vending_machines')
      .select('id, name, serial_number, status, num_slots')
      .eq('serial_number', serialNumber)
      .single()

    if (error || !machine) {
      console.error(
        'Machine authentication failed:',
        error?.message || 'Machine not found'
      )
      return null
    }

    // Check if machine is online (optional - you might want to allow offline machines to sync)
    // if (machine.status !== 'online') {
    //   console.error('Machine is offline:', machine.serial_number)
    //   return null
    // }

    return machine
  } catch (error) {
    console.error('Machine authentication error:', error)
    return null
  }
}
