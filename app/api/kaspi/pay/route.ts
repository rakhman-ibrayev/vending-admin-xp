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
  prv_txn?: string,
  sum?: string
) {
  const response: any = {
    txn_id,
    result,
    comment,
    bin: process.env.NEXT_PUBLIC_PHARMEXPRESS_COMPANY_BIN
  }

  if (prv_txn !== undefined) response.prv_txn = prv_txn
  if (sum !== undefined) response.sum = sum

  return NextResponse.json({ response }, { status: 200 })
}

function parseKaspiDate(dateStr: string): Date {
  const year = parseInt(dateStr.slice(0, 4))
  const month = parseInt(dateStr.slice(4, 6)) - 1
  const day = parseInt(dateStr.slice(6, 8))
  const hour = parseInt(dateStr.slice(8, 10))
  const minute = parseInt(dateStr.slice(10, 12))
  const second = parseInt(dateStr.slice(12, 14))

  return new Date(year, month, day, hour, minute, second)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const txn_id = searchParams.get('txn_id')
  const account = searchParams.get('account')
  const command = searchParams.get('command')
  const sum = searchParams.get('sum')
  const txn_date = searchParams.get('txn_date')

  if (command !== 'pay') {
    return NextResponse.json({ error: 'Invalid command' }, { status: 400 })
  }

  if (!txn_id || !account || !sum || !txn_date) {
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

    // Get order with all necessary information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        id, 
        status,
        machine_products (
          id,
          current_stock,
          max_capacity,
          products (price)
        )
      `
      )
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return buildResponse(txn_id, RESPONSE_CODES.NOT_FOUND, 'Order not found')
    }

    // Get the product price for validation
    const productPrice = order.machine_products?.products?.price
    const formattedSum = productPrice ? productPrice.toFixed(2) : '0.00'

    // Validate order status
    switch (order.status) {
      case 'cancelled':
        return buildResponse(
          txn_id,
          RESPONSE_CODES.CANCELLED,
          `Order status: ${order.status}`,
          orderId.toString()
        )
      case 'paid':
        return buildResponse(
          txn_id,
          RESPONSE_CODES.PAID,
          `Order status: ${order.status}`,
          orderId.toString()
        )
      case 'failed':
        return buildResponse(
          txn_id,
          RESPONSE_CODES.INTERNAL_ERROR,
          `Order status: ${order.status}`,
          orderId.toString()
        )
    }

    // Validate payment amount
    if (productPrice && parseFloat(sum) !== productPrice) {
      return buildResponse(
        txn_id,
        RESPONSE_CODES.INTERNAL_ERROR,
        `Payment amount mismatch. Expected: ${formattedSum}, Received: ${sum}`,
        orderId.toString(),
        formattedSum
      )
    }

    // Parse Kaspi transaction date
    let kaspiDate: Date

    try {
      kaspiDate = parseKaspiDate(txn_date)
    } catch (dateError) {
      return buildResponse(
        txn_id,
        RESPONSE_CODES.INTERNAL_ERROR,
        'Invalid transaction date format',
        orderId.toString()
      )
    }

    // Update order status to paid
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        date_paid: kaspiDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order:', updateError)

      return buildResponse(
        txn_id,
        RESPONSE_CODES.INTERNAL_ERROR,
        'Failed to update order status',
        orderId.toString()
      )
    }

    // Update machine product stock if available
    if (order.machine_products && order.machine_products.current_stock > 0) {
      const { error: stockError } = await supabase
        .from('machine_products')
        .update({
          current_stock: order.machine_products.current_stock - 1,
          last_restocked: new Date().toISOString()
        })
        .eq('id', order.machine_products.id)

      if (stockError) {
        // Don't fail the payment if stock update fails, just log it
        console.error('Error updating stock:', stockError)
      }
    }

    // Success - payment processed
    return buildResponse(
      txn_id,
      RESPONSE_CODES.SUCCESS,
      'Payment processed successfully',
      orderId.toString(),
      formattedSum
    )
  } catch (error) {
    console.error('Kaspi pay error:', error)

    return buildResponse(
      txn_id,
      RESPONSE_CODES.INTERNAL_ERROR,
      'Internal error processing payment'
    )
  }
}
