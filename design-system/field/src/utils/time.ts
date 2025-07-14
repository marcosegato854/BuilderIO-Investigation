import { t } from 'i18n/config'
// import moment from 'moment'

export const format = (seconds: number): string => {
  if (isNaN(seconds)) return '00:00'

  const date = new Date(seconds * 1000)
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = date.getUTCSeconds().toString().padStart(2, '0')
  if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
  return `${mm}:${ss}`
}

export const minInH = (minutes: number) =>
  // moment().startOf('day').add(minutes, 'minutes').format('H[h] m[m]')
  // fix to handle remaning status > 24h
  `${Math.floor(minutes / 60)}${t('units.time.hours', 'h')} ${minutes % 60}${t(
    'units.time.minutes',
    'm'
  )}`

// evaluate if in the current date enough days are passed
export const checkForDateValidity = (
  startDate: string,
  days: number,
  endDate?: string
): boolean => {
  const firstDate = new Date(startDate)
  const lastDate = endDate ? new Date(endDate) : new Date()
  const daysToMilliseconds = days * 24 * 60 * 60 * 1000
  const elapsed = lastDate.getTime() - firstDate.getTime()
  return elapsed > daysToMilliseconds
}
