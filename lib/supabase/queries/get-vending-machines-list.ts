import { createClient } from '../client'
import { getTodayRange } from '@/lib/dates/get-today-range'
import { formatDate } from '@/lib/dates/format-date'
import type { DefaultResponse } from '@/lib/types'
import type { TelemetryEntry } from '@/app/api/vending-machines/telemetry/route'
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

  const telemetryRes = await fetch('/api/vending-machines/telemetry')
  let machinesTelemetry: TelemetryEntry[] = []

  if (telemetryRes.ok) {
    const payload: DefaultResponse<TelemetryEntry[]> = await telemetryRes.json()
    machinesTelemetry = payload.data || []
  }

  return data?.map(machine => {
    const machineProducts = machine.machine_products ?? []
    const orders = machine.orders ?? []
    const totalCurrentStock = machineProducts.length
    const telemetry = machinesTelemetry.find(t => t.id === machine.id)
    const lastSeen = telemetry
      ? telemetry.telemetry.lastSeen
      : machine.last_seen

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
      status: getMachineStatus(lastSeen, machine.status),
      originalStatus: machine.status,
      temperature: telemetry
        ? telemetry.telemetry.temperature
        : machine.temperature,
      lastSeen: formatDate(lastSeen),
      lastSeenRaw: lastSeen,
      serialNumber: machine.serial_number,
      currentStock: totalCurrentStock,
      fillPercentage,
      numSlots: machine.num_slots,
      todayRevenue
    }
  })
}
