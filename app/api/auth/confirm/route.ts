import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RouteResponse } from '@/lib/types'

interface ConfirmRequest {
  token_hash: string
  type: EmailOtpType
  next?: string
}

interface ConfirmResponse {
  redirect_url: string
}

export async function GET(
  request: NextRequest
): RouteResponse<ConfirmResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/'

    if (!token_hash || !type) {
      return NextResponse.json(
        { success: false, message: 'Missing token_hash or type parameter' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash
    })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    // Return success with redirect URL for client-side handling
    return NextResponse.json({
      success: true,
      message: 'Email confirmed successfully',
      data: {
        redirect_url: next
      }
    })
  } catch (error) {
    console.error('Email confirmation error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support POST for programmatic confirmation
export async function POST(
  request: NextRequest
): RouteResponse<ConfirmResponse> {
  try {
    const {
      token_hash,
      type,
      next = '/'
    }: ConfirmRequest = await request.json()

    if (!token_hash || !type) {
      return NextResponse.json(
        { success: false, message: 'token_hash and type are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash
    })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email confirmed successfully',
      data: {
        redirect_url: next
      }
    })
  } catch (error) {
    console.error('Email confirmation error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
