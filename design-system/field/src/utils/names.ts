import moment from 'moment'

export const getUniqueName = (names: NamedEntity[], prefix: string): string => {
  const dateStr = moment().format('YYYYMMDD_HHmm')
  return `${prefix}_${dateStr}`
}

export const getMaxNameChars = () => 25
