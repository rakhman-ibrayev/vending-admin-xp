import {
  MILLISECONDS_IN_SECOND,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
  UTC_HOURS_OFFSET_KZ
} from '../constants'

export const convertUTCToKzDate = (utcDate: Date): Date => {
  const timestamp = utcDate.getTime()

  return new Date(
    timestamp +
      UTC_HOURS_OFFSET_KZ *
        MINUTES_IN_HOUR *
        SECONDS_IN_MINUTE *
        MILLISECONDS_IN_SECOND
  )
}
