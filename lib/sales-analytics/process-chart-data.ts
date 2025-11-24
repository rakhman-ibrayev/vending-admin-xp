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
  // Sales chart: group by date
  const salesByDate = sales.reduce(
    (acc, sale) => {
      const date = sale.day
      if (!date) return acc
      if (!acc[date]) acc[date] = { date, revenue: 0, sales: 0 }
      acc[date].revenue += sale.amount || 0
      acc[date].sales += sale.num_sales || 0
      return acc
    },
    {} as Record<string, { date: string; revenue: number; sales: number }>
  )

  // Fill missing dates & sample
  const startDate = dateRange.originalStart || new Date(dateRange.startDate)
  const endDate = dateRange.originalEnd || new Date(dateRange.endDate)

  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const totalDays = days.length
  const maxPoints = 50
  const sampleInterval = Math.max(1, Math.floor(totalDays / maxPoints))

  const salesChart: Array<{ date: string; revenue: number; sales: number }> = []

  days.forEach((d, index) => {
    if (index % sampleInterval === 0) {
      const dateStr = format(d, 'yyyy-MM-dd')
      salesChart.push({
        date: dateStr,
        revenue: salesByDate[dateStr]?.revenue || 0,
        sales: salesByDate[dateStr]?.sales || 0
      })
    }
  })

  // Product performance
  const productSales = sales.reduce(
    (acc, sale) => {
      const category = sale.products?.category
      if (!category) return acc
      if (!acc[category]) acc[category] = { name: category, revenue: 0 }
      acc[category].revenue += sale.amount || 0
      return acc
    },
    {} as Record<string, { name: string; revenue: number }>
  )
  const productPerformance = Object.values(productSales).sort(
    (a, b) => b.revenue - a.revenue
  )

  // Machine comparison
  const machineSales = sales.reduce(
    (acc, sale) => {
      const machineId = sale.machine_id
      if (machineId == null) return acc
      const machineName = sale.vending_machines?.name || `Machine ${machineId}`
      if (!acc[machineId])
        acc[machineId] = {
          id: machineId,
          name: machineName,
          revenue: 0,
          sales: 0
        }
      acc[machineId].revenue += sale.amount || 0
      acc[machineId].sales += sale.num_sales || 0
      return acc
    },
    {} as Record<
      number,
      { id: number; name: string; revenue: number; sales: number }
    >
  )
  const machineComparison = Object.values(machineSales).sort(
    (a, b) => b.revenue - a.revenue
  )

  // Top products
  const currentProductSales = sales.reduce(
    (acc, sale) => {
      const productId = sale.product_id
      if (productId == null) return acc
      const productName = sale.products?.name || `Product ${productId}`
      if (!acc[productId])
        acc[productId] = {
          id: productId,
          name: productName,
          revenue: 0,
          sales: 0
        }
      acc[productId].revenue += sale.amount || 0
      acc[productId].sales += sale.num_sales || 0
      return acc
    },
    {} as Record<
      number,
      { id: number; name: string; revenue: number; sales: number }
    >
  )

  const prevProductSales = prevSales.reduce(
    (acc, sale) => {
      const productId = sale.product_id
      if (productId == null) return acc
      if (!acc[productId]) acc[productId] = 0
      acc[productId] += sale.amount || 0
      return acc
    },
    {} as Record<number, number>
  )

  const topProducts = Object.values(currentProductSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(p => ({
      name: p.name,
      revenue: p.revenue,
      sales: p.sales,
      change: calculatePercentageChange(p.revenue, prevProductSales[p.id] || 0)
    }))

  return { salesChart, productPerformance, machineComparison, topProducts }
}
