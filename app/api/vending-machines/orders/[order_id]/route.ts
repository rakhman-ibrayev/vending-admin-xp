import { NextRequest, NextResponse } from 'next/server'
import { createDangerousServerClient } from '@/lib/supabase/dangerous-server'
import { withMachineAuth } from '@/lib/supabase/machine-decorator'
import type { Machine } from '@/lib/supabase/machine-auth'
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

async function getOrderDetails(
  machine: Machine,
  _: NextRequest,
  { params }: { params: Promise<{ order_id: number }> }
): RouteResponse<OrderDetailsResponse> {
  try {
    const { order_id: orderId } = await params

    if (!orderId || isNaN(orderId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID' },
        { status: 400 }
      )
    }

    const supabase = createDangerousServerClient()

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
      .eq('id', orderId)
      .eq('machine_id', machine.id) // Ensure order belongs to this machine
      .single()

    if (error || !order) {
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

export const GET = withMachineAuth(getOrderDetails)
