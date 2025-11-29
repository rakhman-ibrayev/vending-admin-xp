import type { SaleItem } from './types'
import { calculateMetrics } from './calculate-metrics'
import { calculatePercentageChange } from './calculate-percentage-change'

export const calculateAnalyticsMetrics = (
  sales: SaleItem[],
  prevSales: SaleItem[]
) => {
  const current = calculateMetrics(sales)
  const previous = calculateMetrics(prevSales)

  return {
    totalRevenue: current.totalRevenue,
    revenueChange: calculatePercentageChange(
      current.totalRevenue,
      previous.totalRevenue
    ),
    totalSales: current.totalSales,
    salesChange: calculatePercentageChange(
      current.totalSales,
      previous.totalSales
    ),
    avgTransactionValue: current.avgTransactionValue,
    avgChange: calculatePercentageChange(
      current.avgTransactionValue,
      previous.avgTransactionValue
    )
  }
}
