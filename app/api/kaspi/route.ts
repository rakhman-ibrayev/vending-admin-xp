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
        machine_id,
        machine_products (
          id,
          current_stock,
          max_capacity,
          product_id,
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
        console.error(
          `Payment amount mismatch. Expected: ${formattedSum}, Received: ${sum}`
        )
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
        console.error('Error parsing transaction date:', dateError)
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
          amount_paid: productPrice,
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

      // Update product sales by day analytics
      if (order.machine_id && machineProduct?.product_id && productPrice) {
        const saleDate = kaspiDate.toISOString().split('T')[0] // YYYY-MM-DD format

        // Try to update existing record first (increment sales)
        const { data: existingSale, error: selectError } = await supabase
          .from('product_sales_by_day')
          .select('num_sales, amount')
          .eq('day', saleDate)
          .eq('machine_id', order.machine_id)
          .eq('product_id', machineProduct.product_id)
          .single()

        if (existingSale && !selectError) {
          // Update existing record
          const { error: updateSalesError } = await supabase
            .from('product_sales_by_day')
            .update({
              num_sales: (existingSale.num_sales || 0) + 1,
              amount: (existingSale.amount || 0) + productPrice
            })
            .eq('day', saleDate)
            .eq('machine_id', order.machine_id)
            .eq('product_id', machineProduct.product_id)

          if (updateSalesError) {
            console.error('Error updating sales analytics:', updateSalesError)
          }
        } else {
          // Insert new record
          const { error: insertSalesError } = await supabase
            .from('product_sales_by_day')
            .insert({
              day: saleDate,
              machine_id: order.machine_id,
              product_id: machineProduct.product_id,
              num_sales: 1,
              amount: productPrice
            })

          if (insertSalesError) {
            console.error('Error inserting sales analytics:', insertSalesError)
          }
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
