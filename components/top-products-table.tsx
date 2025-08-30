import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

const topProducts = [
  {
    name: 'Кока-Кола 0.5л',
    sales: 234,
    revenue: 20826,
    change: 12.5,
    trend: 'up'
  },
  { name: 'Сникерс', sales: 189, revenue: 12285, change: 8.3, trend: 'up' },
  {
    name: 'Вода Бон Аква',
    sales: 156,
    revenue: 7020,
    change: -2.1,
    trend: 'down'
  },
  { name: 'Чипсы Лейс', sales: 134, revenue: 10050, change: 15.7, trend: 'up' },
  {
    name: 'Кофе Нескафе',
    sales: 98,
    revenue: 3430,
    change: -5.2,
    trend: 'down'
  }
]

export function TopProductsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-work-sans)]">
          Топ товары
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
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
                {product.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${product.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {product.change > 0 ? '+' : ''}
                  {product.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
