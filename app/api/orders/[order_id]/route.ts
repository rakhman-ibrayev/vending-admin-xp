import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ order_id: number }> }
) {
  try {
    const supabase = await createClient()
    const { order_id } = await params

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Simple response for vending machine
    const response = {
      id: order.id,
      status: order.status,
      created_at: order.created_at,
      slot_index: order.machine_products?.slot_index,
      product_name: order.machine_products?.products?.name,
      product_price: order.machine_products?.products?.price,
      machine_command: order.machine_command
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error fetching order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
