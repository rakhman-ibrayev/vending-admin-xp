import { Sidebar } from './sidebar'

export interface SidebarLayoutProps {
  user: {
    email: string
  }
  children: React.ReactNode
}

export function SidebarLayout({ user, children }: SidebarLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={user} />

      <div className="flex-1 md:ml-64 p-4 max-w-full">{children}</div>
    </div>
  )
}
