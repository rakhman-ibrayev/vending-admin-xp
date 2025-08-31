'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Plus,
  Minus,
  Package,
  AlertTriangle,
  ShoppingCart,
  Trash2,
  Edit3
} from 'lucide-react'

interface Machine {
  id: string
  name: string
  location: string
  slotsCount: number
  slotCapacity: number
}

interface Product {
  id: string
  name: string
  category: string
  price: number
}

interface MachineSlot {
  slotNumber: number
  product: Product | null
  currentStock: number
  maxCapacity: number
}

interface MachineRestockDialogProps {
  machine: Machine | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mockProducts: Product[] = [
  { id: '1', name: 'Кока-Кола 0.5л', category: 'Напитки', price: 80 },
  { id: '2', name: 'Пепси 0.5л', category: 'Напитки', price: 75 },
  { id: '3', name: 'Сникерс', category: 'Шоколад', price: 65 },
  { id: '4', name: 'Твикс', category: 'Шоколад', price: 70 },
  { id: '5', name: 'Чипсы Лейс', category: 'Снеки', price: 90 },
  { id: '6', name: 'Орешки', category: 'Снеки', price: 120 },
  { id: '7', name: 'Вода 0.5л', category: 'Напитки', price: 40 },
  { id: '8', name: 'Кит-Кат', category: 'Шоколад', price: 75 },
  { id: '9', name: 'Фанта 0.5л', category: 'Напитки', price: 75 },
  { id: '10', name: 'Марс', category: 'Шоколад', price: 65 }
]

const getMachineSlots = (machine: Machine): MachineSlot[] => {
  // В реальном приложении это будет загружаться с сервера
  const slots: MachineSlot[] = []

  for (let i = 1; i <= machine.slotsCount; i++) {
    // Заполняем первые несколько слотов для демонстрации
    if (i <= 8) {
      slots.push({
        slotNumber: i,
        product: mockProducts[i - 1],
        currentStock: Math.floor(Math.random() * machine.slotCapacity),
        maxCapacity: machine.slotCapacity
      })
    } else {
      // Остальные слоты пустые
      slots.push({
        slotNumber: i,
        product: null,
        currentStock: 0,
        maxCapacity: machine.slotCapacity
      })
    }
  }

  return slots
}

interface ProductSelectorProps {
  onValueChange: (value: string) => void
  onCancelClick: () => void
}

function ProductSelector({
  onValueChange,
  onCancelClick
}: ProductSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={onValueChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Выберите товар" />
        </SelectTrigger>

        <SelectContent>
          {mockProducts.map(product => (
            <SelectItem key={product.id} value={product.id}>
              {product.name} - ₸{product.price}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" onClick={onCancelClick}>
        Отмена
      </Button>
    </div>
  )
}

export function MachineRestockDialog({
  machine,
  open,
  onOpenChange
}: MachineRestockDialogProps) {
  const [restockQuantities, setRestockQuantities] = useState<
    Record<number, number>
  >({})
  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const [slotChanges, setSlotChanges] = useState<
    Record<number, { productId: string | null; action: 'change' | 'remove' }>
  >({})

  if (!machine) return null

  const machineSlots = getMachineSlots(machine)

  const updateQuantity = (slotNumber: number, change: number) => {
    const slot = machineSlots.find(s => s.slotNumber === slotNumber)
    if (!slot) return

    const currentRestock = restockQuantities[slotNumber] || 0
    const newQuantity = Math.max(
      0,
      Math.min(slot.maxCapacity - slot.currentStock, currentRestock + change)
    )

    setRestockQuantities(prev => ({
      ...prev,
      [slotNumber]: newQuantity
    }))
  }

  const setQuantity = (slotNumber: number, quantity: string) => {
    const slot = machineSlots.find(s => s.slotNumber === slotNumber)
    if (!slot) return

    const numQuantity = Number.parseInt(quantity) || 0
    const maxPossible = slot.maxCapacity - slot.currentStock
    const finalQuantity = Math.max(0, Math.min(maxPossible, numQuantity))

    setRestockQuantities(prev => ({
      ...prev,
      [slotNumber]: finalQuantity
    }))
  }

  const changeSlotProduct = (slotNumber: number, productId: string) => {
    setSlotChanges(prev => ({
      ...prev,
      [slotNumber]: { productId, action: 'change' }
    }))
    setEditingSlot(null)
    // Сбрасываем количество пополнения при смене товара
    setRestockQuantities(prev => {
      const newQuantities = { ...prev }
      delete newQuantities[slotNumber]
      return newQuantities
    })
  }

  const removeSlotProduct = (slotNumber: number) => {
    setSlotChanges(prev => ({
      ...prev,
      [slotNumber]: { productId: null, action: 'remove' }
    }))
    setRestockQuantities(prev => {
      const newQuantities = { ...prev }
      delete newQuantities[slotNumber]
      return newQuantities
    })
  }

  const getSlotProduct = (slot: MachineSlot): Product | null => {
    const change = slotChanges[slot.slotNumber]
    if (change) {
      if (change.action === 'remove') return null
      if (change.action === 'change' && change.productId) {
        return mockProducts.find(p => p.id === change.productId) || null
      }
    }
    return slot.product
  }

  const getSlotStock = (slot: MachineSlot): number => {
    const change = slotChanges[slot.slotNumber]
    if (change && change.action === 'remove') return 0
    if (change && change.action === 'change') return 0 // При смене товара запас сбрасывается
    return slot.currentStock
  }

  const totalItems = Object.values(restockQuantities).reduce(
    (sum, qty) => sum + qty,
    0
  )
  const totalCost = machineSlots.reduce((sum, slot) => {
    const quantity = restockQuantities[slot.slotNumber] || 0
    const product = getSlotProduct(slot)
    const price = product?.price || 0
    return sum + quantity * price * 0.6 // Предполагаем закупочную цену 60% от розничной
  }, 0)

  const handleRestock = () => {
    console.log('[v0] Пополнение слотов для аппарата:', machine.id, {
      restockQuantities,
      slotChanges
    })
    // Здесь будет логика отправки данных на сервер
    onOpenChange(false)
    setRestockQuantities({})
    setSlotChanges({})
    setEditingSlot(null)
  }

  const quickFillLowStock = () => {
    const newQuantities: Record<number, number> = {}
    machineSlots.forEach(slot => {
      const product = getSlotProduct(slot)
      const currentStock = getSlotStock(slot)
      const lowStockThreshold = Math.floor(slot.maxCapacity * 0.3) // 30% как низкий запас

      if (product && currentStock <= lowStockThreshold) {
        newQuantities[slot.slotNumber] = slot.maxCapacity - currentStock
      }
    })
    setRestockQuantities(newQuantities)
  }

  const fillSlotToMax = (slotNumber: number) => {
    const slot = machineSlots.find(s => s.slotNumber === slotNumber)
    if (!slot) return

    const currentStock = getSlotStock(slot)
    setRestockQuantities(prev => ({
      ...prev,
      [slotNumber]: slot.maxCapacity - currentStock
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[1000px] !max-w-[95%] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-work-sans)] text-xl flex items-center gap-2">
            Управление товарами - {machine.name}
          </DialogTitle>

          <DialogDescription>
            Управление слотами аппарата в {machine.location}. Вы можете менять
            товары, пополнять запасы и управлять ассортиментом.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={quickFillLowStock}
              className="flex items-center gap-2 bg-transparent"
            >
              <AlertTriangle className="h-4 w-4" />
              Пополнить товары с низким запасом
            </Button>

            <Badge variant="secondary" className="px-3 py-1">
              Слотов: {machine.slotsCount} | Вместимость: {machine.slotCapacity}{' '}
              шт/слот
            </Badge>
          </div>

          {/* Machine Slots Grid */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Слоты аппарата
            </h3>

            <div className="grid gap-4">
              {machineSlots.map(slot => {
                const restockQty = restockQuantities[slot.slotNumber] || 0
                const product = getSlotProduct(slot)
                const currentStock = getSlotStock(slot)
                const lowStockThreshold = Math.floor(slot.maxCapacity * 0.3)
                const isLowStock = product && currentStock <= lowStockThreshold
                const isEmpty = !product
                const maxPossible = slot.maxCapacity - currentStock
                const isEditing = editingSlot === slot.slotNumber

                return (
                  <Card
                    key={slot.slotNumber}
                    className={`p-3 ${
                      isEmpty
                        ? 'border-gray-200 bg-gray-50/50'
                        : isLowStock
                          ? 'border-orange-200 bg-orange-50/50'
                          : ''
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col gap-3">
                        {!isEmpty && (
                          <div className="flex items-center gap-2">
                            {!isEditing && (
                              <>
                                <h4 className="font-medium">{product!.name}</h4>

                                <div className="ml-auto">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setEditingSlot(slot.slotNumber)
                                    }
                                    className="text-xs"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeSlotProduct(slot.slotNumber)
                                    }
                                    className="text-xs text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </>
                            )}

                            {isEditing && (
                              <ProductSelector
                                onValueChange={value =>
                                  changeSlotProduct(slot.slotNumber, value)
                                }
                                onCancelClick={() => setEditingSlot(null)}
                              />
                            )}
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              variant="outline"
                              className="font-mono text-sm min-w-[3rem]"
                            >
                              {slot.slotNumber}
                            </Badge>

                            {isEmpty && (
                              <div className="flex items-center gap-2">
                                {!isEditing && (
                                  <span className="text-muted-foreground">
                                    Пустой слот
                                  </span>
                                )}

                                {isEditing && (
                                  <ProductSelector
                                    onValueChange={value =>
                                      changeSlotProduct(slot.slotNumber, value)
                                    }
                                    onCancelClick={() => setEditingSlot(null)}
                                  />
                                )}

                                {!isEditing && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setEditingSlot(slot.slotNumber)
                                    }
                                    className="flex items-center gap-1"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Добавить товар
                                  </Button>
                                )}
                              </div>
                            )}

                            {!isEmpty && isLowStock && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Низкий запас
                              </Badge>
                            )}
                          </div>

                          {!isEmpty && (
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-4">
                                <span>
                                  Запас: {currentStock} / {slot.maxCapacity}
                                </span>

                                <span>Цена: ₸{product!.price}</span>
                              </div>

                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${isLowStock ? 'bg-orange-500' : 'bg-green-500'}`}
                                  style={{
                                    width: `${(currentStock / slot.maxCapacity) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!isEmpty && !isEditing && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fillSlotToMax(slot.slotNumber)}
                                className="text-xs"
                              >
                                Заполнить
                              </Button>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateQuantity(slot.slotNumber, -1)
                                  }
                                  disabled={restockQty <= 0}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>

                                <Input
                                  type="number"
                                  value={restockQty}
                                  onChange={e =>
                                    setQuantity(slot.slotNumber, e.target.value)
                                  }
                                  className="w-16 text-center"
                                  min="0"
                                  max={maxPossible}
                                />

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateQuantity(slot.slotNumber, 1)
                                  }
                                  disabled={restockQty >= maxPossible}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          {(totalItems > 0 || Object.keys(slotChanges).length > 0) && (
            <Card className="bg-blue-50/50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Итого изменений
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                {Object.keys(slotChanges).length > 0 && (
                  <div className="space-y-1">
                    <div className="font-medium">Изменения товаров:</div>

                    {Object.entries(slotChanges).map(([slotNum, change]) => (
                      <div
                        key={slotNum}
                        className="text-sm text-muted-foreground"
                      >
                        Слот {slotNum}:{' '}
                        {change.action === 'remove'
                          ? 'Товар удален'
                          : `Товар заменен на ${mockProducts.find(p => p.id === change.productId)?.name}`}
                      </div>
                    ))}
                  </div>
                )}

                {totalItems > 0 && (
                  <>
                    <Separator />

                    <div className="flex justify-between">
                      <span>Товаров к пополнению:</span>

                      <span className="font-semibold">{totalItems} шт.</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Стоимость пополнения:</span>

                      <span className="font-semibold">
                        ₸{totalCost.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Отмена
            </Button>

            <Button
              onClick={handleRestock}
              disabled={
                totalItems === 0 && Object.keys(slotChanges).length === 0
              }
              className="flex-1"
            >
              Применить изменения
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
