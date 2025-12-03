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
    if (
      slot_index === undefined ||
      slot_index === null ||
      typeof slot_index !== 'number' ||
      slot_index < 1 ||
      slot_index > machine.num_slots
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `slot_index must be a positive number between 1 and ${machine.num_slots}`
        },
        { status: 400 }
      )
    }

    // Check if machine is online
    if (machine.status !== 'online') {
      return NextResponse.json(
        { success: false, message: 'Machine is offline' },
        { status: 400 }
      )
    }

    const supabase = createDangerousServerClient()

    // Use machine's id and slot_index to retrieve the machine_product
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
          sku,
          category
        )
      `
      )
      .eq('machine_id', machine.id)
      .eq('slot_index', slot_index)
      .single()

    if (productError || !machineProduct.products) {
      console.error('Error fetching machine product:', productError)
      return NextResponse.json(
        { success: false, message: 'Product not found in specified slot' },
        { status: 404 }
      )
    }

    // Check if product is in stock
    if (machineProduct.current_stock <= 0) {
      console.error('Product out of stock')
      return NextResponse.json(
        { success: false, message: 'Product out of stock' },
        { status: 400 }
      )
    }

    // Create order with denormalized product data
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        machine_id: machine.id,
        machine_product_id: machineProduct.id,
        machine_command: vendProduct(slot_index - 1),
        status: 'created',
        product_name: machineProduct.products.name,
        product_sku: machineProduct.products.sku,
        product_category: machineProduct.products.category,
        slot_index: machineProduct.slot_index
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error creating order:', insertError)
      return NextResponse.json(
        { success: false, message: 'Failed to create order' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: { id: order.id } },
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
