'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const salesData = [
  { date: '01.01', sales: 45000, transactions: 234 },
  { date: '02.01', sales: 52000, transactions: 267 },
  { date: '03.01', sales: 48000, transactions: 245 },
  { date: '04.01', sales: 61000, transactions: 312 },
  { date: '05.01', sales: 55000, transactions: 289 },
  { date: '06.01', sales: 67000, transactions: 345 },
  { date: '07.01', sales: 73000, transactions: 378 },
  { date: '08.01', sales: 69000, transactions: 356 },
  { date: '09.01', sales: 78000, transactions: 401 },
  { date: '10.01', sales: 82000, transactions: 423 },
  { date: '11.01', sales: 75000, transactions: 387 },
  { date: '12.01', sales: 88000, transactions: 456 }
]

const chartConfig = {
  sales: {
    label: 'Продажи',
    color: 'hsl(var(--chart-1))'
  },
  transactions: {
    label: 'Транзакции',
    color: 'hsl(var(--chart-2))'
  }
}

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-work-sans)]">
          Динамика продаж
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => `₸${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
