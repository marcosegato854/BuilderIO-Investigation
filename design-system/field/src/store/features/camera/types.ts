/**
 * TYPES
 */
// Displayable Camera Names
export type DisplayableCameraNamesResponse = {
  groups: CameraGroup[]
}

export type CameraDetails = {
  name: string
  active: boolean
}

export type CameraGroup = {
  name: 'Left' | 'Right' | 'Rear' | 'Front' | 'Sphere'
  cameras: CameraDetails[]
}

export type CameraExposureResponse = {
  automatic: boolean
  extendedExposure: string
}

export type CameraExposureControl = 'increase' | 'decrease'

export type CameraExposureSetPayload = {
  action: CameraExposureControl
}

export type CameraTriggerType = 'None' | 'Distance' | 'Elapse'

export type CameraTriggerResponse = {
  type: CameraTriggerType
  space: number
  time: number
}

export type CameraTrigger = {
  type: CameraTriggerType
  distance: number
  elapse: number
}

export type CameraTriggerDistancePayload = {
  type: CameraTriggerType
  space: number
}

export type CameraTriggerPayload = {
  type: CameraTriggerType
}

export type AntennaClientSettings = {
  pixel: { x: number; y: number }
  leverarm?: LeverArm
  distance: number
}

export type Get2ndAntennaClientSettingsResponse = AntennaClientSettings & {}
export type Update2ndAntennaClientSettingsPayload = AntennaClientSettings & {}
export type Update2ndAntennaClientSettingsResponse = AntennaClientSettings & {}

export type CalculateAntenna2LeverarmRequest = AntennaClientSettings
export type CalculateAntenna2LeverarmResponse = LeverArm
