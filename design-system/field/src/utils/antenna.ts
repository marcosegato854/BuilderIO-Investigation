import { curry } from 'ramda'
import { digits, unitValueFull, mtToFt, ftToMt } from 'utils/numbers'

export const convToUnit = curry((unit: 'metric' | 'imperial', v: number) =>
  digits(unitValueFull(mtToFt, v, unit), 3)
)
export const convToUnitFull = curry((unit: 'metric' | 'imperial', v: number) =>
  unitValueFull(mtToFt, v, unit)
)
export const convToMetric = curry((unit: 'metric' | 'imperial', v: number) =>
  Number(unit === 'imperial' ? ftToMt(Number(v || 0)) : v)
)
export const leverarmWithUnits = (
  unit: 'metric' | 'imperial' | undefined,
  leverarm?: Partial<LeverArm> | null
) => {
  const conv = convToUnitFull(unit || 'metric')
  return {
    x: conv(leverarm?.x || 0),
    y: conv(leverarm?.y || 0),
    z: conv(leverarm?.z || 0),
  }
}
export const metricLeverArm = (
  unit: 'metric' | 'imperial' | undefined,
  leverarm?: Partial<LeverArm> | null
) => {
  const conv = convToMetric(unit || 'metric')
  return {
    x: conv(leverarm?.x || 0),
    y: conv(leverarm?.y || 0),
    z: conv(leverarm?.z || 0),
  }
}
