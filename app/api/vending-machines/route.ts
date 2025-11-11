import { NextResponse } from 'next/server'
import { createDangerousServerClient } from '@/lib/supabase/dangerous-server'
import { withMachineAuth } from '@/lib/supabase/machine-decorator'
import type { Machine } from '@/lib/supabase/machine-auth'
import type { RouteResponse } from '@/lib/types'
import type { Tables } from '@/lib/supabase/database.types'

type VendingMachine = Tables<'vending_machines'>

async function getMachineInfo(machine: Machine): RouteResponse<VendingMachine> {
  try {
    const supabase = createDangerousServerClient()

    // Get all machine data - simple and clean
    const { data: machineData, error } = await supabase
      .from('vending_machines')
      .select('*')
      .eq('id', machine.id)
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
      .eq('id', machine.id)

    if (updateError) {
      console.error('Error updating last_seen timestamp:', updateError)
      // Don't return error to client as the main operation succeeded
      // But log it for monitoring
    }

    // Return all machine data - let the vending machine use what it needs
    return NextResponse.json({ success: true, data: machineData })
  } catch (error) {
    console.error('Unexpected error fetching machine:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withMachineAuth(getMachineInfo)
