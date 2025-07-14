import { Needed } from 'store/features/planning/types'

export function hasNeededInfo(needed?: Needed | null): boolean {
  if (!needed) return false
  if (!needed.time) return false
  if (!Number(needed.time)) return false
  return true
}
