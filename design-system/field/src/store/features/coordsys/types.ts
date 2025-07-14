import { ActionError, ActionStatus } from 'store/features/actions/types'

export enum Wkt {
  MISSING = 'missing',
  LOADED = 'loaded',
}

export type CoordinateSystemFile = {
  path: string
  filename: string
  lastEditDate?: string
}

export type CoordinateSystem = {
  name: string
  transformation: string
  ellipsoid: string
  projection: string
  geoidModel: string
  cscsModel: string
  wkt: Wkt
  canDelete: boolean
}

type CoordinateSytemAction = {
  status: ActionStatus
  progress: number
  description: string
  errors?: ActionError[]
}

export type CurrentCoordinateSystem = {
  name: string
  isAutomatic: boolean
}

export type CoordinateSystemWktFile = {
  wkt: string
}

export type CoordinateSystemGetRequest = {
  name: string
}

export type CoordinateSystemWktGetRequest = CoordinateSystemGetRequest
export type CoordinateSystemWktDeleteRequest = CoordinateSystemGetRequest

export type CoordinateSystemGetResponse = CoordinateSystem
export type CoordinateSystemDeleteRequest = CoordinateSystemGetRequest
export type CoordinateSystemDeleteResponse = {}

export type CoordinateSystemListSystemsResponse = {
  action: CoordinateSytemAction
  result?: {
    files: CoordinateSystemFile[]
  }
}

export type CoordinateSystemImportSystemRequest = {
  path: string
  filename: string
}

export type CoordinateSystemImportSystemResponse = {
  action: CoordinateSytemAction
  result: CoordinateSystem
}

export type CoordinateSystemWktResponse = CoordinateSystemWktFile
export type CoordinateSystemWktDeleteResponse = {}

export type CoordinateSystemWktListResponse =
  CoordinateSystemListSystemsResponse

export type CoordinateSystemWktImportRequest =
  CoordinateSystemImportSystemRequest & CoordinateSystemGetRequest
export type CoordinateSystemWktImportResponse = {
  action: CoordinateSytemAction
  result?: CoordinateSystemWktFile
}
export type CoordinateSystemWktImportInfoRequest = CoordinateSystemGetRequest

export type CoordinateSystemLastImported = {
  name: string
}
