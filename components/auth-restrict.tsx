'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export interface AuthRestrictProps {
  children: React.ReactNode
}

export async function AuthRestrict({ children }: AuthRestrictProps) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) redirect('/login')

  return children
}
