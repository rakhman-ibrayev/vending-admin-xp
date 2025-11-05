import { CheckCircle, Clock, XCircle, Ban } from 'lucide-react'
import { Badge } from './ui/badge'
import type { Database } from '@/lib/supabase/database.types'

type OrderStatus = Database['public']['Enums']['order_status']

const statusConfig = {
  created: {
    label: 'Создан',
    variant: 'secondary' as const,
    icon: Clock
  },
  paid: {
    label: 'Оплачен',
    variant: 'default' as const,
    icon: CheckCircle
  },
  failed: {
    label: 'Ошибка',
    variant: 'destructive' as const,
    icon: XCircle
  },
  cancelled: {
    label: 'Отменен',
    variant: 'outline' as const,
    icon: Ban
  }
}

interface OrderStatusProps {
  status: OrderStatus
}

export function OrderStatus({ status }: OrderStatusProps) {
  const orderStatus = statusConfig[status]
  const StatusIcon = orderStatus.icon

  return (
    <Badge variant={orderStatus.variant} className="gap-1">
      <StatusIcon className="h-3 w-3" />
      {orderStatus.label}
    </Badge>
  )
}
