import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { RouteResponse } from '@/lib/types'

interface MachineProductResponse {
  id: number
  slot_index: number
  current_stock: number
  max_capacity: number
  last_restocked: string | null
  created_at: string
  products: {
    id: number
    name: string
    price: number
    sku: string
    image: string | null
    category: string | null
  } | null
  vending_machines: {
    serial_number: string
  } | null
}

export async function GET(
  _: Request,
  { params }: { params: { serial_number: string } }
): RouteResponse<MachineProductResponse[]> {
  try {
    const supabase = await createClient()
    const serial_number = (await params).serial_number

    if (!serial_number) {
      return NextResponse.json(
        { success: false, message: 'Serial number is required' },
        { status: 400 }
      )
    }

    // First, get the machine to verify it exists and get its ID
    const { data: machine, error: machineError } = await supabase
      .from('vending_machines')
      .select('id, serial_number, name, location, status')
      .eq('serial_number', serial_number)
      .single()

    if (machineError || !machine) {
      return NextResponse.json(
        { success: false, message: 'Machine not found' },
        { status: 404 }
      )
    }

    // Then get products for that specific machine
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
      .eq('machine_id', machine.id)
      .order('slot_index')

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { success: false, message: 'Products not found' },
        { status: 404 }
      )
    }

    // Update last_seen timestamp
    const { error: updateError } = await supabase
      .from('vending_machines')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', machine.id)

    if (updateError) {
      console.error('Error updating last_seen timestamp:', updateError)
      // Don't return error to client as the main operation succeeded
      // But log it for monitoring
    }

    return NextResponse.json({
      success: true,
      data: products as MachineProductResponse[]
    })
  } catch (error) {
    console.error('Unexpected error fetching machine:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
