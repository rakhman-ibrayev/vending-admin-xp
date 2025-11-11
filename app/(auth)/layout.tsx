'use server'

import { ReactQueryClientProvider } from '@/components/react-query-client-provider'
import { SidebarLayout } from '@/components/sidebar-layout'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) redirect('/login')

  return (
    <ReactQueryClientProvider>
      <SidebarLayout user={{ email: data.user.email ?? '' }}>
        {children}
      </SidebarLayout>
    </ReactQueryClientProvider>
  )
}
