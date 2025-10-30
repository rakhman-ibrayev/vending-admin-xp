import { createClient } from '../client'
import type { Database } from '../database.types'

type MachineProduct = Database['public']['Tables']['machine_products']['Insert']

export interface RestockSlot {
  slotIndex: number
  productId: number | null
  currentStock: number
  maxCapacity: number
}

const validateSlot = (slot: RestockSlot) => {
  if (slot.currentStock < 0) {
    throw new Error(
      `Invalid current stock for slot ${slot.slotIndex}: must be non-negative`
    )
  }
  if (slot.currentStock > slot.maxCapacity) {
    throw new Error(
      `Invalid current stock for slot ${slot.slotIndex}: exceeds max capacity`
    )
  }
  if (slot.maxCapacity <= 0) {
    throw new Error(
      `Invalid max capacity for slot ${slot.slotIndex}: must be positive`
    )
  }
}

export const restockVendingMachine = async ({
  machineId,
  slots
}: {
  machineId: number
  slots: RestockSlot[]
}) => {
  const supabase = createClient()

  // Validate all slots first
  slots.forEach(validateSlot)

  // Filter slots
  const slotsToUnassign = slots
    .filter(slot => slot.productId === null)
    .map(slot => slot.slotIndex)
  const slotsToUpsert = slots.filter(slot => slot.productId !== null)

  try {
    // Unassign slots by setting machine_id to null
    if (slotsToUnassign.length > 0) {
      const { error: unassignError } = await supabase
        .from('machine_products')
        .update({ machine_id: null })
        .eq('machine_id', machineId)
        .in('slot_index', slotsToUnassign)

      if (unassignError) {
        throw new Error(`Failed to unassign slots: ${unassignError.message}`)
      }
    }

    if (slotsToUpsert.length > 0) {
      const upsertData: MachineProduct[] = slotsToUpsert.map(slot => ({
        machine_id: machineId,
        slot_index: slot.slotIndex,
        product_id: slot.productId,
        current_stock: slot.currentStock,
        max_capacity: slot.maxCapacity,
        last_restocked: new Date().toISOString()
      }))

      const { error: upsertError } = await supabase
        .from('machine_products')
        .upsert(upsertData, {
          onConflict: 'machine_id,slot_index'
        })

      if (upsertError) {
        throw new Error(`Failed to upsert slots: ${upsertError.message}`)
      }
    }

    // Get updated data
    const { data: updatedProducts, error: fetchError } = await supabase
      .from('machine_products')
      .select()
      .eq('machine_id', machineId)
      .order('slot_index')

    if (fetchError) {
      throw new Error(`Failed to fetch updated products: ${fetchError.message}`)
    }

    return updatedProducts
  } catch (error) {
    console.error('Error in restockVendingMachine:', error)
    throw error
  }
}
