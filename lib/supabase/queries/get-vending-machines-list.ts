import { isOlderThan } from '@/lib/dates/is-older-than'
import { createClient } from '../client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { getTodayRange } from '@/lib/dates/get-today-range'
import { formatDate } from '@/lib/dates/format-date'

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
      status:
        !machine.last_seen ||
        isOlderThan(
          machine.last_seen,
          Number(
            process.env.NEXT_PUBLIC_VENDING_MACHINE_HEARTBEAT_INTERVAL_MINS
          )
        )
          ? 'offline'
          : machine.status,
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
