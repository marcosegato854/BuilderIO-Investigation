/**
 * TYPES
 */

import { Position } from 'store/features/position/types'
import { SystemAction } from '../actions/types'

// System state
export type ActivationStatus =
  | 'Starting'
  | 'Initializing'
  | 'Shutdown'
  | 'Configuring'
  | 'Deactivating'
  | 'Deactivated'
  | 'Activating'
  | 'Activated'
  | 'StartingInitialAlignment'
  | 'InitialAlignment'
  | 'StartingFinalAlignment'
  | 'FinalAlignment'
  | 'StartingLogging'
  | 'Logging'
  | 'StartingRecording'
  | 'StoppingRecording'
  | 'Recording'
export const activatedStates: ActivationStatus[] = [
  'Activated',
  'StartingInitialAlignment',
  'InitialAlignment',
  'StartingFinalAlignment',
  'FinalAlignment',
  'StartingLogging',
  'Logging',
  'StartingRecording',
  'StoppingRecording',
  'Recording',
]
export const directionsStates: ActivationStatus[] = [
  'Logging',
  'StartingRecording',
  'StoppingRecording',
  'Recording',
]
export const visibleMapStates: ActivationStatus[] = [...activatedStates]
export const canRecordStates: ActivationStatus[] = [
  'Logging',
  'StartingRecording',
  'StoppingRecording',
  'Recording',
]
export const intermediateStates: ActivationStatus[] = [
  'Starting',
  'Initializing',
  'Configuring',
  'Deactivating',
  'Activating',
  'StartingInitialAlignment',
  'StartingFinalAlignment',
  'StartingLogging',
  'StartingRecording',
  'StoppingRecording',
]
export const alignmentStates: ActivationStatus[] = [
  'InitialAlignment',
  'FinalAlignment',
]
export const deactivatedStates: ActivationStatus[] = [
  'Starting',
  'Initializing',
  'Shutdown',
  'Configuring',
  'Deactivated',
]

export type SystemState = {
  state: ActivationStatus
}
export type SystemStateResponse = SystemState & {}

export type SensorUnit = { connected: boolean; serial?: string }
export type License = {
  field: {
    eid: string
    maintenanceExpiryDate: string
  }
  loc8: {
    eid: string
  }
}
export type PP4Info = {
  serial: string
  firmware: string
}
export type PP4 = {
  CON: PP4Info
  PCU: PP4Info
  NAV: PP4Info
}
export type TrackimoInfo = {
  state: string
  deviceid: string
  imei: string
  swversion: string
}

export enum MapsCountry {
  INTERNATIONAL = 'international',
  JAPAN = 'JP',
  SOUTH_KOREA = 'KR',
  CHINA = 'CN',
}

export enum TileProvider {
  HEREMAPS = 'HEREMAPS',
  OPENSTREETMAP = 'OPENSTREETMAP',
  BAIDU = 'BAIDU',
  NAVER = 'NAVER',
}

export type MapsConfig = {
  appId?: string
  appCode?: string
  appKey?: string
  tileProvider: TileProvider
  tileUrl: string
  tileStyle: string
  tilePrefix?: string
  copyrightUrl: string
}

// Info
export type SystemInfo = {
  serial: string
  softwareversion: string
  windowsversion?: string
  systemtype: string
  systemprofile?: string
  product?: string
  hostname?: string
  locked?: boolean
  sensorUnit?: SensorUnit
  /* rotationplatform: boolean */
  responsivenessInterval?: number
  license?: License
  PP4?: PP4
  trackimo: TrackimoInfo
  maps?: MapsConfig
  countryCode: MapsCountry
  windowsBuild?: string
  softwareBuildDate?: string
  softwareBuildType?: 'Develop' | 'Release'
  installerversion?: string
}
export type SystemInfoResponse = SystemInfo & {}
export type SystemInfoUpdateRequest = Partial<SystemInfo>

export type Lib = {
  name: string
  url?: string
}
export type SystemLicensesResponse = {
  libs: Lib[]
}

// Notifications
export type SystemNotificationsResponse = {
  notifications: SystemNotification[]
}

