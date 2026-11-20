import { createClient } from '../client'
import { getTodayRange } from '@/lib/dates/get-today-range'
import { formatDate } from '@/lib/dates/format-date'
import { getMachineStatus } from '@/lib/dates/get-machine-status'

export const getVendingMachinesList = async () => {
  const supabase = createClient()
  const { startDate, endDate } = getTodayRange()

  const { data, error } = await supabase
    .from('vending_machines')
    .select(
      `
      id,
      name,
      location,
      description,
      status,
      last_seen,
      serial_number,
      num_slots,
      machine_products(
        id
      ),
      orders(
        amount_paid
      )
    `
    )
    .not('orders.amount_paid', 'is', null)
    .gte('orders.created_at', startDate)
    .lte('orders.created_at', endDate)
    .order('id')

  if (error) {
    console.error('Error fetching vending machines with revenue:', error)
    return []
  }

  return data?.map(machine => {
    const machineProductsCount = machine.machine_products?.length ?? 0
    const todayRevenue =
      machine.orders?.reduce(
        (sum, order) => sum + (order.amount_paid || 0),
        0
      ) ?? 0
    const fillPercentage = Math.round(
      (machineProductsCount / machine.num_slots) * 100
    )

    return {
      id: machine.id,
      name: machine.name,
      location: machine.location,
      description: machine.description,
      status: getMachineStatus(machine.last_seen, machine.status),
      originalStatus: machine.status,
      lastSeen: formatDate(machine.last_seen),
      lastSeenRaw: machine.last_seen,
      serialNumber: machine.serial_number,
      currentStock: machineProductsCount,
      fillPercentage,
      numSlots: machine.num_slots,
      todayRevenue
    }
  })
}
