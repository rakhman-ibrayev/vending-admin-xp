import { NextResponse } from 'next/server'
import { createDangerousServerClient } from '@/lib/supabase/dangerous-server'
import { withMachineAuth } from '@/lib/supabase/machine-decorator'
import type { Machine } from '@/lib/supabase/machine-auth'
import type { RouteResponse } from '@/lib/types'

interface MachineProductResponse {
  id: number
  slot_index: number
  current_stock: number
  max_capacity: number
  last_restocked: string | null
  created_at: string
  products: {
    id: number
    name: string
    price: number
    sku: string
    image: string | null
    category: string | null
  } | null
}

async function getMachineProducts(
  machine: Machine
): RouteResponse<MachineProductResponse[]> {
  try {
    const supabase = createDangerousServerClient()

    // Get products for that specific machine
    const { data: products, error } = await supabase
      .from('machine_products')
      .select(
        `
        id,
        slot_index,
        current_stock,
        max_capacity,
        last_restocked,
        created_at,
        products (
          id,
          name,
          price,
          sku,
          image,
          category
        )
      `
      )
      .eq('machine_id', machine.id)
      .order('slot_index')

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { success: false, message: 'Products not found' },
        { status: 404 }
      )
    }

    // Update last_seen timestamp
    const { error: updateError } = await supabase
      .from('vending_machines')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', machine.id)

    if (updateError) {
      console.error('Error updating last_seen timestamp:', updateError)
      // Don't return error to client as the main operation succeeded
      // But log it for monitoring
    }

    return NextResponse.json({
      success: true,
      data: products as MachineProductResponse[]
    })
  } catch (error) {
    console.error('Unexpected error fetching machine products:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withMachineAuth(getMachineProducts)
