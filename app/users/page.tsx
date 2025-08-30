'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react'

// Mock data for users
const users = [
  {
    id: 'U-001',
    name: 'Иван Петров',
    email: 'ivan.petrov@company.com',
    role: 'Администратор',
    status: 'active',
    lastLogin: '2024-01-15 14:30',
    machinesAccess: 5
  },
  {
    id: 'U-002',
    name: 'Мария Сидорова',
    email: 'maria.sidorova@company.com',
    role: 'Оператор',
    status: 'active',
    lastLogin: '2024-01-15 09:15',
    machinesAccess: 3
  },
  {
    id: 'U-003',
    name: 'Алексей Козлов',
    email: 'alexey.kozlov@company.com',
    role: 'Менеджер',
    status: 'inactive',
    lastLogin: '2024-01-10 16:45',
    machinesAccess: 8
  }
]

const roles = ['Все', 'Администратор', 'Менеджер', 'Оператор']

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('Все')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'Все' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const activeUsers = users.filter(u => u.status === 'active').length
  const totalAccess = users.reduce((sum, u) => sum + u.machinesAccess, 0)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mt-12 md:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-work-sans)]">
                  Управление пользователями
                </h1>
                <p className="text-muted-foreground mt-2">
                  Контроль доступа и управление ролями
                </p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Добавить пользователя
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Всего пользователей
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  зарегистрированных
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активные</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {activeUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  пользователей онлайн
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Неактивные
                </CardTitle>
                <UserX className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {users.length - activeUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  требуют внимания
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Доступ к аппаратам
                </CardTitle>
                <Shield className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAccess}</div>
                <p className="text-xs text-muted-foreground">
                  общих разрешений
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск пользователей..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Filter className="h-4 w-4" />
                      Роль: {roleFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {roles.map(role => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => setRoleFilter(role)}
                      >
                        {role}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Users className="h-4 w-4" />
                      Статус:{' '}
                      {statusFilter === 'all'
                        ? 'Все'
                        : statusFilter === 'active'
                          ? 'Активные'
                          : 'Неактивные'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      Все пользователи
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                      Активные
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter('inactive')}
                    >
                      Неактивные
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Пользователи ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Доступ к аппаратам</TableHead>
                    <TableHead>Последний вход</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === 'Администратор'
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === 'active' ? 'default' : 'secondary'
                          }
                          className={
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : ''
                          }
                        >
                          {user.status === 'active' ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.machinesAccess} аппаратов</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="h-4 w-4 mr-2" />
                              Управление доступом
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
