import {
  format,
  parseISO,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  isValid
} from 'date-fns'
import { ru } from 'date-fns/locale'

export type DateFormatOptions = {
  format?:
    | 'relative'
    | 'datetime'
    | 'date'
    | 'time'
    | 'iso'
    | 'daymonth'
    | 'custom'
  customFormat?: string
  timezone?: string
}

/**
 * General purpose date formatter for Supabase dates
 * @param dateString - ISO date string from Supabase
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | null | undefined,
  options: DateFormatOptions = {}
): string => {
  if (!dateString) return '—' // Return dash for null/undefined dates

  const {
    format: formatType = 'relative',
    customFormat = 'dd.MM.yyyy HH:mm',
    timezone = 'local'
  } = options

  const date = parseISO(dateString)
  if (!isValid(date)) return '—'

  // Handle timezone roughly (date-fns is local by default)
  // If we really need UTC display, we shift the time.
  let dateToFormat = date
  if (timezone === 'utc') {
    dateToFormat = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
  }

  switch (formatType) {
    case 'relative':
      return formatRelativeTime(date)

    case 'datetime':
      return format(dateToFormat, 'dd.MM.yyyy HH:mm', { locale: ru })

    case 'date':
      return format(dateToFormat, 'dd.MM.yyyy', { locale: ru })

    case 'time':
      return format(dateToFormat, 'HH:mm:ss', { locale: ru })

    case 'iso':
      return date.toISOString()

    case 'daymonth':
      return format(dateToFormat, 'dd MMM', { locale: ru })

    case 'custom':
      return format(dateToFormat, customFormat, { locale: ru })

    default:
      return format(dateToFormat, 'dd.MM.yyyy HH:mm', { locale: ru })
  }
}

/**
 * Format relative time in Russian with precise control
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const minutesDiff = differenceInMinutes(now, date)
  const hoursDiff = differenceInHours(now, date)
  const daysDiff = differenceInDays(now, date)

  if (minutesDiff === 0) return 'только что'
  if (minutesDiff === 1) return '1мин. назад'
  if (minutesDiff < 60) return `${minutesDiff}мин. назад`

  if (hoursDiff === 1) return '1ч. назад'
  if (hoursDiff < 24) return `${hoursDiff}ч. назад`

  if (daysDiff === 1) return '1д. назад'
  if (daysDiff < 7) return `${daysDiff}д. назад`

  if (daysDiff < 30) return `${Math.floor(daysDiff / 7)}нед. назад`

  return format(date, 'dd.MM.yyyy', { locale: ru }) // For older dates, show actual date
}
