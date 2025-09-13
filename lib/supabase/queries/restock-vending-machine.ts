import { createClient } from '../client'

export interface RestockSlot {
  slotIndex: number
  productId: number | null
  currentStock: number
  maxCapacity: number
}

export const restockVendingMachine = async ({
  machineId,
  slots
}: {
  machineId: number
  slots: RestockSlot[]
}) => {
  const supabase = createClient()

  // Filter out slots that need to be deleted (product_id set to null)
  const slotsToDelete = slots
    .filter(slot => slot.productId === null)
    .map(slot => slot.slotIndex)

  // Filter out slots that need to be updated/inserted
  const slotsToUpsert = slots.filter(slot => slot.productId !== null)

  const updates = []

  // Delete slots where product was removed
  if (slotsToDelete.length > 0) {
    const deletePromise = supabase
      .from('machine_products')
      .delete()
      .eq('machine_id', machineId)
      .in('slot_index', slotsToDelete)

    updates.push(deletePromise)
  }

  // Upsert (update or insert) slots with products
  if (slotsToUpsert.length > 0) {
    const upsertData = slotsToUpsert.map(slot => ({
      machine_id: machineId,
      slot_index: slot.slotIndex,
      product_id: slot.productId,
      current_stock: slot.currentStock,
      max_capacity: slot.maxCapacity,
      last_restocked: new Date().toISOString()
    }))

    const upsertPromise = supabase.from('machine_products').upsert(upsertData, {
      onConflict: 'machine_id,slot_index'
    })

    updates.push(upsertPromise)
  }

  // Execute all operations
  const results = await Promise.all(updates)

  // Check for errors
  const errors = results.filter(result => result.error)

  if (errors.length > 0) {
    console.error('Bulk update errors:', errors)
    throw new Error('Failed to update machine products')
  }

  return results
}