export enum SystemNotificationType {
  MESSAGE = 0,
  WARNING = 1,
  ERROR = 2,
  REMOVE = 3,
  ANNOTATION = 4,
  INTERNAL = 5,
}

export type SystemNotification = {
  type: SystemNotificationType
  description: string
  time?: string
  id?: number
  code: string
  // position?: Position // disabled after china fix
  mapPosition?: Position
  displayAt?: NotificationsPosition
  p1?: string
  p2?: string
  p3?: string
}

export enum NotificationsPosition {
  CENTER = 'center',
  BOTTOM = 'bottom',
}

// RESPONSIVENESS
export type ConnectionStrenght = -1 | 0 | 1 | 2 | 3 | 4

export type PerformanceSystem = {
  label: string
  health: number
  critical: boolean
}

export type PerformanceConnection = PerformanceSystem & {
  health: ConnectionStrenght
}

export type Responsiveness = {
  health: number
  critical: boolean
}

export type ResponsivenessSystem = Responsiveness & {
  details: {
    cpu?: PerformanceSystem
    gpu?: PerformanceSystem
    ram?: PerformanceSystem
  }
}

export type ResponsivenessConnection = Responsiveness & {
  internet: PerformanceConnection
  gateway: PerformanceConnection
  client: PerformanceConnection
}

export type ResponsivenessDetail = {
  id: number
  name: string
  health: number
  critical: boolean
}

export type ResponsivenessDetailBattery = ResponsivenessDetail & {
  description: string
  minutes: number
  charging: boolean
  active: boolean
}

export type ResponsivenessDetailDisk = ResponsivenessDetail & {
  total: number
  available: number
}

export type ResponsivenessBattery = Responsiveness & {
  charging: boolean
  acplug: boolean
  minutes: number
  details: {
    batteries: ResponsivenessDetailBattery[]
  }
}

export type ResponsivenessStorage = Responsiveness & {
  total: number
  available: number
  details: {
    disks: ResponsivenessDetailDisk[]
  }
}

export type SystemResponsiveness = {
  system: ResponsivenessSystem
  connection: ResponsivenessConnection
  battery: ResponsivenessBattery
  storage: ResponsivenessStorage
  usersConnected: number
}

export type SystemResposivenessResponse = SystemResponsiveness & {}

export enum SystemLogType {
  WARNING = 'warning',
  ERROR = 'error',
  MESSAGE = 'message',
}

export type SystemLogRequest = {
  type: SystemLogType
  code: string
  message: string
}

export type ClientLogItem = {
  type: 'log' | 'info' | 'warn' | 'error'
  message: string
  time: number
}

export type SystemClientLogRequest = {
  logs: ClientLogItem[]
}

export enum ModuleID {
  SYSTEM = 'system',
  USER = 'user',
  DATASTORAGE = 'datastorage',
  POSITION = 'position',
  CAMERA = 'camera',
  SCANNER = 'scanner',
  NOTIFICATION = 'notification',
  POINTCLOUD = 'pointcloud',
  IMAGEAI = 'imageAI',
  PLANNING = 'planning',
  ROUTING = 'routing',
}

export type SystemModulesResponse = {
  modules: ModuleID[]
}
export type SystemNotificationPositionPayload = {
  notification: SystemNotification
  position: NotificationsPosition
}

export type UpdatePrepareAction = SystemAction
export type UpdateAction = UpdatePrepareAction

export type UpdatePrepareActionResponse = {
  action: UpdatePrepareAction
}
export type UpdateActionResponse = UpdatePrepareActionResponse

export type UpdatePrepareActionAbortResponse = {}

export type UpdateInfo = {
  usbConnected: boolean
  version: string
  changelog: string
  lastVersion: string
  lastDate: string
  eula: string
}

export type UpdateInfoResponse = UpdateInfo & {}

export type CheckUpdateResponse = {
  version: string
  maintenance?: string
  released?: string
  newUpdate: boolean
  coveredByMaintenance: boolean
  changelog: string
}

// add a variable to check if the user requested the update
export type CheckUpdate = CheckUpdateResponse & {
  userRequest?: boolean
}

export type CheckUpdateRequest = {
  userRequest?: boolean
}
