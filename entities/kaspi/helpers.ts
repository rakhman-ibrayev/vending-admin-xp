import { NextResponse } from 'next/server'

export const buildResponse = (
  txn_id: string,
  result: number,
  comment: string,
  prv_txn?: string,
  sum?: string
) => {
  const response: any = {
    txn_id,
    result,
    comment,
    bin: process.env.NEXT_PUBLIC_PHARMEXPRESS_COMPANY_BIN
  }

  if (prv_txn !== undefined) response.prv_txn = prv_txn
  if (sum !== undefined) response.sum = sum

  return NextResponse.json({ response }, { status: 200 })
}

export const parseKaspiDate = (dateStr: string): Date => {
  const year = parseInt(dateStr.slice(0, 4))
  const month = parseInt(dateStr.slice(4, 6)) - 1
  const day = parseInt(dateStr.slice(6, 8))
  const hour = parseInt(dateStr.slice(8, 10))
  const minute = parseInt(dateStr.slice(10, 12))
  const second = parseInt(dateStr.slice(12, 14))

  return new Date(year, month, day, hour, minute, second)
}

export const getKaspiQrLink = (orderId: number): string => {
  return `https://kaspi.kz/pay/PharmExpress?17533=${orderId}`
}
