import { NextRequest, NextResponse } from 'next/server'
import { createDangerousServerClient } from '@/lib/supabase/dangerous-server'
import { withMachineAuth } from '@/lib/supabase/machine-decorator'
import type { Machine } from '@/lib/supabase/machine-auth'
import type { RouteResponse } from '@/lib/types'

async function failOrder(
  machine: Machine,
  _: NextRequest,
  { params }: { params: Promise<{ order_id: number }> }
): RouteResponse<{ id: number; status: string }> {
  try {
    const { order_id: orderId } = await params

    if (!orderId || isNaN(orderId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID' },
        { status: 400 }
      )
    }

    const supabase = createDangerousServerClient()

    // Update the order - ensure it belongs to this machine
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status: 'failed'
      })
      .eq('id', orderId)
      .eq('machine_id', machine.id) // Ensure order belongs to this machine
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
        { success: false, message: 'Failed to update order' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Unexpected error updating order:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PATCH = withMachineAuth(failOrder)
