import { ScannerTotals } from 'store/features/planning/types'
import { ScannerSpecs } from 'store/features/scanner/types'
import { PlanningSettings } from 'store/features/settings/types'

export function scannerTotals(
  scanners: ScannerSpecs[] | undefined | null
): ScannerTotals {
  if (!scanners) return {}
  return scanners.reduce(
    (stack, scanner) => {
      if (scanner.manufacturer === 'Optech')
        return { ...stack, numOptech: (stack.numOptech || 0) + 1 }
      if (scanner.manufacturer === 'Velodyne')
        return { ...stack, numVelodyne: (stack.numVelodyne || 0) + 1 }
      if (scanner.manufacturer === 'ZF')
        return { ...stack, numZF: (stack.numZF || 0) + 1 }
      if (scanner.manufacturer === 'Hesai')
        return { ...stack, numHesai: (stack.numHesai || 0) + 1 }
      return stack
    },
    {
      numOptech: 0,
      numVelodyne: 0,
      numZF: 0,
      numHesai: 0,
    } as ScannerTotals
  )
}

export const getSavedScannerModel = (
  settings: PlanningSettings | null
): ScannerSpecs['manufacturer'] => {
  if (Number(settings?.scanner?.numOptech) > 0) return 'Optech'
  if (Number(settings?.scanner?.numZF) > 0) return 'ZF'
  if (Number(settings?.scanner?.numHesai) > 0) return 'Hesai'
  if (!settings?.scanner)
    console.warn('[SCANNER] no saved settings, fallback to Velodyne')
  return 'Velodyne'
}
