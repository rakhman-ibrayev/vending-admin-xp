"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, TrendingUp } from "lucide-react"

interface Product {
  id: string
  name: string
  category: string
  totalStock: number
  lowStockThreshold: number
  cost: number
  supplier: string
  salesThisMonth: number
}

interface BulkRestockDialogProps {
  products: Product[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BulkRestockDialog({ products, open, onOpenChange }: BulkRestockDialogProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [quantities, setQuantities] = useState<Record<string, string>>({})
  const [reason, setReason] = useState("")

  // Товары с низким запасом
  const lowStockProducts = products.filter((p) => p.totalStock <= p.lowStockThreshold)

  // Рекомендуемые количества на основе продаж
  const getRecommendedQuantity = (product: Product) => {
    const weeklySales = Math.ceil(product.salesThisMonth / 4)
    const stockNeeded = Math.max(product.lowStockThreshold * 2, weeklySales * 2)
    return Math.max(0, stockNeeded - product.totalStock)
  }

  const handleProductToggle = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts)
    if (checked) {
      newSelected.add(productId)
      // Автоматически устанавливаем рекомендуемое количество
      const product = products.find((p) => p.id === productId)
      if (product) {
        setQuantities((prev) => ({
          ...prev,
          [productId]: getRecommendedQuantity(product).toString(),
        }))
      }
    } else {
      newSelected.delete(productId)
      setQuantities((prev) => {
        const newQuantities = { ...prev }
        delete newQuantities[productId]
        return newQuantities
      })
    }
    setSelectedProducts(newSelected)
  }

  const handleQuantityChange = (productId: string, value: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updates = Array.from(selectedProducts).map((productId) => ({
      productId,
      quantity: Number.parseInt(quantities[productId] || "0"),
      reason,
    }))

    console.log("Bulk restock:", updates)
    onOpenChange(false)
    setSelectedProducts(new Set())
    setQuantities({})
    setReason("")
  }

  const totalCost = Array.from(selectedProducts).reduce((sum, productId) => {
    const product = products.find((p) => p.id === productId)
    const quantity = Number.parseInt(quantities[productId] || "0")
    return sum + (product ? product.cost * quantity : 0)
  }, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-work-sans)]">Массовое пополнение товаров</DialogTitle>
          <DialogDescription>Выберите товары для пополнения и укажите количество</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Быстрые действия */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const lowStockIds = new Set(lowStockProducts.map((p) => p.id))
                  setSelectedProducts(lowStockIds)
                  const newQuantities: Record<string, string> = {}
                  lowStockProducts.forEach((product) => {
                    newQuantities[product.id] = getRecommendedQuantity(product).toString()
                  })
                  setQuantities(newQuantities)
                }}
                className="w-full gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Выбрать все товары с низким запасом ({lowStockProducts.length})
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedProducts(new Set(products.map((p) => p.id)))
                    const newQuantities: Record<string, string> = {}
                    products.forEach((product) => {
                      newQuantities[product.id] = getRecommendedQuantity(product).toString()
                    })
                    setQuantities(newQuantities)
                  }}
                  className="flex-1"
                >
                  Выбрать все
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedProducts(new Set())
                    setQuantities({})
                  }}
                  className="flex-1"
                >
                  Очистить выбор
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Список товаров */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Товары для пополнения</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {products.map((product) => {
                const isSelected = selectedProducts.has(product.id)
                const isLowStock = product.totalStock <= product.lowStockThreshold
                const recommendedQty = getRecommendedQuantity(product)

                return (
                  <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleProductToggle(product.id, !!checked)}
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{product.category}</Badge>
                            <span>Текущий запас: {product.totalStock}</span>
                            {isLowStock && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Низкий запас
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-right text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            {product.salesThisMonth} продаж/мес
                          </div>
                          <div className="text-xs text-muted-foreground">Рекомендуется: {recommendedQty} шт</div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`qty-${product.id}`} className="text-sm">
                            Количество:
                          </Label>
                          <Input
                            id={`qty-${product.id}`}
                            type="number"
                            value={quantities[product.id] || ""}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            placeholder="0"
                            min="1"
                            className="w-24"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, recommendedQty.toString())}
                            className="text-xs"
                          >
                            Рекомендуемое
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            ₽{(Number.parseInt(quantities[product.id] || "0") * product.cost || 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Итоговая информация */}
          {selectedProducts.size > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span>Выбрано товаров: {selectedProducts.size}</span>
                  <span className="font-bold">Общая стоимость: ₽{totalCost.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Причина */}
          <div className="space-y-2">
            <Label htmlFor="bulk-reason">Причина пополнения</Label>
            <Textarea
              id="bulk-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Плановое пополнение, поступление от поставщика..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={selectedProducts.size === 0}>
              Пополнить товары ({selectedProducts.size})
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
