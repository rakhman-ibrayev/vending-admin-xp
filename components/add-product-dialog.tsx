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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    cost: "",
    supplier: "",
    barcode: "",
    initialStock: "",
    lowStockThreshold: "",
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Adding product:", formData)
    onOpenChange(false)
    // Reset form
    setFormData({
      name: "",
      category: "",
      price: "",
      cost: "",
      supplier: "",
      barcode: "",
      initialStock: "",
      lowStockThreshold: "",
      description: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-work-sans)]">Добавить новый товар</DialogTitle>
          <DialogDescription>Заполните информацию о новом товаре для вендинговых аппаратов</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название товара</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Например: Кока-Кола 0.5л"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drinks">Напитки</SelectItem>
                  <SelectItem value="snacks">Снеки</SelectItem>
                  <SelectItem value="chocolate">Шоколад</SelectItem>
                  <SelectItem value="hot-drinks">Горячие напитки</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Цена продажи (₽)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="89"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Себестоимость (₽)</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData((prev) => ({ ...prev, cost: e.target.value }))}
                placeholder="45"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Поставщик</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData((prev) => ({ ...prev, supplier: e.target.value }))}
              placeholder="Например: Coca-Cola HBC"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Штрих-код</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
              placeholder="4607065390013"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initialStock">Начальный запас</Label>
              <Input
                id="initialStock"
                type="number"
                value={formData.initialStock}
                onChange={(e) => setFormData((prev) => ({ ...prev, initialStock: e.target.value }))}
                placeholder="100"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Минимальный запас</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData((prev) => ({ ...prev, lowStockThreshold: e.target.value }))}
                placeholder="20"
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Дополнительная информация о товаре"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Добавить товар</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
