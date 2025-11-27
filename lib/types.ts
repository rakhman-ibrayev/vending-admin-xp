import type { NextResponse } from 'next/server'

export interface DefaultResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export type RouteResponse<T> = Promise<NextResponse<DefaultResponse<T>>>
