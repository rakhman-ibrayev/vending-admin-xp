import { createClient } from '@/lib/supabase/server'
import { Sidebar } from './sidebar'

export interface SidebarLayoutProps {
  children: React.ReactNode
}

export async function SidebarLayout({ children }: SidebarLayoutProps) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={{ email: data.user?.email ?? '' }} />

      <div className="flex-1 md:ml-64 p-4">{children}</div>
    </div>
  )
}
