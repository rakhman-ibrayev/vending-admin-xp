import { RESPONSE_CODES } from '@/entities/kaspi/constants'
import { buildResponse, parseKaspiDate } from '@/entities/kaspi/helpers'
import { createDangerousServerClient } from '@/lib/supabase/dangerous-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const txn_id = searchParams.get('txn_id')
  const account = searchParams.get('account')
  const command = searchParams.get('command')
  const sum = searchParams.get('sum')
  const txn_date = searchParams.get('txn_date')

  // Validate common required parameters
  if (!txn_id || !account || !command) {
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
    const supabase = createDangerousServerClient()

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
    const machineProduct = order.machine_products
    const productPrice = machineProduct?.products?.price
    const formattedSum = productPrice ? productPrice.toFixed(2) : '0.00'

    // Handle CHECK command
    if (command === 'check') {
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
            undefined,
            formattedSum
          )
      }
    }

    // Handle PAY command
    if (command === 'pay') {
      // Validate pay-specific parameters
      if (!sum || !txn_date) {
        return NextResponse.json(
          { error: 'Missing parameters for pay command' },
          { status: 400 }
        )
      }

      // Validate order status for payment
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
      if (machineProduct && machineProduct.current_stock > 0) {
        const { error: stockError } = await supabase
          .from('machine_products')
          .update({
            current_stock: machineProduct.current_stock - 1,
            last_restocked: new Date().toISOString()
          })
          .eq('id', machineProduct.id)

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
    }

    // Invalid command
    return NextResponse.json({ error: 'Invalid command' }, { status: 400 })
  } catch (error) {
    console.error(`Kaspi ${command} error:`, error)

    return buildResponse(
      txn_id,
      RESPONSE_CODES.INTERNAL_ERROR,
      `Internal error${command === 'pay' ? ' processing payment' : ''}`
    )
  }
}
