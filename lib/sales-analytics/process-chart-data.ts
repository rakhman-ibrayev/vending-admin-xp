import { format, eachDayOfInterval } from 'date-fns'
import type { SaleItem } from './types'
import { calculatePercentageChange } from './calculate-percentage-change'

export const processChartData = (
  sales: SaleItem[],
  prevSales: SaleItem[],
  dateRange: {
    startDate: string
    endDate: string
    originalStart?: Date
    originalEnd?: Date
  }
) => {
  // 1. Initialize accumulators for single-pass aggregation
  const salesByDate: Record<
    string,
    { date: string; revenue: number; sales: number }
  > = {}
  const salesByCategory: Record<string, { name: string; revenue: number }> = {}
  const salesByProduct: Record<
    number,
    { id: number; name: string; revenue: number; sales: number }
  > = {}

  // 2. Single loop to aggregate all current sales data
  for (const sale of sales) {
    const amount = sale.amount || 0
    const count = sale.num_sales || 0

    // For Sales Chart
    if (sale.day) {
      const entry = (salesByDate[sale.day] ??= {
        date: sale.day,
        revenue: 0,
        sales: 0
      })

      entry.revenue += amount
      entry.sales += count
    }

    // For Product Performance (Category)
    const category = sale.products?.category

    if (category) {
      const entry = (salesByCategory[category] ??= {
        name: category,
        revenue: 0
      })

      entry.revenue += amount
    }

    // For Top Products
    const pid = sale.product_id

    if (pid != null) {
      const entry = (salesByProduct[pid] ??= {
        id: pid,
        name: sale.products?.name || `Product ${pid}`,
        revenue: 0,
        sales: 0
      })

      entry.revenue += amount
      entry.sales += count
    }
  }

  // 3. Generate Sales Chart (Time Series)
  const days = eachDayOfInterval({
    start: dateRange.originalStart || new Date(dateRange.startDate),
    end: dateRange.originalEnd || new Date(dateRange.endDate)
  })

  const sampleInterval = Math.max(1, Math.floor(days.length / 50)) // maxPoints = 50
  const salesChart: Array<{ date: string; revenue: number; sales: number }> = []

  days.forEach((d, index) => {
    if (index % sampleInterval === 0) {
      const dateStr = format(d, 'yyyy-MM-dd')
      const entry = salesByDate[dateStr]
      salesChart.push({
        date: dateStr,
        revenue: entry?.revenue || 0,
        sales: entry?.sales || 0
      })
    }
  })

  // 4. Generate Product Performance (Sorted Categories)
  const productPerformance = Object.values(salesByCategory).sort(
    (a, b) => b.revenue - a.revenue
  )

  // 5. Generate Top Products (Leaderboard)
  // Aggregate previous sales for comparison
  const prevRevenueByPid: Record<number, number> = {}
  for (const sale of prevSales) {
    if (sale.product_id != null) {
      prevRevenueByPid[sale.product_id] =
        (prevRevenueByPid[sale.product_id] || 0) + (sale.amount || 0)
    }
  }

  const topProducts = Object.values(salesByProduct)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 100)
    .map(p => ({
      name: p.name,
      revenue: p.revenue,
      sales: p.sales,
      change: calculatePercentageChange(p.revenue, prevRevenueByPid[p.id] || 0)
    }))

  return { salesChart, productPerformance, topProducts }
}
