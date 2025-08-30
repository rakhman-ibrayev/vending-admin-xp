'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

const machineData = [
  { machine: 'VM-001', revenue: 4670, sales: 234 },
  { machine: 'VM-002', revenue: 3120, sales: 189 },
  { machine: 'VM-003', revenue: 2890, sales: 156 },
  { machine: 'VM-004', revenue: 4200, sales: 267 },
  { machine: 'VM-005', revenue: 3450, sales: 198 }
]

const chartConfig = {
  revenue: {
    label: 'Доход',
    color: 'hsl(var(--chart-1))'
  }
}

export function MachineComparisonChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-work-sans)]">
          Сравнение аппаратов по доходу
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={machineData}>
              <XAxis
                dataKey="machine"
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
              <Bar
                dataKey="revenue"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
