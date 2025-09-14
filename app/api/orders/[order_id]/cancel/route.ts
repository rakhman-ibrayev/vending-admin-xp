import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
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

    // Update the order
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled'
      })
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
