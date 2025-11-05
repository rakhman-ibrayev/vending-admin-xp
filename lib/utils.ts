import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  MILLISECONDS_IN_SECOND,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
  UTC_HOURS_OFFSET_KZ
} from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertKzDateToUTC(date: Date): Date {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const day = date.getUTCDate()
  const hour = date.getUTCHours()
  const minute = date.getUTCMinutes()
  const second = date.getUTCSeconds()

  const utcTimestamp =
    Date.UTC(year, month, day, hour, minute, second) -
    UTC_HOURS_OFFSET_KZ *
      MINUTES_IN_HOUR *
      SECONDS_IN_MINUTE *
      MILLISECONDS_IN_SECOND

  return new Date(utcTimestamp)
}

export function convertUTCToKzDate(utcDate: Date): Date {
  const timestamp = utcDate.getTime()

  return new Date(
    timestamp +
      UTC_HOURS_OFFSET_KZ *
        MINUTES_IN_HOUR *
        SECONDS_IN_MINUTE *
        MILLISECONDS_IN_SECOND
  )
}
