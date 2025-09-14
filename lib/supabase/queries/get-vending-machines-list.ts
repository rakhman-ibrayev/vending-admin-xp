import { createClient } from '../client'
import { formatDate, getActualStatus, getTodayRange } from '../helpers'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

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
      temperature,
      last_seen,
      serial_number,
      num_slots,
      machine_products (
        current_stock,
        max_capacity
      ),
      orders (
        status,
        machine_products (
            products (
                price
            )
        )
      )
    `
    )
    .eq('orders.status', 'paid')
    .gte('orders.created_at', startDate)
    .lte('orders.created_at', endDate)
    .order('id')

  if (error) {
    console.error('Error fetching vending machines with revenue:', error)
    return []
  }

  return data?.map(machine => {
    const machineProducts = machine.machine_products ?? []
    const orders = machine.orders ?? []
    const totalCurrentStock = machineProducts.length

    const fillPercentage = Math.round(
      (totalCurrentStock / machine.num_slots) * 100
    )

    const todayRevenue = orders.reduce((sum, order) => {
      if (order.status !== 'paid') return sum + 0

      return sum + (order.machine_products?.products?.price || 0)
    }, 0)

    return {
      id: machine.id,
      name: machine.name,
      location: machine.location,
      description: machine.description,
      status: getActualStatus(machine.status, machine.last_seen),
      originalStatus: machine.status,
      temperature: machine.temperature,
      lastSeen: formatDate(machine.last_seen),
      lastSeenRaw: machine.last_seen,
      serialNumber: machine.serial_number,
      currentStock: totalCurrentStock,
      fillPercentage,
      numSlots: machine.num_slots,
      todayRevenue
    }
  })
}
