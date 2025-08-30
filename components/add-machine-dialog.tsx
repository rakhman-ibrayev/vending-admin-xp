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

interface AddMachineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMachineDialog({ open, onOpenChange }: AddMachineDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    model: "",
    capacity: "",
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your API
    console.log("Adding machine:", formData)
    onOpenChange(false)
    // Reset form
    setFormData({
      name: "",
      location: "",
      model: "",
      capacity: "",
      description: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-work-sans)]">Добавить новый аппарат</DialogTitle>
          <DialogDescription>Заполните информацию о новом вендинговом аппарате</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название аппарата</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Например: Мега Центр #1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Местоположение</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Например: ТЦ Мега, 1 этаж, вход А"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Модель аппарата</Label>
            <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, model: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите модель" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendmax-standard-2500">VendMax Standard 2500</SelectItem>
                <SelectItem value="vendmax-pro-3000">VendMax Pro 3000</SelectItem>
                <SelectItem value="vendmax-premium-4000">VendMax Premium 4000</SelectItem>
                <SelectItem value="other">Другая модель</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Вместимость (количество товаров)</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
              placeholder="Например: 45"
              min="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Дополнительная информация</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Особенности установки, контактная информация и т.д."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Добавить аппарат</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
