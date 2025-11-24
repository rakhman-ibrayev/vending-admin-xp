import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/classnames/cn'

interface TopProductsTableProps {
  data?: Array<{
    name: string
    revenue: number
    sales?: number
    change?: number | null
  }>
}

export function TopProductsTable({ data }: TopProductsTableProps) {
  const processedData = (data ?? []).slice(0, 5).map(item => {
    const change = item.change == null ? null : item.change
    const trend = change == null ? 'neutral' : change >= 0 ? 'up' : 'down'

    return {
      name: item.name,
      sales: item.sales || 0,
      revenue: item.revenue,
      change,
      trend
    } as const
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-work-sans)]">
          Топ товары
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processedData.map((product, index) => (
            <div
              key={product.name}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                  <span className="text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.sales} продаж • ₸{product.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {product.trend === 'neutral' ? null : product.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}

                {product.change == null ? (
                  <span className="text-muted-foreground text-xs font-medium">
                    —
                  </span>
                ) : (
                  <span
                    className={cn(
                      'text-xs font-medium',
                      product.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {product.change > 0 ? '+' : ''}
                    {product.change}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
