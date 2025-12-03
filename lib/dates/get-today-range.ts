export const getTodayRange = () => {
  const now = new Date()

  // Local start of day
  const startLocal = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  )

  // Local end of day
  const endLocal = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  )

  // converted to UTC
  return {
    startDate: startLocal.toISOString(),
    endDate: endLocal.toISOString()
  }
}
