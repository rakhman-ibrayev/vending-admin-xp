'use client'

import { SalesAnalytics } from '@/components/sales-analytics'

export default function AnalyticsPage() {
  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
            Аналитика и отчеты
          </h1>
          <p className="text-muted-foreground mt-2">
            Детальный анализ продаж и производительности
          </p>
        </div>
      </div>

      <SalesAnalytics />
    </main>
  )
}
