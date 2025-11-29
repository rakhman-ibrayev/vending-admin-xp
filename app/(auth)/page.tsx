'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Coffee, MapPin, Clock, Plus, Search, Filter } from 'lucide-react'
import { AddMachineDialog } from '@/components/add-machine-dialog'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useVendingMachinesList } from '@/entities/vending-machines/use-vending-machines-list'
import { useAddVendingMachine } from '@/entities/vending-machines/use-add-vending-machine'
import { MachineStatus } from '@/components/machine-status'
import { ProgressBar } from '@/components/progress-bar'

const statusConfig = {
  online: {
    label: 'Работает'
  },
  offline: {
    label: 'Не в сети'
  }
}

export default function MachinesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const vendingMachinesQuery = useVendingMachinesList()
  const addVendingMachineMutation = useAddVendingMachine()

  const searchParams = useSearchParams()
  const router = useRouter()

  const closeAddDialog = () => {
    if (hasPrefill) {
      router.replace('/')
    } else {
      setIsAddDialogOpen(false)
    }
  }

  const addDialogValues = {
    serial_number: searchParams.get('serial_number') || '',
    latitude: searchParams.get('latitude')
      ? parseFloat(searchParams.get('latitude')!)
      : undefined,
    longitude: searchParams.get('longitude')
      ? parseFloat(searchParams.get('longitude')!)
      : undefined
  }
  const hasPrefill = Object.values(addDialogValues).some(val => Boolean(val))

  const filteredMachines =
    vendingMachinesQuery.data?.filter(machine => {
      const matchesSearch =
        machine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || machine.status === statusFilter

      return matchesSearch && matchesStatus
    }) || []

  if (vendingMachinesQuery.isLoading) {
    return null
  }

  return (
    <>
      <main className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                Управление аппаратами
              </h1>
              <p className="text-muted-foreground mt-2">
                Мониторинг и управление всеми вендинговыми аппаратами
              </p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить аппарат
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию, локации или ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Filter className="h-4 w-4" />
                    Статус:{' '}
                    {statusFilter === 'all'
                      ? 'Все'
                      : statusConfig[statusFilter as keyof typeof statusConfig]
                          ?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    Все статусы
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('online')}>
                    Работает
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter('maintenance')}
                  >
                    Обслуживание
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('offline')}>
                    Не в сети
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Machines Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMachines.map(machine => (
            <Link href={`/machines/${machine.id}`} key={machine.id}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-[family-name:var(--font-work-sans)]">
                        {machine.name}
                      </CardTitle>
                      <div className="flex gap-2 flex-col">
                        <MachineStatus status={machine.status} />

                        <span className="text-sm text-muted-foreground">
                          {machine.serialNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{machine.location}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Доход сегодня</div>
                      <div className="font-semibold">
                        ₸{machine.todayRevenue.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Заполненность</div>
                      <div className="font-semibold">
                        {machine.fillPercentage}%
                      </div>
                    </div>
                  </div>

                  {/* Fill Level Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Товары: {machine.currentStock}/{machine.numSlots}
                      </span>

                      {machine.temperature && (
                        <span>Температура: {machine.temperature}°C</span>
                      )}
                    </div>
                    <ProgressBar fillPercentage={machine.fillPercentage} />
                  </div>

                  {/* Last Sync */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Clock className="h-3 w-3" />
                    Последняя синхронизация: {machine.lastSeen}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredMachines.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Аппараты не найдены
              </h3>
              <p className="text-muted-foreground">
                Попробуйте изменить параметры поиска или добавить новый аппарат
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <AddMachineDialog
        open={isAddDialogOpen || hasPrefill}
        onClose={closeAddDialog}
        defaultValues={addDialogValues}
        onSubmit={async values => {
          await addVendingMachineMutation.mutateAsync(values)
          closeAddDialog()
        }}
      />
    </>
  )
}
