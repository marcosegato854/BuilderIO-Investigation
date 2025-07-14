import { ScannerTotals } from 'store/features/planning/types'
import { Position } from 'utils/myVR/types'
/**
 * TYPES
 */

export type AudioSettings = {
  globalVolume: number
  audibleMessages: {
    COLLECTION: boolean
    NAVIGATION: boolean
    ERROR: boolean
  }
}

export enum LocalFonts {
  LATIN = 'latin',
  CHINESE = 'chinese',
}

export type PlanningSettings = {
  scanner: ScannerTotals | null
  sideCameras: number | null
}

export type I18nSettings = {
  language: string | null
}

export type JobsSettings = {
  lastUsedProfile?: string
}

export type AdminSettings = {
  disableHSPC?: boolean
  disableBuffer?: boolean
  disableFeatures?: boolean
}

export type UpdateSettings = {
  hideUpdate?: boolean
  checkDate?: string
}

export type Settings = {
  audio?: AudioSettings
  lastPosition?: Position
  planning?: PlanningSettings
  i18n?: I18nSettings
  font?: LocalFonts
  jobs?: JobsSettings
  admin?: AdminSettings
  update?: UpdateSettings
}

export type SetAudioSettingsPayload = AudioSettings & {}
export type SetLastPositionSettingsPayload = Position & {}
export type SetPlanningSettingsPayload = PlanningSettings & {}
export type SetI18nSettingsPayload = I18nSettings & {}
export type SetJobsSettingsPayload = JobsSettings & {}
export type SetAdminSettingsPayload = AdminSettings & {}
export type SettingsGetResponse = Settings & {}
export type SettingsSaveRequest = Settings & {}
export type SettingsSaveResponse = Settings & {}
export type SetUpdateSettingsPayload = UpdateSettings & {}
