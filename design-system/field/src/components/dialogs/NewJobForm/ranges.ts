import { map, max, min, prop, reduce } from 'ramda'
import {
  ScannerSupportedSettings,
  SettingsRow,
} from 'store/features/scanner/types'

const maxP = (property: keyof SettingsRow, arr?: SettingsRow[]) => {
  return arr ? (reduce(max, 0, map(prop(property), arr)) as number) : 0
}

const minP = (property: keyof SettingsRow, arr?: SettingsRow[]) => {
  return arr ? (reduce(min, Infinity, map(prop(property), arr)) as number) : 0
}

const emptySettings = {
  min: 0,
  max: 0,
  default: 0,
}

export const getRangesForCoordinateSystem = (
  supportedSettings: ScannerSupportedSettings
) => ({
  cameraDistance: {
    min: 1,
    max: 10,
    default: 5,
  },
  cameraElapse: {
    min: 125,
    max: 2000,
    default: 250,
  },
  drivingspeed: {
    min: 1,
    max: 130,
    default: 50,
  },
  scannerPointPerSecond: getPointsPerSecond(supportedSettings),
  scannerRange: getScanRange(supportedSettings),
  scannerRotationSpeed: getScannerRotationSpeed(supportedSettings),
  scannerScanlineSpacing: {
    min: 1,
    max: 80,
    default: 5,
  },
})

const getScannerRotationSpeed = (
  supportedSettings: ScannerSupportedSettings
) => {
  if (!supportedSettings.settings) return emptySettings
  const { settings } = supportedSettings
  return {
    min: minP('rps', settings),
    max: maxP('rps', settings),
    default: maxP('rps', settings),
  }
}

const getPointsPerSecond = (supportedSettings: ScannerSupportedSettings) => {
  if (!supportedSettings.settings) return emptySettings
  const { settings } = supportedSettings
  const div = (n: number) => Math.round(n / 1000)
  return {
    min: div(minP('pts', settings)),
    max: div(maxP('pts', settings)),
    default: div(maxP('pts', settings)),
  }
}

const getScanRange = (supportedSettings: ScannerSupportedSettings) => {
  if (!supportedSettings.settings) return emptySettings
  const { settings } = supportedSettings
  return {
    min: minP('mr', settings),
    max: maxP('mr', settings),
    default: minP('mr', settings),
  }
}
