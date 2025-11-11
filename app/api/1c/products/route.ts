import { createDangerousServerClient } from '@/lib/supabase/dangerous-server'
import { NextResponse } from 'next/server'
import type { RouteResponse } from '@/lib/types'

interface ProductStockUpdate {
  name: string
  sku: string
  price: number
  stock: number
  unit: string | null
  image: string | null
  category: string | null
}

type ProductResponse = {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  unit: string | null
  image: string | null
  category: string | null
}

/**
 * Обновление остатков товаров от 1C.
 *
 * Принимает POST-запрос с массивом товаров. Каждый элемент:
 *   - name: наименование (строка)
 *   - sku: артикул (строка, уникальный идентификатор)
 *   - price: цена (число)
 *   - stock: остаток (число)
 *   - unit: единица измерения (строка, может быть null)
 *   - image: ссылка на изображение товара (строка, может быть null)
 *   - category: категория товара (строка, может быть null)
 *
 * Логика работы (ежедневная синхронизация остатков):
 *   - Если товар с таким артикулом уже существует: обновляются все поля (наименование, цена, остаток, единица измерения)
 *   - Если товар новый: создается новая позиция с указанными данными
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

    const supabase = createDangerousServerClient()

    const { data: upsertedProducts } = await supabase
      .from('products')
      .upsert(
        products.map(p => ({
          name: p.name,
          sku: p.sku,
          price: p.price,
          stock: p.stock,
          unit: p.unit,
          image: p.image,
          category: p.category
        })),
        { onConflict: 'sku', ignoreDuplicates: false }
      )
      .select()

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
