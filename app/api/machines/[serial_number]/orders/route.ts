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

    // Check if product is in stock
    if (machineProduct.current_stock <= 0) {
      return NextResponse.json(
        { error: 'Product out of stock' },
        { status: 400 }
      )
    }

    // 3) Create a new order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        machine_id: machine.id,
        machine_product_id: machineProduct.id,
        machine_command: vendProduct(slot_index - 1), // Convert to 0-based index
        status: 'created'
      })
      .select(
        `
        id,
        status,
        created_at,
        machine_products (
          slot_index,
          products (
            id,
            name,
            price,
            sku
          )
        )
      `
      )
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          status: order.status,
          created_at: order.created_at,
          slot_index: machineProduct.slot_index,
          product: machineProduct.products,
          current_stock: machineProduct.current_stock
        }
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
