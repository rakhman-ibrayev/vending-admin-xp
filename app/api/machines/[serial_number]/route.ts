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

    // Get all machine data - simple and clean
    const { data: machine, error } = await supabase
      .from('vending_machines')
      .select('*')
      .eq('serial_number', serial_number)
      .single()

    if (error) {
      console.error('Error fetching machine:', error)
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 })
    }

    // Update last_seen timestamp
    const { error: updateError } = await supabase
      .from('vending_machines')
      .update({ last_seen: new Date().toISOString() })
      .eq('serial_number', serial_number)

    if (updateError) {
      console.error('Error updating last_seen timestamp:', updateError)
      // Don't return error to client as the main operation succeeded
      // But log it for monitoring
    }

    // Return all machine data - let the vending machine use what it needs
    return NextResponse.json(machine)
  } catch (error) {
    console.error('Unexpected error fetching machine:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
