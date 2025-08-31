'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Settings, Bell, Shield, Database, Palette, Globe } from 'lucide-react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    lowStock: true,
    machineOffline: true,
    dailyReports: false,
    maintenanceAlerts: true
  })

  return (
    <main>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
              Настройки системы
            </h1>
            <p className="text-muted-foreground mt-2">
              Конфигурация и персонализация админской панели
            </p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              Общие
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Уведомления
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Безопасность
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Database className="h-4 w-4" />
              Система
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Основные настройки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Название компании</Label>
                    <Input id="company-name" defaultValue="PharmExpress" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Часовой пояс</Label>
                    <Select defaultValue="moscow">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moscow">Москва (UTC+3)</SelectItem>
                        <SelectItem value="spb">
                          Санкт-Петербург (UTC+3)
                        </SelectItem>
                        <SelectItem value="ekb">
                          Екатеринбург (UTC+5)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Валюта</Label>
                  <Select defaultValue="rub">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rub">Российский рубль (₸)</SelectItem>
                      <SelectItem value="usd">Доллар США ($)</SelectItem>
                      <SelectItem value="eur">Евро (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Внешний вид
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Темная тема</Label>
                    <p className="text-sm text-muted-foreground">
                      Переключить на темное оформление
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Компактный режим</Label>
                    <p className="text-sm text-muted-foreground">
                      Уменьшить отступы в интерфейсе
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки уведомлений</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Низкие запасы товаров</Label>
                    <p className="text-sm text-muted-foreground">
                      Уведомления о товарах с низким запасом
                    </p>
                  </div>
                  <Switch
                    checked={notifications.lowStock}
                    onCheckedChange={checked =>
                      setNotifications(prev => ({
                        ...prev,
                        lowStock: checked
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Аппараты офлайн</Label>
                    <p className="text-sm text-muted-foreground">
                      Уведомления о неработающих аппаратах
                    </p>
                  </div>
                  <Switch
                    checked={notifications.machineOffline}
                    onCheckedChange={checked =>
                      setNotifications(prev => ({
                        ...prev,
                        machineOffline: checked
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ежедневные отчеты</Label>
                    <p className="text-sm text-muted-foreground">
                      Автоматические отчеты о продажах
                    </p>
                  </div>
                  <Switch
                    checked={notifications.dailyReports}
                    onCheckedChange={checked =>
                      setNotifications(prev => ({
                        ...prev,
                        dailyReports: checked
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Техническое обслуживание</Label>
                    <p className="text-sm text-muted-foreground">
                      Напоминания о плановом обслуживании
                    </p>
                  </div>
                  <Switch
                    checked={notifications.maintenanceAlerts}
                    onCheckedChange={checked =>
                      setNotifications(prev => ({
                        ...prev,
                        maintenanceAlerts: checked
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки безопасности</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Время сессии (минуты)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    defaultValue="60"
                    className="w-32"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Двухфакторная аутентификация</Label>
                    <p className="text-sm text-muted-foreground">
                      Дополнительная защита учетных записей
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Логирование действий</Label>
                    <p className="text-sm text-muted-foreground">
                      Записывать все действия пользователей
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Системные настройки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">
                    Частота резервного копирования
                  </Label>
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Каждый час</SelectItem>
                      <SelectItem value="daily">Ежедневно</SelectItem>
                      <SelectItem value="weekly">Еженедельно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-retention">Хранение логов (дни)</Label>
                  <Input
                    id="log-retention"
                    type="number"
                    defaultValue="30"
                    className="w-32"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Автоматические обновления</Label>
                    <p className="text-sm text-muted-foreground">
                      Устанавливать обновления автоматически
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Отмена</Button>
          <Button>Сохранить изменения</Button>
        </div>
      </div>
    </main>
  )
}
