"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Coffee,
  MapPin,
  Clock,
  Plus,
  Search,
  Filter,
  Wifi,
  WifiOff,
  Wrench,
} from "lucide-react";
import { AddMachineDialog } from "@/components/add-machine-dialog";
import Link from "next/link";

// Mock data for vending machines
const machines = [
  {
    id: "VM-001",
    name: "Мега Центр #1",
    location: "ТЦ Мега, 1 этаж, вход А",
    status: "online",
    lastSync: "2 мин назад",
    revenue: 2450,
    capacity: 45,
    filled: 38,
    temperature: 4.2,
    model: "VendMax Pro 3000",
    installDate: "2024-01-15",
  },
  {
    id: "VM-002",
    name: "Офис Сити",
    location: "Офис-центр Сити, 5 этаж",
    status: "maintenance",
    lastSync: "1 час назад",
    revenue: 1890,
    capacity: 40,
    filled: 12,
    temperature: 4.8,
    model: "VendMax Standard 2500",
    installDate: "2024-02-20",
  },
  {
    id: "VM-003",
    name: "Университет А",
    location: "Университет, корпус А, 1 этаж",
    status: "offline",
    lastSync: "3 часа назад",
    revenue: 3120,
    capacity: 50,
    filled: 45,
    temperature: null,
    model: "VendMax Pro 3000",
    installDate: "2023-12-10",
  },
  {
    id: "VM-004",
    name: "Аэропорт Зона А",
    location: "Аэропорт, зона вылета А",
    status: "online",
    lastSync: "1 мин назад",
    revenue: 4670,
    capacity: 60,
    filled: 52,
    temperature: 3.9,
    model: "VendMax Premium 4000",
    installDate: "2024-03-05",
  },
  {
    id: "VM-005",
    name: "Торговый Дом",
    location: "ТД Европейский, 2 этаж",
    status: "online",
    lastSync: "5 мин назад",
    revenue: 2890,
    capacity: 45,
    filled: 23,
    temperature: 4.1,
    model: "VendMax Standard 2500",
    installDate: "2024-01-28",
  },
];

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

export default function MachinesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const router = useRouter();

  const filteredMachines = machines.filter((machine) => {
    const matchesSearch =
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <main className="flex-1 p-5 space-y-6">
        {/* Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                Управление аппаратами
              </h1>
              <p className="text-muted-foreground mt-2">
                Мониторинг и управление всеми вендинговыми аппаратами
              </p>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить аппарат
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию, локации или ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Filter className="h-4 w-4" />
                    Статус:{" "}
                    {statusFilter === "all"
                      ? "Все"
                      : statusConfig[statusFilter as keyof typeof statusConfig]
                          ?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    Все статусы
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("online")}>
                    Работает
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("maintenance")}
                  >
                    Обслуживание
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("offline")}>
                    Не в сети
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Machines Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMachines.map((machine) => {
            const status =
              statusConfig[machine.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            const fillPercentage = Math.round(
              (machine.filled / machine.capacity) * 100
            );

            return (
              <Link href={`/machines/${machine.id}`} key={machine.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-[family-name:var(--font-work-sans)]">
                          {machine.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {machine.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{machine.location}</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">
                          Доход сегодня
                        </div>
                        <div className="font-semibold">
                          ₽{machine.revenue.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">
                          Заполненность
                        </div>
                        <div className="font-semibold">{fillPercentage}%</div>
                      </div>
                    </div>

                    {/* Fill Level Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Товары: {machine.filled}/{machine.capacity}
                        </span>
                        {machine.temperature && (
                          <span>Температура: {machine.temperature}°C</span>
                        )}
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            fillPercentage > 80
                              ? "bg-green-500"
                              : fillPercentage > 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Last Sync */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <Clock className="h-3 w-3" />
                      Последняя синхронизация: {machine.lastSync}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredMachines.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Аппараты не найдены
              </h3>
              <p className="text-muted-foreground">
                Попробуйте изменить параметры поиска или добавить новый аппарат
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <AddMachineDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </>
  );
}
