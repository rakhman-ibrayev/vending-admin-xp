'use client'

import { Fragment } from 'react'
import { useParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProgressBar } from '@/components/progress-bar'
import {
  MapPin,
  Calendar,
  Thermometer,
  TrendingUp,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react'
import { useVendingMachine } from '@/entities/vending-machines/use-vending-machine'
import { MachineStatus } from '@/components/machine-status'
import { OrderStatus } from '@/components/order-status'
import { useVendingMachineOrders } from '@/entities/vending-machines/use-vending-machine-orders'
import { useVendingMachineProducts } from '@/entities/vending-machines/use-vending-machine-products'
import { EditMachine } from '@/features/edit-machine'
import { MachineRestock } from '@/features/machine-restock'
import { getTodayRange } from '@/lib/dates/get-today-range'
import { formatDate } from '@/lib/dates/format-date'
import { formatPrice } from '@/lib/prices/format-price'
import { SalesAnalytics } from '@/components/sales-analytics'

export default function MachineDetailPage() {
  const params = useParams()
  const machineId = Number(params.id)

  const machineQuery = useVendingMachine(machineId)
  const productsQuery = useVendingMachineProducts(machineId)
  const ordersQuery = useVendingMachineOrders(machineId, getTodayRange())

  if (
    machineQuery.isLoading ||
    productsQuery.isLoading ||
    ordersQuery.isLoading ||
    !machineQuery.data ||
    !productsQuery.data?.data ||
    !ordersQuery.data?.orders
  ) {
    return null
  }

  const machine = machineQuery.data
  const products = productsQuery.data.data
  const orders = ordersQuery.data.orders

  const fillPercentage = Math.round((products.length / machine.num_slots) * 100)

  const revenue = orders
    .filter(order => order.status === 'paid')
    .reduce(
      (sum, order) => sum + (order.machine_products?.products?.price || 0),
      0
    )

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex-1 flex items-center gap-4">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-work-sans)]">
          {machine.name}
        </h1>

        <MachineStatus status={machine.status} />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />

            <span className="hidden md:inline">Обзор</span>
          </TabsTrigger>

          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />

            <span className="hidden md:inline">Аналитика</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-lg">Основная информация</CardTitle>

                <EditMachine machineId={machineId} />
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{machine.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Установлен: {machine.createdAtFormatted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Последняя синхронизация: {machine.lastSeenFormatted}
                  </span>
                </div>
              </CardContent>

              <CardFooter>
                <MachineRestock
                  machineId={machine.id}
                  numSlots={machine.num_slots}
                  machineSerialNumber={machine.serial_number}
                />
              </CardFooter>
            </Card>

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

                  <ProgressBar fillPercentage={fillPercentage} />

                  <div className="text-xs text-muted-foreground">
                    {products.length} из {machine.num_slots} товаров
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
                <CardTitle className="text-lg">Выручка за сегодня</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />

                    <span className="text-sm text-muted-foreground">
                      Сегодня
                    </span>
                  </div>

                  <div className="text-2xl font-bold">
                    {formatPrice(revenue)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Активность за сегодня</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3 text-sm">
                {ordersQuery.data.orders.map(order => (
                  <Fragment key={order.id}>
                    <div className="flex flex-col justify-between gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <span>{order.machine_products?.products?.name}</span>

                        <span className="font-bold">
                          {formatPrice(
                            order.machine_products?.products?.price || ''
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <OrderStatus status={order.status} />

                        <span className="text-muted-foreground">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                    </div>

                    <Separator />
                  </Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <SalesAnalytics machineId={machine.id} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
