"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Thermometer, Package, TrendingUp, Wifi, WifiOff, Wrench, Clock } from "lucide-react"

interface Machine {
  id: string
  name: string
  location: string
  status: string
  lastSync: string
  revenue: number
  capacity: number
  filled: number
  temperature: number | null
  model: string
  installDate: string
}

interface MachineDetailsDialogProps {
  machine: Machine | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig = {
  online: {
    label: "Работает",
    color: "bg-green-500",
    variant: "default" as const,
    icon: Wifi,
  },
  maintenance: {
    label: "Обслуживание",
    color: "bg-yellow-500",
    variant: "secondary" as const,
    icon: Wrench,
  },
  offline: {
    label: "Не в сети",
    color: "bg-red-500",
    variant: "destructive" as const,
    icon: WifiOff,
  },
}

export function MachineDetailsDialog({ machine, open, onOpenChange }: MachineDetailsDialogProps) {
  if (!machine) return null

  const status = statusConfig[machine.status as keyof typeof statusConfig]
  const StatusIcon = status.icon
  const fillPercentage = Math.round((machine.filled / machine.capacity) * 100)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-[family-name:var(--font-work-sans)] text-xl">{machine.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <span>{machine.id}</span>
                <Badge variant={status.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{machine.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>Модель: {machine.model}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Установлен: {new Date(machine.installDate).toLocaleDateString("ru-RU")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Последняя синхронизация: {machine.lastSync}</span>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Текущий статус</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Заполненность</span>
                    <span className="font-semibold">{fillPercentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        fillPercentage > 80 ? "bg-green-500" : fillPercentage > 50 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {machine.filled} из {machine.capacity} товаров
                  </div>
                </div>

                {machine.temperature && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <span>Температура: {machine.temperature}°C</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Доходы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Сегодня</span>
                  </div>
                  <div className="text-2xl font-bold">₽{machine.revenue.toLocaleString()}</div>
                  <div className="text-sm text-green-600">+12% к вчерашнему дню</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Последняя активность</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>Продажа: Кока-Кола 0.5л</span>
                  <span className="text-muted-foreground">2 мин назад</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span>Продажа: Сникерс</span>
                  <span className="text-muted-foreground">5 мин назад</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span>Пополнение товаров</span>
                  <span className="text-muted-foreground">2 часа назад</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span>Техническое обслуживание</span>
                  <span className="text-muted-foreground">1 день назад</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent">
              Редактировать
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Техобслуживание
            </Button>
            <Button className="flex-1">Пополнить товары</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
