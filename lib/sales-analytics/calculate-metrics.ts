import type { SaleItem } from './types'

export const calculateMetrics = (sales: SaleItem[]) => {
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
  const totalSales = sales.reduce((sum, sale) => sum + (sale.num_sales || 0), 0)
  const avgTransactionValue = totalSales > 0 ? totalRevenue / totalSales : 0
  return { totalRevenue, totalSales, avgTransactionValue }
}
