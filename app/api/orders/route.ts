import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { RouteResponse } from '@/lib/types'

interface SaleResponse {
  sale_id: number
  machine_id: number | null
  sale_time: string
  quantity: number
  amount: number | null
  product_identifier: string | null
}

/**
 * Получение данных о продажах за указанный период.
 *
 * Возвращает массив оплаченных заказов (только со статусом "paid") за указанный период.
 *
 * Все даты и время в базе данных Supabase хранятся в UTC.
 * Для корректной работы интеграции с 1C и другими системами,
 * используйте UTC при передаче и обработке дат.
 *
 * Параметры запроса (URL):
 *   - start_date: Начальная дата периода (строка в формате ISO, UTC)
 *   - end_date: Конечная дата периода (строка в формате ISO, UTC)
 *
 * Пример запроса:
 *   GET /api/orders?start_date=2025-11-01T00:00:00Z&end_date=2025-11-04T23:59:59Z
 *
 * Ответ: Объект с массивом продаж
 *   {
 *     "success": true,
 *     "data": [
 *       {
 *         "sale_id": 123,              // Уникальный идентификатор продажи
 *         "machine_id": 5,             // Идентификатор аппарата
 *         "sale_time": "2025-11-04...", // Время продажи (UTC)
 *         "quantity": 1,               // Количество (всегда 1)
 *         "amount": 350,               // Сумма продажи
 *         "product_identifier": "SNK123" // Артикул товара (SKU)
 *       }
 *     ]
 *   }
 *
 * Важно:
 *   - Возвращаются только оплаченные заказы (status = "paid")
 *   - Все временные значения в UTC
 *   - Для локального времени (например, Алматы UTC+6) конвертируйте самостоятельно
 *   - sale_id уникален для каждой продажи
 */
export async function GET(request: Request): RouteResponse<SaleResponse[]> {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'start_date and end_date are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data } = await supabase
      .from('orders')
      .select(
        `
        id,
        machine_id,
        created_at,
        machine_product_id,
        machine_products (
          product_id,
          products (
            sku,
            price
          )
        )
      `
      )
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })

    // Format response
    const sales: SaleResponse[] = (data ?? []).map(order => ({
      sale_id: order.id,
      machine_id: order.machine_id,
      sale_time: order.created_at,
      quantity: 1,
      amount: order.machine_products?.products?.price ?? null,
      product_identifier: order.machine_products?.products?.sku ?? null
    }))

    return NextResponse.json({ success: true, data: sales })
  } catch (error) {
    console.error('Unexpected error fetching sales:', error)

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
