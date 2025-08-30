"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Calendar,
  Thermometer,
  Package,
  TrendingUp,
  Wifi,
  WifiOff,
  Wrench,
  Clock,
  Activity,
  BarChart3,
  Edit,
} from "lucide-react";
import { MachineRestockDialog } from "@/components/machine-restock-dialog";

// Mock data - в реальном приложении это будет загружаться по ID
const getMachineById = (id: string) => ({
  id,
  name: `Аппарат ${id.toUpperCase()}`,
  location: "ТЦ Мега, 1 этаж",
  status: "online",
  lastSync: "2 минуты назад",
  revenue: 15420,
  capacity: 120,
  filled: 89,
  temperature: 4,
  model: "VendMax Pro 3000",
  installDate: "2024-01-15",
  slotsCount: 24,
  slotCapacity: 5,
});

const statusConfig = {
  online: {
    label: "Работает",
    color: "bg-green-500",
    variant: "default" as const,
    icon: Wifi,
  },
  maintenance: {
    label: "Обслуживание",
    color: "bg-yellow-500",
    variant: "secondary" as const,
    icon: Wrench,
  },
  offline: {
    label: "Не в сети",
    color: "bg-red-500",
    variant: "destructive" as const,
    icon: WifiOff,
  },
};

export default function MachineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);

  const machine = getMachineById(params.id as string);
  const status = statusConfig[machine.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;
  const fillPercentage = Math.round((machine.filled / machine.capacity) * 100);

  return (
    <>
      <main className="flex-1 p-5 space-y-6">
        {/* Header */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-[family-name:var(--font-work-sans)]">
            {machine.name}
          </h1>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-muted-foreground">{machine.id}</span>

            <Badge variant={status.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-2">
              <Wrench className="h-4 w-4" />
              Обслуживание
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-lg">Основная информация</CardTitle>

                  <Button variant="ghost">
                    <Edit />
                  </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{machine.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>Модель: {machine.model}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Установлен:{" "}
                      {new Date(machine.installDate).toLocaleDateString(
                        "ru-RU"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Последняя синхронизация: {machine.lastSync}</span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => setRestockDialogOpen(true)}
                    className="w-full"
                  >
                    Пополнить товары
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Текущий статус</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Заполненность</span>
                      <span className="font-semibold">{fillPercentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          fillPercentage > 80
                            ? "bg-green-500"
                            : fillPercentage > 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {machine.filled} из {machine.capacity} товаров
                    </div>
                  </div>

                  {machine.temperature && (
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span>Температура: {machine.temperature}°C</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Доходы за сегодня</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Сегодня
                      </span>
                    </div>
                    <div className="text-2xl font-bold">
                      ₽{machine.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">
                      +12% к вчерашнему дню
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Последняя активность</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Продажа: Кока-Кола 0.5л</span>
                    <span className="text-muted-foreground">2 мин назад</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Продажа: Сникерс</span>
                    <span className="text-muted-foreground">5 мин назад</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Пополнение товаров</span>
                    <span className="text-muted-foreground">2 часа назад</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Техническое обслуживание</span>
                    <span className="text-muted-foreground">1 день назад</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Аналитика продаж</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Здесь будут графики и детальная аналитика по этому аппарату
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>История обслуживания</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Здесь будет история технического обслуживания
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <MachineRestockDialog
        machine={machine}
        open={restockDialogOpen}
        onOpenChange={setRestockDialogOpen}
      />
    </>
  );
}
