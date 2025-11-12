'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ProductSelector } from '@/features/product-selector'
import { PlusCircle, Trash2 } from 'lucide-react'
import { memo, useState } from 'react'
import { formatPrice } from '@/lib/supabase/helpers'

interface MachineCardProps {
  index: number
  productId: number
  productName: string
  productSku: string
  productPrice: number
  productStock: number
  isEmpty: boolean
  restockQty: number
  maxCapacity: number
  validationError: string | null
  onProductChange: (index: number, productId: string) => void
  onRemoveProduct: (index: number) => void
  onRestockQtyChange: (index: number, qty: number) => void
  onMaxCapacityChange: (index: number, capacity: number) => void
  fillSlotToMax: (index: number, maxCapacity: number) => void
}

const MachineCard = memo(
  ({
    index,
    productId,
    productName,
    productSku,
    productPrice,
    productStock,
    isEmpty,
    restockQty,
    maxCapacity,
    validationError,
    onProductChange,
    onRemoveProduct,
    onRestockQtyChange,
    onMaxCapacityChange,
    fillSlotToMax
  }: MachineCardProps) => {
    const [isEditing, setIsEditing] = useState(false)

    return (
      <Card
        className={`p-3 ${validationError ? 'bg-red-50 border-red-300' : 'bg-white'}`}
      >
        <CardContent className="p-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="font-mono text-sm min-w-[3rem]"
              >
                {index + 1}
              </Badge>

              {isEditing && (
                <ProductSelector
                  value={{
                    id: productId,
                    name: productName,
                    sku: productSku
                  }}
                  onValueChange={value => {
                    onProductChange(index, value.id.toString())
                    setIsEditing(false)
                  }}
                  onCancelClick={() => setIsEditing(false)}
                  className="flex-1 max-w-none"
                  modal
                />
              )}

              {!isEmpty && !isEditing && (
                <>
                  <span className="font-medium">{productName}</span>

                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => onRemoveProduct(index)}
                    className="text-xs text-red-600 hover:text-red-700 ml-auto"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}

              {isEmpty && !isEditing && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 ml-auto"
                  title="Добавить товар в слот"
                >
                  <PlusCircle />
                </Button>
              )}
            </div>

            {!isEmpty && !isEditing && (
              <>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <span>Запас:</span>

                  <Input
                    type="number"
                    name={`slots.${index}.restockQty`}
                    value={restockQty}
                    onChange={e =>
                      onRestockQtyChange(index, Number(e.target.value))
                    }
                    className={`w-16 text-center ${validationError ? 'border-red-500' : ''}`}
                    min="0"
                    max={maxCapacity}
                  />

                  <span>из</span>

                  <Input
                    type="number"
                    name={`slots.${index}.maxCapacity`}
                    value={maxCapacity}
                    onChange={e =>
                      onMaxCapacityChange(index, Number(e.target.value))
                    }
                    className="w-16 text-center"
                    min="0"
                  />

                  <span>(На складе: {productStock})</span>
                </div>

                {validationError && (
                  <div className="text-xs text-red-600 font-medium">
                    {validationError}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="link"
                    size="sm"
                    type="button"
                    onClick={() => fillSlotToMax(index, maxCapacity)}
                    className="text-xs p-0"
                  >
                    Заполнить
                  </Button>

                  <span className="ml-auto font-medium">
                    {formatPrice(productPrice)}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)

export { MachineCard, type MachineCardProps }
