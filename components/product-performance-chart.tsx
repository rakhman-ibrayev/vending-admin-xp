'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

interface ProductPerformanceChartProps {
  data?: Array<{ name: string; revenue: number }>
}

const chartConfig = {
  value: {
    label: 'Процент продаж'
  }
}

const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

export function ProductPerformanceChart({
  data
}: ProductPerformanceChartProps) {
  const totalRevenue = data?.reduce((sum, item) => sum + item.revenue, 0) ?? 0
  const processedData = (data ?? []).slice(0, 5).map((item, index) => ({
    name: item.name,
    value:
      totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0,
    color: colors[index % colors.length]
  }))

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="font-[family-name:var(--font-work-sans)] text-xl font-semibold text-gray-900">
          Продажи по категориям
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Распределение выручки по продуктам
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="w-full">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={processedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="white"
                    strokeWidth={2}
                  >
                    {processedData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity duration-200"
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                            <p className="font-semibold text-gray-900">
                              {data.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {data.value}% от общих продаж
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="space-y-2 w-full">
            {processedData.map(item => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 hover:shadow-sm transition-shadow duration-200"
              >
                <figure className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />

                  <figcaption className="text-sm font-medium text-gray-900">
                    {item.name}
                  </figcaption>
                </figure>

                <p className="font-bold text-gray-900">{item.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
