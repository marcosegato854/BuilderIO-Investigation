/**
 * TYPES
 * https://developer.here.com/documentation/routing-api/api-reference-swagger.html
 * https://router.hereapi.com/v8/routes?transportMode=car&origin=45.464203,9.189982&destination=46.545132,10.141400&return=polyline,turnbyturnactions&apiKey=BFqAWUmiFwzbKGHadj6tKiAkt-2SoyZ7swTq1GdoB7k
 */

import { Needed, Polygon } from 'store/features/planning/types'

export enum HeremapsActionType {
  DEPART = 'depart',
  ARRIVE = 'arrive',
  CONTINUE = 'continue',
  RAMP = 'ramp',
  EXIT = 'exit',
  ROUNDABOUT_PASS = 'roundaboutPass',
  ROUNDABOUT_ENTER = 'roundaboutEnter',
  ROUNDABOUT_EXIT = 'roundaboutExit',
  U_TURN = 'uTurn',
  TURN = 'turn',
  KEEP = 'keep',
}

export enum HeremapsDirection {
  LEFT = 'left',
  RIGHT = 'right',
  MIDDLE = 'middle',
}

export enum HeremapsSeverity {
  QUITE = 'quite',
  LIGHT = 'light',
}

export enum HeremapsRoadType {
  HIGHWAY = 'highway',
  RURAL = 'rural',
}

export type HeremapsRoad = {
  type?: HeremapsRoadType
  name: {
    value: string
    language: string
  }
}

export type HeremapsAction = {
  action: HeremapsActionType
  duration: number
  length: number
  offset: number
  instruction?: string
  direction?: HeremapsDirection
  severity?: HeremapsSeverity
  currentRoad?: HeremapsRoad
  nextRoad?: HeremapsRoad
  id: number
  priority?: number
}

export enum AutocaptureNotificationType {
  MESSAGE = 0,
  WARNING = 1,
  ERROR = 2,
  REMOVE = 3,
  TAG = 4,
}

export type AutocaptureNotification = {
  type: AutocaptureNotificationType
  description: string
  time?: string
  id?: number
  code: string
  p1?: string
  p2?: string
  p3?: string
}

export type RoutingMessage = {
  type: 'notification'
  data: AutocaptureNotification
}

export type RoutingDirection = {
  type: 'direction'
  data?: HeremapsAction
}

export type SpeechRoutingDirection = {
  type: 'speech'
  data?: HeremapsAction
}

export type RoutingSocketNotification =
  | RoutingMessage
  | RoutingDirection
  | SpeechRoutingDirection

export function isMessage(
  obj: RoutingMessage | RoutingDirection | SpeechRoutingDirection
): obj is RoutingMessage {
  return (obj as RoutingMessage).type === 'notification'
}

export function isDirection(
  obj: RoutingMessage | RoutingDirection | SpeechRoutingDirection
): obj is RoutingDirection {
  return (obj as RoutingDirection).type === 'direction'
}

export function isSpeechDirection(
  obj: RoutingMessage | RoutingDirection | SpeechRoutingDirection
): obj is SpeechRoutingDirection {
  return (obj as SpeechRoutingDirection).type === 'speech'
}

export enum RoutingDialog {}
export type AutocaptureCurrentPathResponse = {
  polygons: Polygon[]
}

export type RoutingPolylineResponse = {
  polygons: Polygon[]
}

export type AutocaptureStatus = {
  enabled: boolean
}
export type AutocaptureStatusUpdateRequest = AutocaptureStatus & {}
export type AutocaptureStatusResponse = AutocaptureStatus & {}

export type RoutingStatus = {
  enabled: boolean
  initial: boolean
  final: boolean
}
export type RoutingStatusResponse = RoutingStatus & {}

export type AutocaptureNeededResponse = Needed

export type AutocapturePolygonsResponse = {
  polygons: Polygon[]
}

export type ReorderUncoveredPathsPayload = {
  fromIndex: number
  toIndex: number
}

export type ReorderUncoveredInternalPathsPayload =
  ReorderUncoveredPathsPayload & {
    polygonId: number
  }

export type AutocaptureUpdatePolygonsRequest = {
  plan: {
    polygons: Polygon[]
  }
}

export type AutocaptureUpdatePolygonsResponse = AutocapturePolygonsResponse & {}

export type ConfirmAbortAutocapturePayload = {
  confirmCallback?: Function
}

export enum AutocapturePolygonsEnabledType {
  CAPTURED = 'captured',
  NOTCAPTURED = 'notCaptured',
}

export enum AutocaptureTrackListActionType {
  DISABLE = 0,
  FLIP = 1,
}

export enum AutocaptureTrackListEntityType {
  POLYGON = 0,
  TRACK = 1,
}

export type AutocaptureTrackListRequest = {
  action: AutocaptureTrackListActionType
  entity: AutocaptureTrackListEntityType
  id: number
}
