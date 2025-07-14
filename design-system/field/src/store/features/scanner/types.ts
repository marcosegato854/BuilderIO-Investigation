/**
 * TYPES
 */

// Scanner supportedSettings
export type SettingsRow = {
  rps: number
  pts: number
  mr: number
}

/* export type ScannerSupportedSettings = {
  metric?: SettingsRow[]
  imperial?: SettingsRow[]
} */

export enum TemperatureStatus {
  Error = 'error',
  Warning = 'warning',
  High = 'high',
  Normal = 'normal',
}

type ScannerTemperature = {
  state: TemperatureStatus
  value: number
}

export type ScannerSpecs = {
  manufacturer: 'Optech' | 'Velodyne' | 'ZF' | 'Hesai'
  name: string
  model: string
  position: 'Center' | 'Front' | 'Rear' | 'Left' | 'Right'
  serial: string
  firmware: string
  standby?: boolean
  temperature?: ScannerTemperature
}

/* export type ScannersSettingsList = {} & {
  zf: ScannerSupportedSettings
  optech: ScannerSupportedSettings
  velodyne: ScannerSupportedSettings
} */

export type ScannersSettingsList = {
  settings: SettingsRow[]
}

export type ScannerSupportedSettings = ScannersSettingsList

export type ScannerSupportedSettingsResponse = ScannersSettingsList & {
  current: 'zf' | 'optech' | 'velodyne' | 'hesai'
}

export type ScannerInfoResponse = {
  scanner: ScannerSpecs[]
  softwareversion: string
}
