'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const initialState = {
  error: null
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-[95%] max-w-sm shadow-lg py-4">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Вход</CardTitle>
        </CardHeader>

        <CardContent className="px-4">
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isPending}
                autoComplete="email"
                placeholder="user@pharmexpress.kz"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            {state.error && (
              <div className="w-full text-center text-sm text-destructive bg-destructive/10 rounded-md py-2 mb-2">
                {state.error.message}
              </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Входим...
                </>
              ) : (
                'Войти'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
