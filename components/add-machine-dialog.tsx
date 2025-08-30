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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AddMachineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMachineDialog({
  open,
  onOpenChange
}: AddMachineDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    model: '',
    slotsCount: '20',
    slotCapacity: '10',
    description: ''
  })

  const [showSlotPreview, setShowSlotPreview] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your API
    console.log('Adding machine:', formData)
    onOpenChange(false)
    // Reset form
    setFormData({
      name: '',
      location: '',
      model: '',
      slotsCount: '20',
      slotCapacity: '10',
      description: ''
    })
    setShowSlotPreview(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-work-sans)]">
            Добавить новый аппарат
          </DialogTitle>
          <DialogDescription>
            Заполните информацию о новом вендинговом аппарате
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название аппарата</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="Например: Мега Центр #1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Местоположение</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={e =>
                setFormData(prev => ({ ...prev, location: e.target.value }))
              }
              placeholder="Например: ТЦ Мега, 1 этаж, вход А"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Модель аппарата</Label>
            <Select
              onValueChange={value =>
                setFormData(prev => ({ ...prev, model: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите модель" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendmax-standard-2500">
                  VendMax Standard 2500
                </SelectItem>
                <SelectItem value="vendmax-pro-3000">
                  VendMax Pro 3000
                </SelectItem>
                <SelectItem value="vendmax-premium-4000">
                  VendMax Premium 4000
                </SelectItem>
                <SelectItem value="other">Другая модель</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slotsCount">Количество слотов</Label>
              <Input
                id="slotsCount"
                type="number"
                value={formData.slotsCount}
                onChange={e =>
                  setFormData(prev => ({ ...prev, slotsCount: e.target.value }))
                }
                placeholder="20"
                min="1"
                max="100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slotCapacity">Вместимость каждого слота</Label>
              <Input
                id="slotCapacity"
                type="number"
                value={formData.slotCapacity}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    slotCapacity: e.target.value
                  }))
                }
                placeholder="10"
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSlotPreview(!showSlotPreview)}
            >
              {showSlotPreview ? 'Скрыть' : 'Показать'} схему слотов
            </Button>
            <span className="text-sm text-muted-foreground">
              Всего товаров:{' '}
              {Number(formData.slotsCount) * Number(formData.slotCapacity)}
            </span>
          </div>

          {showSlotPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Схема слотов аппарата</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
                  {Array.from(
                    { length: Number(formData.slotsCount) || 0 },
                    (_, i) => (
                      <div
                        key={i + 1}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs font-medium bg-gray-50"
                      >
                        {i + 1}
                      </div>
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Каждый слот может содержать до {formData.slotCapacity} единиц
                  товара
                </p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Дополнительная информация</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Особенности установки, контактная информация и т.д."
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
            <Button type="submit">Добавить аппарат</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
