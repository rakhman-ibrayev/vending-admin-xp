import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { RouteResponse } from '@/lib/types'

interface OrderDetailsResponse {
  id: number
  status: string
  created_at: string
  slot_index: number | null
  product_name: string | null
  product_price: number | null
  machine_command: string | null
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ order_id: number }> }
): RouteResponse<OrderDetailsResponse> {
  try {
    const supabase = await createClient()
    const { order_id } = await params

    if (!order_id) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get minimal order data for vending machine status check
    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        status,
        created_at,
        machine_command,
        machine_products (
          slot_index,
          products (
            name,
            price
          )
        )
      `
      )
      .eq('id', order_id)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Simple response for vending machine
    const response: OrderDetailsResponse = {
      id: order.id,
      status: order.status,
      created_at: order.created_at,
      slot_index: order.machine_products?.slot_index ?? null,
      product_name: order.machine_products?.products?.name ?? null,
      product_price: order.machine_products?.products?.price ?? null,
      machine_command: order.machine_command
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error('Unexpected error fetching order:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
