'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const productData = [
  { name: 'Напитки', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Снеки', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Шоколад', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Горячие напитки', value: 10, color: 'hsl(var(--chart-4))' }
]

const chartConfig = {
  value: {
    label: 'Процент продаж'
  }
}

export function ProductPerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-work-sans)]">
          Продажи по категориям
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
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
        <div className="grid grid-cols-2 gap-4 mt-4">
          {productData.map(item => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.name}</span>
              <span className="text-sm font-medium ml-auto">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
