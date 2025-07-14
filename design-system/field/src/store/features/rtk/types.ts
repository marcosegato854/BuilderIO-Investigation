/**
 * TYPES
 */

import { ActionError } from 'store/features/actions/types'

export type RtkServer = {
  name?: string
  server?: string
  user?: string
  password?: string
  port?: string
  mountpoint?: string
  interfacemode?: string
  connected?: boolean
  enable?: boolean
  temporary?: boolean
  id?: number
}

export type RtkTestInfo = {
  internetconnection: boolean
  ntripconnection: boolean
  state: string
  precision2d: string
  precisionheight: string
  satellites: {
    [key: string]: number
  }
  hdop: string
  vdop: string
  gdop: string
  agecorrection: string
  position: {
    latitude: string
    longitude: string
    height?: string
  }
}
export type RtkAction = {
  status: string
  progress: number
  description: string
  errors?: ActionError[]
}
export type RtkInterfaceMode = {
  name: string
  interfacemode: string
}[]
export type RtkMountpoint = {
  name: string
  interfacemode: string
}

// Rtk Interface modes
export type RtkServiceInterfaceModesResponse = {
  ntripsupportedinterfacemode: string[]
}
// Rtk Servers
export type RtkServiceServersResponse = {
  servers: RtkServer[]
}
// Rtk Server Authenticate
export type RtkServiceServerAuthenticateRequest = RtkServer & {}
export type RtkServiceServerAuthenticateResponse = {
  action: RtkAction
}
// Rtk Info
export type RtkServiceGetInfoResponse = {
  enable: boolean
  server: string
}
// Rtk Mountpoints
export type RtkServiceLoadMountpointsResponse = {
  action: RtkAction
  result?: {
    mountpoints: RtkMountpoint[]
  }
}
export type RtkServiceGetMountpointsResponse = RtkMountpoint[]
// Rtk Server Submit
export type RtkServiceServerSubmitRequest = RtkServer & {}
export type RtkServiceServerSubmitResponse = RtkServer & {}
// Rtk Server Update
export type RtkServiceServerUpdateRequest = {
  server: RtkServer
  id: number
}
export type RtkServiceServerUpdateResponse = RtkServer & {}
// Rtk Server Delete
export type RtkServiceServerDeleteRequest = RtkServer & {}
export type RtkServiceServerDeleteResponse = RtkServer & {}
// Rtk Server Test
export type RtkServiceServerTestRequest = RtkServer & {}
export type RtkServiceServerTestResponse = {
  action?: RtkAction
  result?: RtkTestInfo
}

// Close dialog
type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>
export type RtkCloseDialogPayload = {
  job?: AtLeast<IJob, 'ntrip'>
  canAbortActivation?: boolean
  skipRTK?: boolean
}

export type RtkServerError = {
  code: string
  description?: string
}
