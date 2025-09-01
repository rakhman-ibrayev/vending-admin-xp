// utils/dateFormatter.ts
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/ru'

// Initialize dayjs plugins
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ru')

export type DateFormatOptions = {
  format?: 'relative' | 'datetime' | 'date' | 'time' | 'iso' | 'custom'
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
    format = 'relative',
    customFormat = 'DD.MM.YYYY HH:mm',
    timezone = 'local'
  } = options

  // Parse the date (Supabase dates are in UTC with timezone offset)
  let date = dayjs(dateString)

  // Convert to specified timezone
  if (timezone === 'local') {
    date = date.local()
  } else if (timezone !== 'utc') {
    date = date.tz(timezone)
  }

  switch (format) {
    case 'relative':
      return formatRelativeTime(date)

    case 'datetime':
      return date.format('DD.MM.YYYY HH:mm')

    case 'date':
      return date.format('DD.MM.YYYY')

    case 'time':
      return date.format('HH:mm:ss')

    case 'iso':
      return date.toISOString()

    case 'custom':
      return date.format(customFormat)

    default:
      return date.format('DD.MM.YYYY HH:mm')
  }
}

/**
 * Format relative time in Russian with precise control
 */
const formatRelativeTime = (date: dayjs.Dayjs): string => {
  const now = dayjs()
  const minutesDiff = now.diff(date, 'minute')
  const hoursDiff = now.diff(date, 'hour')
  const daysDiff = now.diff(date, 'day')

  if (minutesDiff === 0) return 'только что'
  if (minutesDiff === 1) return '1мин. назад'
  if (minutesDiff < 60) return `${minutesDiff}мин. назад`

  if (hoursDiff === 1) return '1ч. назад'
  if (hoursDiff < 24) return `${hoursDiff}ч. назад`

  if (daysDiff === 1) return '1д. назад'
  if (daysDiff < 7) return `${daysDiff}д. назад`

  if (daysDiff < 30) return `${Math.floor(daysDiff / 7)}нед. назад`

  return date.format('DD.MM.YYYY') // For older dates, show actual date
}

/**
 * Check if a date is older than specified minutes (for status checks)
 */
export const isOlderThan = (
  dateString: string | null | undefined,
  minutes: number
): boolean => {
  if (!dateString) return true

  const date = dayjs(dateString)
  const minutesDiff = dayjs().diff(date, 'minute')
  return minutesDiff > minutes
}

/**
 * Get precise time difference in various units
 */
export const getTimeDifference = (dateString: string | null | undefined) => {
  if (!dateString) return null

  const date = dayjs(dateString)
  const now = dayjs()

  return {
    minutes: now.diff(date, 'minute'),
    hours: now.diff(date, 'hour'),
    days: now.diff(date, 'day'),
    weeks: now.diff(date, 'week'),
    precise: now.diff(date, 'minute') // Total minutes for precise calculations
  }
}

/**
 * Predefined formatters for common use cases
 */
export const dateFormatters = {
  // For machine last_seen
  machineLastSeen: (dateString: string | null) =>
    formatDate(dateString, { format: 'relative' }),

  // For order timestamps
  orderTime: (dateString: string | null) =>
    formatDate(dateString, { format: 'datetime' }),

  // For created_at fields in tables
  tableDate: (dateString: string | null) =>
    formatDate(dateString, { format: 'date' }),

  // For detailed timestamps
  fullDateTime: (dateString: string | null) =>
    formatDate(dateString, {
      format: 'custom',
      customFormat: 'DD.MM.YYYY HH:mm:ss'
    }),

  // For age verification (e.g., >4 minutes)
  isOffline: (dateString: string | null) => isOlderThan(dateString, 4)
}

// Helper to determine actual status based on last_seen
export const getActualStatus = (
  storedStatus: 'online' | 'offline',
  lastSeen: string | null
): 'online' | 'offline' => {
  if (!lastSeen) return 'offline'

  const minutesDiff = dayjs().diff(dayjs(lastSeen), 'minute')

  // If last seen is more than 4 minutes ago, force offline status
  if (
    minutesDiff >
    Number(process.env.NEXT_PUBLIC_VENDING_MACHINE_HEARTBEAT_INTERVAL_MINS)
  ) {
    return 'offline'
  }

  // Otherwise use the stored status
  return storedStatus
}

export const getTodayRange = () => ({
  startDate: dayjs().utc().startOf('day').format(),
  endDate: dayjs().utc().endOf('day').format()
})

export const getThisWeekRange = () => ({
  startDate: dayjs().utc().startOf('week').format(),
  endDate: dayjs().utc().endOf('week').format()
})

export const getThisMonthRange = () => ({
  startDate: dayjs().utc().startOf('month').format(),
  endDate: dayjs().utc().endOf('month').format()
})

export const getLast30DaysRange = () => ({
  startDate: dayjs().utc().subtract(30, 'day').format(),
  endDate: dayjs().utc().format()
})
