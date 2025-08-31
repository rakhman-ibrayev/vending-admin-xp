'use client'

import { useState } from 'react'
import Link from 'next/link'
import { redirect, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Coffee,
  BarChart3,
  Package,
  Users,
  Settings,
  Menu,
  X,
  Home,
  LogOut
} from 'lucide-react'
import { Card } from './ui/card'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  {
    name: 'Дашборд',
    href: '/',
    icon: Home
  },
  {
    name: 'Аппараты',
    href: '/machines',
    icon: Coffee
  },
  {
    name: 'Аналитика',
    href: '/analytics',
    icon: BarChart3
  },
  {
    name: 'Товары',
    href: '/inventory',
    icon: Package
  },
  {
    name: 'Пользователи',
    href: '/users',
    icon: Users
  },
  {
    name: 'Настройки',
    href: '/settings',
    icon: Settings
  }
]

export interface SidebarProps {
  user: {
    email: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out md:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-sidebar-border">
            <h1 className="text-lg font-bold text-sidebar-foreground">
              PharmExpress
            </h1>

            <p className="text-xs text-sidebar-foreground/60">
              Панель управления
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map(item => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-sidebar-border space-y-4">
            <Card className="flex items-center gap-4 px-4 py-3 bg-muted/60 border-none shadow-sm">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/80 text-white font-bold text-lg">
                {user.email[0]?.toUpperCase() ?? 'U'}
              </div>

              <p className="text-sm font-semibold truncate">{user.email}</p>

              <Button
                onClick={async () => {
                  await supabase.auth.signOut()
                  redirect('/login')
                }}
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/20 transition"
                title="Выйти из аккаунта"
                aria-label="Выйти"
              >
                <LogOut className="size-5" />
              </Button>
            </Card>

            <div className="text-xs text-sidebar-foreground/60">
              © 2024 PharmExpress
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
