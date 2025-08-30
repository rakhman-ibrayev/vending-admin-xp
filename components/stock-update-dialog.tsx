'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  category: string
  totalStock: number
  lowStockThreshold: number
  cost: number
  supplier: string
}

interface StockUpdateDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockUpdateDialog({
  product,
  open,
  onOpenChange
}: StockUpdateDialogProps) {
  const [updateType, setUpdateType] = useState<'add' | 'remove'>('add')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')

  if (!product) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const change =
      updateType === 'add'
        ? Number.parseInt(quantity)
        : -Number.parseInt(quantity)
    console.log('Stock update:', {
      productId: product.id,
      change,
      reason,
      newTotal: product.totalStock + change
    })
    onOpenChange(false)
    setQuantity('')
    setReason('')
  }

  const isLowStock = product.totalStock <= product.lowStockThreshold

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-work-sans)]">
            Управление запасами
          </DialogTitle>
          <DialogDescription>
            Пополнение или списание товара: {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Stock Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Текущий статус
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Товар:</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Категория:</span>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Текущий запас:</span>
                <span
                  className={`font-bold ${isLowStock ? 'text-yellow-600' : 'text-foreground'}`}
                >
                  {product.totalStock} шт.
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Минимальный запас:</span>
                <span className="text-muted-foreground">
                  {product.lowStockThreshold} шт.
                </span>
              </div>
              {isLowStock && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-medium">Низкий запас!</span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    Рекомендуется пополнить запас
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Update Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Тип операции</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={updateType === 'add' ? 'default' : 'outline'}
                  onClick={() => setUpdateType('add')}
                  className="flex-1 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Пополнение
                </Button>
                <Button
                  type="button"
                  variant={updateType === 'remove' ? 'default' : 'outline'}
                  onClick={() => setUpdateType('remove')}
                  className="flex-1 gap-2"
                >
                  <Minus className="h-4 w-4" />
                  Списание
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Количество</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="Введите количество"
                min="1"
                required
              />
              {quantity && (
                <p className="text-sm text-muted-foreground">
                  Новый запас:{' '}
                  {product.totalStock +
                    (updateType === 'add'
                      ? Number.parseInt(quantity) || 0
                      : -(Number.parseInt(quantity) || 0))}{' '}
                  шт.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Причина</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={
                  updateType === 'add'
                    ? 'Поступление от поставщика, пополнение аппарата...'
                    : 'Брак, истечение срока годности, поломка...'
                }
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit">
                {updateType === 'add' ? 'Пополнить' : 'Списать'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
