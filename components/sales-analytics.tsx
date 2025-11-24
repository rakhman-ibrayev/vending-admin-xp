'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SalesChart } from '@/components/sales-chart'
import { ProductPerformanceChart } from '@/components/product-performance-chart'
import { TopProductsTable } from '@/components/top-products-table'
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react'
import { format, subDays, differenceInDays } from 'date-fns'
import { useProductSalesByDay } from '@/entities/analytics/use-product-sales-by-day'
import { formatPrice } from '@/lib/prices/format-price'
import { calculateAnalyticsMetrics } from '@/lib/sales-analytics/calculate-analytics-metrics'
import { processChartData } from '@/lib/sales-analytics/process-chart-data'
import { cn } from '@/lib/classnames/cn'

interface SalesAnalyticsProps {
  machineId?: number
}

const SalesAnalytics = ({ machineId }: SalesAnalyticsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  // Calculate date range based on selected period
  const calculatedDateRange = useMemo(() => {
    const today = new Date()
    let start: Date
    let end: Date = today

    switch (selectedPeriod) {
      case '7d':
        start = subDays(today, 6) // Last 7 days including today
        break
      case '30d':
        start = subDays(today, 29) // Last 30 days including today
        break
      case '90d':
        start = subDays(today, 89) // Last 90 days including today
        break
      case '1y':
        start = subDays(today, 364) // Last year including today
        break
      default:
        start = subDays(today, 29)
    }

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      originalStart: start,
      originalEnd: end
    }
  }, [selectedPeriod])

  // Calculate previous date range for comparison
  const previousDateRange = useMemo(() => {
    const { originalStart, originalEnd } = calculatedDateRange
    if (!originalStart || !originalEnd) return null

    const duration = differenceInDays(originalEnd, originalStart) + 1
    const prevEnd = subDays(originalStart, 1)
    const prevStart = subDays(prevEnd, duration - 1)

    return {
      startDate: format(prevStart, 'yyyy-MM-dd'),
      endDate: format(prevEnd, 'yyyy-MM-dd')
    }
  }, [calculatedDateRange])

  // Fetch sales data
  const {
    data: salesData,
    isLoading,
    error
  } = useProductSalesByDay({
    startDate: calculatedDateRange.startDate,
    endDate: calculatedDateRange.endDate,
    machineId
  })

  // Fetch previous period sales data
  const { data: prevSalesData } = useProductSalesByDay({
    startDate: previousDateRange?.startDate,
    endDate: previousDateRange?.endDate,
    machineId
  })

  // Calculate analytics metrics
  const analyticsData = useMemo(() => {
    if (!salesData?.sales) return defaultAnalyticsMetrics

    return calculateAnalyticsMetrics(
      salesData.sales,
      prevSalesData?.sales || []
    )
  }, [salesData, prevSalesData])

  // Process data for charts
  const chartData = useMemo(() => {
    if (!salesData?.sales) return defaultChartData

    return processChartData(
      salesData.sales,
      prevSalesData?.sales || [],
      calculatedDateRange
    )
  }, [salesData, prevSalesData, calculatedDateRange])

  return (
    <>
      {/* Filters */}
      <Card>
        <CardContent>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Последние 7 дней</SelectItem>
              <SelectItem value="30d">Последние 30 дней</SelectItem>
              <SelectItem value="90d">Последние 3 месяца</SelectItem>
              <SelectItem value="1y">Последний год</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <MetricCard
          title="Общая выручка"
          value={formatPrice(analyticsData.totalRevenue)}
          change={analyticsData.revenueChange}
          icon={DollarSign}
          isLoading={isLoading}
          error={!!error}
        />
        <MetricCard
          title="Количество продаж"
          value={analyticsData.totalSales.toLocaleString()}
          change={analyticsData.salesChange}
          icon={Package}
          isLoading={isLoading}
          error={!!error}
        />
        <MetricCard
          title="Средний чек"
          value={formatPrice(Math.round(analyticsData.avgTransactionValue))}
          change={analyticsData.avgChange}
          icon={TrendingUp}
          isLoading={isLoading}
          error={!!error}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-1">
        <SalesChart
          data={chartData.salesChart}
          dateRange={calculatedDateRange}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <ProductPerformanceChart data={chartData.productPerformance} />
      </div>

      {/* Top Products */}
      <TopProductsTable data={chartData.topProducts} />
    </>
  )
}

// --- Helper Components & Functions ---

const defaultAnalyticsMetrics = {
  totalRevenue: 0,
  revenueChange: 0,
  totalSales: 0,
  salesChange: 0,
  avgTransactionValue: 0,
  avgChange: 0
}

const defaultChartData = {
  salesChart: [],
  productPerformance: [],
  machineComparison: [],
  topProducts: []
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  isLoading,
  error
}: {
  title: string
  value: string
  change: number | null
  icon: any
  isLoading: boolean
  error: boolean
}) {
  const trend = change == null ? 'neutral' : change >= 0 ? 'up' : 'down'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-sm">Ошибка загрузки</div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex items-center gap-1 text-xs">
              {change == null ? null : trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}

              {change == null ? (
                <span className="text-muted-foreground">—</span>
              ) : (
                <span
                  className={cn(
                    trend === 'up' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change > 0 ? '+' : ''}
                  {change}%
                </span>
              )}
              <span className="text-muted-foreground">за период</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { SalesAnalytics, type SalesAnalyticsProps }
