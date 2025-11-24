export const calculatePercentageChange = (
  current: number,
  previous: number
) => {
  // If there was no value in the previous period and current > 0,
  // return null to indicate an undefined/infinite percent change.
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 100)
}
