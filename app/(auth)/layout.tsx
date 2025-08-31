import { AuthRestrict } from '@/components/auth-restrict'
import { SidebarLayout } from '@/components/sidebar-layout'

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthRestrict>
      <SidebarLayout>{children}</SidebarLayout>
    </AuthRestrict>
  )
}
