'use client'

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { formatDate } from '@/lib/dates/format-date'

interface SalesChartProps {
  data?: Array<{ date: string; revenue: number; sales: number }>
  dateRange?: { startDate: string; endDate: string }
}

const chartConfig = {
  revenue: {
    label: 'Выручка ',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig

export function SalesChart({ data, dateRange }: SalesChartProps) {
  const processedData =
    data?.map(item => ({
      date: item.date,
      revenue: item.revenue,
      sales: item.sales
    })) ?? []

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="font-[family-name:var(--font-work-sans)]">
            Динамика продаж
          </CardTitle>
          <CardDescription>
            Показывает выручку за период: {formatDateRange(dateRange)}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={processedData}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              tickFormatter={value =>
                formatDate(value, { format: 'custom', customFormat: 'dd.MM' })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={value =>
                    formatDate(value, {
                      format: 'custom',
                      customFormat: 'dd.MM'
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--color-revenue)' }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function formatDateRange(range?: { startDate: string; endDate: string }) {
  if (!range) return ''
  try {
    const start = formatDate(range.startDate, { format: 'daymonth' })
    const end = formatDate(range.endDate, { format: 'daymonth' })
    return `${start} - ${end}`
  } catch (e) {
    return ''
  }
}
