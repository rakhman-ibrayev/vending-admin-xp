"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Zap, AlertTriangle, TrendingUp } from "lucide-react"

interface Product {
  id: string
  name: string
  category: string
  totalStock: number
  lowStockThreshold: number
  salesThisMonth: number
}

interface QuickRestockActionsProps {
  products: Product[]
  onQuickRestock: (productId: string, quantity: number) => void
}

export function QuickRestockActions({ products, onQuickRestock }: QuickRestockActionsProps) {
  const lowStockProducts = products.filter((p) => p.totalStock <= p.lowStockThreshold)
  const topSellingProducts = products.sort((a, b) => b.salesThisMonth - a.salesThisMonth).slice(0, 3)

  const getQuickRestockAmount = (product: Product) => {
    const weeklySales = Math.ceil(product.salesThisMonth / 4)
    return Math.max(product.lowStockThreshold, weeklySales * 2)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Товары с низким запасом */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Требуют пополнения
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Все товары в достаточном количестве</p>
          ) : (
            lowStockProducts.slice(0, 3).map((product) => {
              const quickAmount = getQuickRestockAmount(product)
              return (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      <span>Осталось: {product.totalStock}</span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => onQuickRestock(product.id, quickAmount)} className="gap-1">
                    <Zap className="h-3 w-3" />+{quickAmount}
                  </Button>
                </div>
              )
            })
          )}
          {lowStockProducts.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">И еще {lowStockProducts.length - 3} товаров...</p>
          )}
        </CardContent>
      </Card>

      {/* Популярные товары */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Популярные товары
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topSellingProducts.map((product) => {
            const quickAmount = Math.ceil(product.salesThisMonth / 4) // Недельные продажи
            return (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    <span>{product.salesThisMonth} продаж/мес</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onQuickRestock(product.id, quickAmount)}
                  className="gap-1"
                >
                  <Package className="h-3 w-3" />+{quickAmount}
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
