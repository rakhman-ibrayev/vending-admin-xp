'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Coffee,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  Package
} from 'lucide-react'
import { SidebarLayout } from '@/components/sidebar-layout'

// Mock data for dashboard
const stats = [
  {
    title: 'Всего аппаратов',
    value: '24',
    change: '+2 за месяц',
    icon: Coffee,
    color: 'text-blue-600'
  },
  {
    title: 'Доход сегодня',
    value: '₸45,230',
    change: '+12% к вчера',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Активные пользователи',
    value: '1,247',
    change: '+5% за неделю',
    icon: Users,
    color: 'text-purple-600'
  },
  {
    title: 'Товаров продано',
    value: '892',
    change: '+18% к вчера',
    icon: Package,
    color: 'text-orange-600'
  }
]

const alerts = [
  {
    id: 1,
    type: 'warning',
    message: 'Аппарат VM-003 не отвечает уже 3 часа',
    time: '10 мин назад'
  },
  {
    id: 2,
    type: 'info',
    message: 'Пополнение товаров в VM-001 завершено',
    time: '1 час назад'
  },
  {
    id: 3,
    type: 'error',
    message: 'Низкий уровень товаров в VM-005 (12%)',
    time: '2 часа назад'
  }
]

const recentSales = [
  {
    machine: 'VM-001',
    product: 'Кока-Кола 0.5л',
    amount: '₸85',
    time: '2 мин назад'
  },
  {
    machine: 'VM-004',
    product: 'Сникерс',
    amount: '₸120',
    time: '5 мин назад'
  },
  {
    machine: 'VM-002',
    product: 'Вода Бон Аква',
    amount: '₸45',
    time: '8 мин назад'
  },
  { machine: 'VM-001', product: 'Твикс', amount: '₸110', time: '12 мин назад' },
  {
    machine: 'VM-005',
    product: 'Пепси 0.33л',
    amount: '₸75',
    time: '15 мин назад'
  }
]

export default function DashboardPage() {
  return (
    <main>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mt-12 md:mt-0">
          <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
            Дашборд
          </h1>
          <p className="text-muted-foreground mt-2">
            Обзор работы вендинговых аппаратов
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>

                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Последние продажи
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {recentSales.map((sale, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{sale.product}</p>

                      <p className="text-xs text-muted-foreground">
                        {sale.machine}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">{sale.amount}</p>

                      <p className="text-xs text-muted-foreground">
                        {sale.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Уведомления
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className="flex items-start gap-3">
                    <Badge
                      variant={
                        alert.type === 'error'
                          ? 'destructive'
                          : alert.type === 'warning'
                            ? 'secondary'
                            : 'default'
                      }
                      className="mt-0.5"
                    >
                      {alert.type === 'error'
                        ? 'Ошибка'
                        : alert.type === 'warning'
                          ? 'Внимание'
                          : 'Инфо'}
                    </Badge>

                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{alert.message}</p>

                      <p className="text-xs text-muted-foreground">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
