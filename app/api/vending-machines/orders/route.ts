import { NextRequest, NextResponse } from 'next/server'
import { vendProduct } from '@/lib/m109e/vend-product'
import { createDangerousServerClient } from '@/lib/supabase/dangerous-server'
import { withMachineAuth } from '@/lib/supabase/machine-decorator'
import type { Machine } from '@/lib/supabase/machine-auth'
import type { RouteResponse } from '@/lib/types'

interface CreateOrderRequest {
  slot_index: number
}

async function createOrder(
  machine: Machine,
  req: NextRequest
): RouteResponse<{ id: number }> {
  try {
    const body: CreateOrderRequest = await req.json()
    const { slot_index } = body

    // Validate input
    if (slot_index === undefined || slot_index === null) {
      return NextResponse.json(
        { success: false, message: 'slot_index is required' },
        { status: 400 }
      )
    }

    if (typeof slot_index !== 'number' || slot_index < 1) {
      return NextResponse.json(
        { success: false, message: 'slot_index must be a positive number' },
        { status: 400 }
      )
    }

    const supabase = createDangerousServerClient()

    // Check if machine is online
    if (machine.status !== 'online') {
      return NextResponse.json(
        { success: false, message: 'Machine is offline' },
        { status: 400 }
      )
    }

    // Validate slot index
    if (slot_index > machine.num_slots) {
      return NextResponse.json(
        {
          success: false,
          message: `Slot index must be between 1 and ${machine.num_slots}`
        },
        { status: 400 }
      )
    }

    // 2) Use machine's id and slot_index to retrieve the machine_product
    const { data: machineProduct, error: productError } = await supabase
      .from('machine_products')
      .select(
        `
        id,
        slot_index,
        current_stock,
        max_capacity,
        products (
          id,
          name,
          price,
          sku
        )
      `
      )
      .eq('machine_id', machine.id)
      .eq('slot_index', slot_index)
      .single()

    if (productError) {
      console.error('Error fetching machine product:', productError)
      return NextResponse.json(
        { success: false, message: 'Product not found in specified slot' },
        { status: 404 }
      )
    }

    // Create order and update stock atomically using a database function
    const { data: result, error: transactionError } = await supabase.rpc(
      'create_order_with_stock_update',
      {
        p_machine_id: machine.id,
        p_machine_product_id: machineProduct.id,
        p_machine_command: vendProduct(slot_index - 1), // Convert to 0-based index
        p_slot_index: slot_index
      }
    )

    if (transactionError) {
      console.error('Error in transaction:', transactionError)
      return NextResponse.json(
        { success: false, message: 'Failed to process order' },
        { status: 500 }
      )
    }

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'No response from database' },
        { status: 500 }
      )
    }

    const response = result as { error?: string; order_id?: number }

    if (response.error) {
      console.error('Transaction failed:', response.error)
      return NextResponse.json(
        { success: false, message: response.error },
        { status: 400 }
      )
    }

    if (!response.order_id) {
      return NextResponse.json(
        { success: false, message: 'No order ID returned' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: { id: response.order_id } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in order creation:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withMachineAuth(createOrder)
