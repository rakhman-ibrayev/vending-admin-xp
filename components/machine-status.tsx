import { Wifi, WifiOff } from 'lucide-react'
import { Badge } from './ui/badge'

const statusConfig = {
  online: {
    label: 'Работает',
    color: 'bg-green-500',
    variant: 'default' as const,
    icon: Wifi
  },
  offline: {
    label: 'Не в сети',
    color: 'bg-red-500',
    variant: 'destructive' as const,
    icon: WifiOff
  }
}

interface MachineStatusProps {
  status: 'online' | 'offline'
}

export function MachineStatus({ status }: MachineStatusProps) {
  const machineStatus = statusConfig[status as keyof typeof statusConfig]
  const StatusIcon = machineStatus.icon

  return (
    <Badge
      variant={machineStatus.variant}
      className="gap-1"
      title={
        status === 'offline'
          ? `Аппарат не отвечает больше ${process.env.NEXT_PUBLIC_VENDING_MACHINE_HEARTBEAT_INTERVAL_MINS} минут`
          : ''
      }
    >
      <StatusIcon className="h-3 w-3" />
      {machineStatus.label}
    </Badge>
  )
}
