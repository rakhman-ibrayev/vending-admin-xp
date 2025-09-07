import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _: Request,
  { params }: { params: { serial_number: string } }
) {
  try {
    const supabase = await createClient()
    const serial_number = (await params).serial_number

    if (!serial_number) {
      return NextResponse.json(
        { error: 'Serial number is required' },
        { status: 400 }
      )
    }

    const { data: products, error } = await supabase
      .from('machine_products')
      .select(
        `
      id,
      slot_index,
      current_stock,
      max_capacity,
      last_restocked,
      created_at,
      products (
        id,
        name,
        price,
        sku,
        image,
        category
      ),
      vending_machines (
        serial_number
      )
    `
      )
      .eq('vending_machines.serial_number', serial_number)
      .order('slot_index')

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: 'Products not found' }, { status: 404 })
    }

    // Update last_seen timestamp
    await supabase
      .from('vending_machines')
      .update({ last_seen: new Date().toISOString() })
      .eq('serial_number', serial_number)

    // Return all machine data - let the vending machine use what it needs
    return NextResponse.json(products)
  } catch (error) {
    console.error('Unexpected error fetching machine:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
