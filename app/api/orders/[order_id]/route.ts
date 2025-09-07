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
      product_price: order.machine_products?.products?.price
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ order_id: number }> }
) {
  try {
    const supabase = await createClient()
    const { order_id } = await params
    const updateData = await request.json()

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Validate allowed update fields
    const allowedFields = ['status']
    const updates: any = {}

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        updates[key] = value
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update the order
    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order_id)
      .select(
        `
        id,
        status
      `
      )
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Unexpected error updating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
