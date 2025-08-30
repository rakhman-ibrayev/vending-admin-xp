'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  MapPin,
  Thermometer,
  TrendingUp,
  Wifi,
  WifiOff,
  Wrench,
  ExternalLink
} from 'lucide-react'
import { useRouter } from 'next/navigation'

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
    label: 'Работает',
    color: 'bg-green-500',
    variant: 'default' as const,
    icon: Wifi
  },
  maintenance: {
    label: 'Обслуживание',
    color: 'bg-yellow-500',
    variant: 'secondary' as const,
    icon: Wrench
  },
  offline: {
    label: 'Не в сети',
    color: 'bg-red-500',
    variant: 'destructive' as const,
    icon: WifiOff
  }
}

export function MachineDetailsDialog({
  machine,
  open,
  onOpenChange
}: MachineDetailsDialogProps) {
  const router = useRouter()

  if (!machine) return null

  const status = statusConfig[machine.status as keyof typeof statusConfig]
  const StatusIcon = status.icon
  const fillPercentage = Math.round((machine.filled / machine.capacity) * 100)

  const handleViewDetails = () => {
    onOpenChange(false)
    router.push(`/machines/${machine.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="font-[family-name:var(--font-work-sans)] text-xl">
                {machine.name}
              </DialogTitle>
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

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{machine.location}</span>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Заполненность</span>
                    <span className="font-semibold">{fillPercentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        fillPercentage > 80
                          ? 'bg-green-500'
                          : fillPercentage > 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Доходы сегодня
                    </span>
                  </div>
                  <div className="text-lg font-bold">
                    ₸{machine.revenue.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {machine.temperature && (
            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <span>Температура: {machine.temperature}°C</span>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={handleViewDetails}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Подробнее
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
