import { vendProduct } from '@/lib/m109e/vend-product'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ serial_number: string }> }
) {
  try {
    const supabase = await createClient()
    const { slot_index } = await request.json()
    const serial_number = (await params).serial_number

    // Validate input
    if (slot_index === undefined || slot_index === null) {
      return NextResponse.json(
        { error: 'slot_index is required' },
        { status: 400 }
      )
    }

    if (typeof slot_index !== 'number' || slot_index < 1) {
      return NextResponse.json(
        { error: 'slot_index must be a positive number' },
        { status: 400 }
      )
    }

    // 1) Retrieve the machine data by serial_number
    const { data: machine, error: machineError } = await supabase
      .from('vending_machines')
      .select('id, status, num_slots')
      .eq('serial_number', serial_number)
      .single()

    if (machineError) {
      console.error('Error fetching machine:', machineError)
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    // Check if machine is online
    if (machine.status !== 'online') {
      return NextResponse.json({ error: 'Machine is offline' }, { status: 400 })
    }

    // Validate slot index
    if (slot_index > machine.num_slots) {
      return NextResponse.json(
        { error: `Slot index must be between 1 and ${machine.num_slots}` },
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
        { error: 'Product not found in specified slot' },
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
        { error: 'Failed to process order' },
        { status: 500 }
      )
    }

    if (!result) {
      return NextResponse.json(
        { error: 'No response from database' },
        { status: 500 }
      )
    }

    const response = result as { error?: string; order_id?: number }

    if (response.error) {
      console.error('Transaction failed:', response.error)
      return NextResponse.json({ error: response.error }, { status: 400 })
    }

    if (!response.order_id) {
      return NextResponse.json(
        { error: 'No order ID returned' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        id: response.order_id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error in order creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
