import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RouteResponse } from '@/lib/types'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_at: number
  user: {
    id: string
    email: string
    role: string
  }
}

export async function POST(request: NextRequest): RouteResponse<LoginResponse> {
  try {
    const { email, password }: LoginRequest = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      )
    }

    // Return the session data that Postman can use
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        access_token: data.session?.access_token!,
        refresh_token: data.session?.refresh_token!,
        expires_at: data.session?.expires_at!,
        user: {
          id: data.user?.id!,
          email: data.user?.email!,
          role: data.user?.role!
        }
      }
    })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
