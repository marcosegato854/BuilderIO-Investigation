import { t } from 'i18n/config'
import { compose, identity, ifElse, multiply, pipe } from 'ramda'

export const keepInRange = (
  value: number,
  min?: number,
  max?: number
): number => {
  return Math.min(Math.max(value, min || value), max || value)
}

export const calculateDistance = (p1: Position3D, p2: Position3D): number => {
  const a = p2.x - p1.x
  const b = p2.y - p1.y
  if (!p1.z || !p2.z) return Math.hypot(a, b)
  const c = p2.z - p1.z
  return Math.hypot(a, b, c)
}

export const gbToTbCl = pipe(
  multiply(1 / 1024), // keep rows
  (n) => Math.ceil(n * 10) / 10 // keep rows
)

export const gbToTbRnd = pipe(
  multiply(1 / 1024), // keep rows
  (n) => Math.round(n * 10) / 10 // keep rows
)

export const storageUnitHandler = (spaceInGb: number) => {
  if (spaceInGb > 1000) return `${gbToTbRnd(spaceInGb)}TB`
  return `${spaceInGb}GB`
}

/**
 * according to PEF-1837, handle the MB using approx calculation
 */
export const projectUnitHandler = (spaceInMb?: number) => {
  if (!spaceInMb) return ''
  if (spaceInMb < 1000) return `${spaceInMb}MB`
  if (spaceInMb < 1000000) return `${mbToGbRnd(spaceInMb)}GB`
  return `${gbToTbRnd(mbToGbRnd(spaceInMb))}TB`
}

export const mbToGbRnd = pipe(
  multiply(1 / 1000), // keep rows
  (n) => Math.round(n * 10) / 10 // keep rows
)

export const cmToIn = (value: number): number => value / 2.54
export const inToCm = (value: number): number => value * 2.54
export const kmToM = (value: number): number => value / 1.609
export const mToKm = (value: number): number => value * 1.609
export const mtToFt = (value: number): number => value * 3.281
export const ftToMt = (value: number): number => value / 3.281
export const cmToKm = (value: number): number => value / 100000
export const inToM = (value: number): number => value / 63360

export type Measure = 'CM' | 'HZ' | 'KMH' | 'M' | 'MSEC' | 'KM' | 'MS'

/**
 * converts the unit label to the current unit
 */
export const unitLabel = (measure: Measure, unit?: 'metric' | 'imperial') => {
  if (!unit) return ''
  return t(`units.${unit}.${measure}`, measure)
}

/**
 * converts the value converted in the current unit, in integers
 */
export const unitValue = (
  converter: (n: number) => number,
  value?: number,
  unit?: 'metric' | 'imperial'
) => {
  if (!value) return 0
  return ifElse(
    () => unit === 'imperial',
    compose(Math.round, converter),
    compose(Math.round)
  )(value)
}

/**
 * rounds the value at the given number of digits
 */
export const digits = (value?: number, digitsNumber?: number) => {
  if (!value) return 0
  const multiplier = Math.pow(10, digitsNumber || 1)
  return Math.round(value * multiplier) / multiplier
}

/**
 * forces a fixed number of decimals
 */
export const forceDecimals = (value: number, decimals: number) => {
  const actualDecimals = value.toString().split('.')[1]?.length
  const missing = decimals - actualDecimals
  return missing > 0
    ? `${value.toString()}${Array(missing).fill('0').join('')}`
    : value.toString()
}

/**
 * converts the value converted in the current unit, with full digits
 */
export const unitValueFull = (
  converter: (n: number) => number,
  value?: number,
  unit?: 'metric' | 'imperial'
) => {
  if (!value) return 0
  return ifElse(() => unit === 'imperial', converter, identity)(value)
}

/**
 * formats the value converted in the current unit
 */
export const labelWithUnit = (
  measure: Measure,
  converter: (n: number) => number,
  value?: number,
  unit?: 'metric' | 'imperial',
  full?: boolean
) => {
  if (!value) return '--'
  if (!unit) return value
  const uValue = full
    ? unitValueFull(converter, value, unit)
    : unitValue(converter, value, unit)
  const uLabel = unitLabel(measure, unit)
  return `${uValue} ${uLabel}`
}

/**
 * seconds to hours conversion
 */
export const secToH = (value?: number) => {
  if (!value) return 0
  return value / 60 / 60
}

/**
 * seconds to minutes conversion
 */
export const secToMin = (value?: number) => {
  if (!value) return 0
  return value / 60
}
/**
 * Generate a random number in a range, including min and max
 * @param min
 * @param max
 * @returns number
 */
export const randomNumber = (min: number, max: number): number => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
