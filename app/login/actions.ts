'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import type { AuthError } from '@supabase/supabase-js'
import { REDIRECT_PARAM } from '@/lib/constants'

export async function login(
  _: any,
  formData: FormData
): Promise<{ error: AuthError | null }> {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (!error) {
    revalidatePath('/', 'layout')
    const redirectTo = (formData.get(REDIRECT_PARAM) as string) || '/'
    redirect(redirectTo)
  } else {
    console.error('Login error:', error)
  }

  return { error }
}
