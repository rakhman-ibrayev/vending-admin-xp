import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { RouteResponse } from '@/lib/types'

interface ProductStockUpdate {
  name: string
  sku: string
  price: number
  stock: number
  unit: string
}

type ProductResponse = {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  unit: string | null
}

/**
 * Обновление остатков товаров от 1C.
 *
 * Принимает POST-запрос с массивом товаров. Каждый элемент:
 *   - name: наименование (строка)
 *   - sku: артикул (строка, уникальный идентификатор)
 *   - price: цена (число)
 *   - stock: остаток (число)
 *   - unit: единица измерения (строка)
 *
 * Логика работы (ежедневная синхронизация остатков):
 *   - Если товар с таким артикулом уже существует: обновляются все поля (наименование, цена, остаток, единица измерения)
 *   - Если товар новый: создается новая позиция с указанными данными
 *   - Если товар не передан в сегодняшнем массиве: его остаток устанавливается в 0
 *
 * Примеры:
 *   - День 1: передано 50 товаров → все обновлены/созданы
 *   - День 2: передано 40 товаров → 40 обновлены, 10 отсутствующих → остаток = 0
 *
 * Все даты и время в базе данных Supabase хранятся в UTC.
 *
 * Пример запроса:
 *   POST /api/products
 *   Body: [
 *     { "name": "Сникерс", "sku": "SNK123", "price": 350, "stock": 10, "unit": "шт" },
 *     { "name": "Mars", "sku": "MRS456", "price": 300, "stock": 15, "unit": "шт" }
 *   ]
 *
 * Ответ:
 *   {
 *     "success": true,
 *     "data": [массив обновленных товаров с их остатками]
 *   }
 */
export async function POST(request: Request): RouteResponse<ProductResponse[]> {
  try {
    const products: ProductStockUpdate[] = await request.json()

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { success: false, message: 'Payload must be an array' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get all SKUs from incoming payload
    const incomingSkus = products.map(p => p.sku)

    // Fetch all existing products from DB to identify missing ones
    const { data: dbProducts } = await supabase.from('products').select('sku')

    // This is atomic and handles both inserts and updates in one operation
    const { data: upsertedProducts } = await supabase
      .from('products')
      .upsert(
        products.map(p => ({
          name: p.name,
          sku: p.sku,
          price: p.price,
          stock: p.stock,
          unit: p.unit
        })),
        { onConflict: 'sku', ignoreDuplicates: false }
      )
      .select()

    // Set stock to zero for products not present in today's payload
    const missingSkus = (dbProducts ?? [])
      .filter(p => !incomingSkus.includes(p.sku))
      .map(p => p.sku)

    if (missingSkus.length > 0) {
      await supabase
        .from('products')
        .update({ stock: 0 })
        .in('sku', missingSkus)
    }

    return NextResponse.json({
      success: true,
      data: (upsertedProducts ?? []) as ProductResponse[]
    })
  } catch (error) {
    console.error('Error updating products:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
