'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { SalesChart } from '@/components/sales-chart'
import { ProductPerformanceChart } from '@/components/product-performance-chart'
import { MachineComparisonChart } from '@/components/machine-comparison-chart'
import { TopProductsTable } from '@/components/top-products-table'
import {
  CalendarIcon,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 0, 1),
    to: new Date()
  })
  const [selectedMachine, setSelectedMachine] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  // Mock analytics data
  const analyticsData = {
    totalRevenue: 127450,
    revenueChange: 12.5,
    totalSales: 2847,
    salesChange: -3.2,
    avgTransactionValue: 44.8,
    avgChange: 8.1,
    activeCustomers: 1234,
    customersChange: 15.3
  }

  const handleExportReport = () => {
    console.log('Exporting report...')
    // Here you would implement the export functionality
  }

  return (
    <main>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mt-12 md:mt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                Аналитика и отчеты
              </h1>
              <p className="text-muted-foreground mt-2">
                Детальный анализ продаж и производительности
              </p>
            </div>
            <Button onClick={handleExportReport} className="gap-2">
              <Download className="h-4 w-4" />
              Экспорт отчета
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Период</label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Последние 7 дней</SelectItem>
                    <SelectItem value="30d">Последние 30 дней</SelectItem>
                    <SelectItem value="90d">Последние 3 месяца</SelectItem>
                    <SelectItem value="1y">Последний год</SelectItem>
                    <SelectItem value="custom">Выбрать период</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Аппарат</label>
                <Select
                  value={selectedMachine}
                  onValueChange={setSelectedMachine}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все аппараты</SelectItem>
                    <SelectItem value="VM-001">VM-001 - Мега Центр</SelectItem>
                    <SelectItem value="VM-002">VM-002 - Офис Сити</SelectItem>
                    <SelectItem value="VM-003">VM-003 - Университет</SelectItem>
                    <SelectItem value="VM-004">VM-004 - Аэропорт</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedPeriod === 'custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Дата</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal bg-transparent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from && dateRange.to
                          ? `${format(dateRange.from, 'dd MMM', { locale: ru })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: ru })}`
                          : 'Выберите период'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{ from: dateRange.from, to: dateRange.to }}
                        onSelect={range =>
                          range &&
                          setDateRange(range as { from: Date; to: Date })
                        }
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общий доход</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₸{analyticsData.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600">
                  +{analyticsData.revenueChange}%
                </span>
                <span className="text-muted-foreground">за период</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Количество продаж
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.totalSales.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span className="text-red-600">
                  {analyticsData.salesChange}%
                </span>
                <span className="text-muted-foreground">за период</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₸{analyticsData.avgTransactionValue}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600">
                  +{analyticsData.avgChange}%
                </span>
                <span className="text-muted-foreground">за период</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Активные клиенты
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.activeCustomers.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-600">
                  +{analyticsData.customersChange}%
                </span>
                <span className="text-muted-foreground">за период</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SalesChart />
          <ProductPerformanceChart />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MachineComparisonChart />
          </div>
          <div>
            <TopProductsTable />
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-work-sans)]">
                Пиковые часы продаж
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>12:00 - 13:00</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div className="w-4/5 bg-primary h-2 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">234 продажи</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>18:00 - 19:00</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div className="w-3/5 bg-primary h-2 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">189 продаж</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>15:00 - 16:00</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div className="w-2/5 bg-primary h-2 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">156 продаж</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-work-sans)]">
                Статус аппаратов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Работают</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">18</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      75%
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Обслуживание</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">4</span>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      17%
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Не в сети</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">2</span>
                    <Badge
                      variant="destructive"
                      className="bg-red-100 text-red-800"
                    >
                      8%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
