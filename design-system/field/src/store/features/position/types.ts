/**
 * TYPES
 */
export enum Accuracy {
  Good = 0,
  Average = 1,
  Bad = 2,
}

export type GPSType =
  | 'NONE'
  | 'FIXEDPOS'
  | 'FIXEDHEIGHT'
  | 'DOPPLER_VELOCITY'
  | 'SINGLE'
  | 'PSRDIFF'
  | 'WAAS'
  | 'PROPAGATED'
  | 'L1_FLOAT'
  | 'NARROW_FLOAT'
  | 'L1_INT'
  | 'WIDE_INT'
  | 'NARROW_INT'
  | 'RTK_DIRECT_INS'
  | 'INS_SBAS'
  | 'INS_PSRSP'
  | 'INS_PSRDIFF'
  | 'INS_RTKFLOAT'
  | 'INS_RTKFIXED'
  | 'PPP_CONVERGING'
  | 'PPP'
  | 'OPERATIONAL'
  | 'WARNING'
  | 'OUT_OF_BOUNDS'
  | 'INS_PPP_CONVERGING'
  | 'INS_PPP'
  | 'PPP_BASIC_CONVERGING'
  | 'PPP_BASIC'
  | 'INS_PPP_BASIC_CONVERGING'
  | 'INS_PPP_BASIC'

export type GPSStatus =
  | 'SOL_COMPUTED'
  | 'INSUFFICIENT_OBS'
  | 'NO_CONVERGENCE'
  | 'SINGULARITY'
  | 'COV_TRACE'
  | 'TEST_DIST'
  | 'COLD_START'
  | 'V_H_LIMIT'
  | 'VARIANCE'
  | 'RESIDUALS'
  | 'INTEGRITY_WARNING'
  | 'PENDING'
  | 'INVALID_FIX'
  | 'UNAUTHORIZED'
  | 'INVALID_RATE'

export type INSStatus =
  | 'INS_INACTIVE'
  | 'INS_ALIGNING'
  | 'INS_HIGH_VARIANCE'
  | 'INS_SOLUTION_GOOD'
  | 'INS_SOLUTION_FREE'
  | 'INS_ALIGNMENT_COMPLETE'
  | 'DETERMINING_ORIENTATION'
  | 'WAITING_INITIALPOS'
  | 'WAITING_AZIMUTH'
  | 'INITIALIZING_BIASES'
  | 'MOTION_DETECT'

export type Position = {
  type?: GPSType
  latitude: number
  longitude: number
  height: number
  displayheight: number
}

export enum FriendlyState {
  COMPUTED = 0,
  COMPUTING = 1,
  CONVERGENCE_FAULT = 2,
  CONVERGENCE_FAIL = 3,
}

export type AttitudeStatus = {
  roll: number
  pitch: number
  yaw: number
}

export type PositionNotification = {
  position: {
    /** these two are there but shouldn't be used */
    // ins: Position // was moving the map
    // gps: Position
    map: Position // move the map
    attitude: AttitudeStatus
  }
  timer?: {
    startrec: number
    fromzupt: number
  }
  satellites: {
    total: number
    GPS: number
    GLONASS: number
    BEIDOU: number
  }
  status: {
    almanac: 'VALID' | 'INVALID'
    gps: GPSStatus
    ins: INSStatus
    friendlystate: FriendlyState
    friendlydescription: string
    possiblesolution: string
  }
  insgpserror?: number /// ???
  heading?: number // ???
  pitch?: number // ???
  speed?: number // ???
  accuracy: {
    latitude: number
    longitude: number
    height: number // RTK H
    value: number // RTK V
    class: number // RTK Accuracy (0 = good, 1 = average, 2 = bad)
  }
  rtkenabled: boolean
  rtk?: {
    rtkcorrectionreceived: boolean
    rtkstatus: 'RTK fixed' | ''
    internetconnected: boolean
    ageofcorrections: number
    rtkserviceconnected: boolean
  }
  gdop: number
}

export type PositionSatellitesResponse = {
  satellites: string[]
}

export type AntennaSettings = {
  enabled: boolean
  leverarm?: LeverArm
  uncertainty?: LeverArm
}

export type Get2ndAntennaSettingsResponse = AntennaSettings & {}
export type Update2ndAntennaSettingsPayload = AntennaSettings & {}
export type Update2ndAntennaSettingsResponse = AntennaSettings & {}

export enum MapNavigationMode {
  NONE = 'NONE',
  FOLLOW = 'FOLLOW',
}

export enum MapPanningMode {
  LOCKED = 'LOCKED',
  FREE = 'FREE',
}

export enum ViewMode {
  MAP = 'MAP',
  CAMERA = 'CAMERA',
}

// IMU STATUS ???
// RTK Correction received ???
// RTK Status ???
// Internet connected ???
// Age of corrections ???
// RTL service connectec ???

// Position Status
// export type PositionNotificationsResponse = {
//   notifications: PositionNotification[]
// }
