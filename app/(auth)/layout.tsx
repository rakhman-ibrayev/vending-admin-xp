import { AuthRestrict } from '@/components/auth-restrict'
import { ReactQueryClientProvider } from '@/components/react-query-client-provider'
import { SidebarLayout } from '@/components/sidebar-layout'

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ReactQueryClientProvider>
      <AuthRestrict>
        <SidebarLayout>{children}</SidebarLayout>
      </AuthRestrict>
    </ReactQueryClientProvider>
  )
}
