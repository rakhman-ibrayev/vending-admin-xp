import { NextRequest, NextResponse } from 'next/server'
import { authenticateMachine, type Machine } from './machine-auth'

/**
 * Decorator that wraps vending machine route handlers with authentication.
 * Ensures the request comes from a valid vending machine identified by x-serial-number header.
 */
export function withMachineAuth(
  handler: (
    machine: Machine,
    req: NextRequest,
    ...args: any[]
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const machine = await authenticateMachine(req)

    if (!machine) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Invalid or missing machine serial number'
        },
        { status: 401 }
      )
    }

    try {
      return await handler(machine, req, ...args)
    } catch (error) {
      console.error('Machine route handler error:', error)
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
