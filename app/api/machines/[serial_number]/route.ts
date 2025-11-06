import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { RouteResponse } from '@/lib/types'
import type { Tables } from '@/lib/supabase/database.types'

export async function GET(
  _: Request,
  { params }: { params: { serial_number: string } }
): RouteResponse<Tables<'vending_machines'>> {
  try {
    const supabase = await createClient()
    const serial_number = (await params).serial_number

    if (!serial_number) {
      return NextResponse.json(
        { success: false, message: 'Serial number is required' },
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
      return NextResponse.json(
        { success: false, message: 'Machine not found' },
        { status: 404 }
      )
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
    return NextResponse.json({ success: true, data: machine })
  } catch (error) {
    console.error('Unexpected error fetching machine:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
