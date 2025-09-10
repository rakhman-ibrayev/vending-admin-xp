import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const RESPONSE_CODES = {
  SUCCESS: 0,
  NOT_FOUND: 1,
  CANCELLED: 2,
  PAID: 3,
  INTERNAL_ERROR: 5
}

function buildResponse(
  txn_id: string,
  result: number,
  comment: string,
  sum?: string
) {
  const response: any = { txn_id, result, comment }

  if (sum !== undefined) response.sum = sum

  return NextResponse.json({ response }, { status: 200 })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const txn_id = searchParams.get('txn_id')
  const account = searchParams.get('account')
  const command = searchParams.get('command')

  if (command !== 'check') {
    return NextResponse.json({ error: 'Invalid command' }, { status: 400 })
  }

  if (!txn_id || !account) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const orderId = parseInt(account, 10)

  if (isNaN(orderId)) {
    return buildResponse(
      txn_id,
      RESPONSE_CODES.NOT_FOUND,
      'Invalid order ID format'
    )
  }

  try {
    const supabase = await createClient()
    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `
        id, 
        status,
        machine_products (
          products (price)
        )
      `
      )
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return buildResponse(txn_id, RESPONSE_CODES.NOT_FOUND, 'Order not found')
    }

    // Get the product price for the sum field
    const productPrice = order.machine_products?.products?.price
    const formattedSum = productPrice ? productPrice.toFixed(2) : '0.00'

    switch (order.status) {
      case 'cancelled':
        return buildResponse(
          txn_id,
          RESPONSE_CODES.CANCELLED,
          `Order status: ${order.status}`
        )
      case 'paid':
        return buildResponse(
          txn_id,
          RESPONSE_CODES.PAID,
          `Order status: ${order.status}`
        )
      default:
        return buildResponse(
          txn_id,
          RESPONSE_CODES.SUCCESS,
          'Order ready for payment',
          formattedSum
        )
    }
  } catch (error) {
    console.error('Kaspi check error:', error)

    return buildResponse(
      txn_id,
      RESPONSE_CODES.INTERNAL_ERROR,
      'Internal error'
    )
  }
}
