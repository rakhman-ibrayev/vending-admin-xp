"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { AddProductDialog } from "@/components/add-product-dialog"
import { StockUpdateDialog } from "@/components/stock-update-dialog"
import { BulkRestockDialog } from "@/components/bulk-restock-dialog"
import { QuickRestockActions } from "@/components/quick-restock-actions"

// Mock data for inventory
const products = [
  {
    id: "P-001",
    name: "Кока-Кола 0.5л",
    category: "Напитки",
    price: 89,
    totalStock: 245,
    lowStockThreshold: 50,
    cost: 45,
    supplier: "Coca-Cola HBC",
    barcode: "4607065390013",
    lastRestocked: "2024-01-15",
    salesThisMonth: 156,
  },
  {
    id: "P-002",
    name: "Сникерс",
    category: "Шоколад",
    price: 65,
    totalStock: 23,
    lowStockThreshold: 30,
    cost: 35,
    supplier: "Mars",
    barcode: "4011100062504",
    lastRestocked: "2024-01-10",
    salesThisMonth: 89,
  },
  {
    id: "P-003",
    name: "Вода Бон Аква 0.5л",
    category: "Напитки",
    price: 45,
    totalStock: 189,
    lowStockThreshold: 40,
    cost: 22,
    supplier: "Coca-Cola HBC",
    barcode: "4607065390020",
    lastRestocked: "2024-01-12",
    salesThisMonth: 234,
  },
  {
    id: "P-004",
    name: "Чипсы Лейс Классические",
    category: "Снеки",
    price: 75,
    totalStock: 67,
    lowStockThreshold: 25,
    cost: 42,
    supplier: "PepsiCo",
    barcode: "4607065390037",
    lastRestocked: "2024-01-14",
    salesThisMonth: 78,
  },
  {
    id: "P-005",
    name: "Кофе Нескафе 3в1",
    category: "Горячие напитки",
    price: 35,
    totalStock: 12,
    lowStockThreshold: 20,
    cost: 18,
    supplier: "Nestle",
    barcode: "4607065390044",
    lastRestocked: "2024-01-08",
    salesThisMonth: 45,
  },
]

const categories = ["Все", "Напитки", "Шоколад", "Снеки", "Горячие напитки"]

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Все")
  const [stockFilter, setStockFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<(typeof products)[0] | null>(null)
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const [isBulkRestockOpen, setIsBulkRestockOpen] = useState(false)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "Все" || product.category === categoryFilter
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.totalStock <= product.lowStockThreshold) ||
      (stockFilter === "out" && product.totalStock === 0)
    return matchesSearch && matchesCategory && matchesStock
  })

  const lowStockCount = products.filter((p) => p.totalStock <= p.lowStockThreshold && p.totalStock > 0).length
  const outOfStockCount = products.filter((p) => p.totalStock === 0).length
  const totalValue = products.reduce((sum, p) => sum + p.totalStock * p.cost, 0)

  const handleUpdateStock = (product: (typeof products)[0]) => {
    setSelectedProduct(product)
    setIsStockDialogOpen(true)
  }

  const handleQuickRestock = (productId: string, quantity: number) => {
    console.log("Quick restock:", { productId, quantity, reason: "Быстрое пополнение" })
    // Здесь будет логика обновления запасов
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mt-12 md:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                  Управление товарами
                </h1>
                <p className="text-muted-foreground mt-2">Контроль запасов и управление ассортиментом</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsBulkRestockOpen(true)} variant="outline" className="gap-2">
                  <Package className="h-4 w-4" />
                  Массовое пополнение
                </Button>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Добавить товар
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">активных позиций</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Низкие запасы</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
                <p className="text-xs text-muted-foreground">требуют пополнения</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Нет в наличии</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
                <p className="text-xs text-muted-foreground">товаров закончилось</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Стоимость запасов</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₽{totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">общая стоимость</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Restock Actions */}
          <QuickRestockActions products={products} onQuickRestock={handleQuickRestock} />

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск товаров..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Filter className="h-4 w-4" />
                      Категория: {categoryFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {categories.map((category) => (
                      <DropdownMenuItem key={category} onClick={() => setCategoryFilter(category)}>
                        {category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Package className="h-4 w-4" />
                      Запасы: {stockFilter === "all" ? "Все" : stockFilter === "low" ? "Низкие" : "Закончились"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStockFilter("all")}>Все товары</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStockFilter("low")}>Низкие запасы</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStockFilter("out")}>Нет в наличии</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Товары ({filteredProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Товар</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Запас</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Продажи за месяц</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const isLowStock = product.totalStock <= product.lowStockThreshold && product.totalStock > 0
                    const isOutOfStock = product.totalStock === 0

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>₽{product.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                isOutOfStock ? "text-red-600" : isLowStock ? "text-yellow-600" : "text-foreground"
                              }`}
                            >
                              {product.totalStock}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStock(product)}
                              className="h-6 px-2 text-xs"
                            >
                              Пополнить
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isOutOfStock ? (
                            <Badge variant="destructive">Нет в наличии</Badge>
                          ) : isLowStock ? (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Низкий запас
                            </Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              В наличии
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            {product.salesThisMonth}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStock(product)}>
                                <Package className="h-4 w-4 mr-2" />
                                Управление запасами
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Товары не найдены</h3>
                  <p className="text-muted-foreground">Попробуйте изменить параметры поиска или добавить новый товар</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AddProductDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      <StockUpdateDialog product={selectedProduct} open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen} />

      <BulkRestockDialog products={products} open={isBulkRestockOpen} onOpenChange={setIsBulkRestockOpen} />
    </div>
  )
}
