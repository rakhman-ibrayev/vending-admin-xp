import { parseISO, differenceInMinutes, isValid } from 'date-fns'

export const isOlderThan = (
  dateString: string | null | undefined,
  minutes: number
): boolean => {
  if (!dateString) return true

  const date = parseISO(dateString)
  if (!isValid(date)) return true

  return differenceInMinutes(new Date(), date) > minutes
}
