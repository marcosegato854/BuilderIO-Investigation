import { append, filter, mergeDeepRight, update } from 'ramda'
import { combineReducers } from 'redux'
import {
  Needed,
  Polygon,
  UpdatePathSettingsPayload,
} from 'store/features/planning/types'
import {
  ConfirmAbortAutocapturePayload,
  HeremapsAction,
  isDirection,
  isSpeechDirection,
  ReorderUncoveredPathsPayload,
  AutocaptureCurrentPathResponse,
  RoutingStatusResponse,
  AutocaptureNeededResponse,
  AutocaptureNotification,
  AutocaptureNotificationType,
  AutocapturePolygonsResponse,
  RoutingPolylineResponse,
  RoutingSocketNotification,
  AutocaptureUpdatePolygonsRequest,
  AutocaptureUpdatePolygonsResponse,
  RoutingStatus,
  AutocaptureStatusResponse,
  AutocaptureStatus,
  AutocaptureStatusUpdateRequest,
  AutocapturePolygonsEnabledType,
  ReorderUncoveredInternalPathsPayload,
  AutocaptureTrackListRequest,
} from 'store/features/routing/types'
import { displayableAutocaptureNotifications } from 'store/features/system/notifications/notificationCodes'
import { modulesActions } from 'store/features/system/slice'
import { ModuleID } from 'store/features/system/types'
import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
} from 'typesafe-actions'
import {
  complete,
  coveredPolygon,
  polygonPaths,
  settings,
  uncoveredPolygon,
  withNewInternalSettings,
  withNewPaths,
  withNewSettings,
} from 'utils/planning/polygonHelpers'
import { move } from 'utils/ramda'
import { AnyObject } from 'yup/lib/object'
import { createSelector } from 'reselect'

/**
 * ACTIONS
 */
export const autocaptureStatusActions = createAsyncAction(
  'routingService/AUTOCAPTURE_STATUS_REQUEST',
  'routingService/AUTOCAPTURE_STATUS_SUCCESS',
  'routingService/AUTOCAPTURE_STATUS_FAILURE'
)<undefined, AutocaptureStatusResponse, undefined>()
export const autocaptureStatusUpdateActions = createAsyncAction(
  'routingService/AUTOCAPTURE_STATUS_UPDATE_REQUEST',
  'routingService/AUTOCAPTURE_STATUS_UPDATE_SUCCESS',
  'routingService/AUTOCAPTURE_STATUS_UPDATE_FAILURE'
)<AutocaptureStatusUpdateRequest, AutocaptureStatusResponse, undefined>()
export const autocaptureNeededActions = createAsyncAction(
  'routingService/AUTOCAPTURE_NEEDED_REQUEST',
  'routingService/AUTOCAPTURE_NEEDED_SUCCESS',
  'routingService/AUTOCAPTURE_NEEDED_FAILURE'
)<undefined, AutocaptureNeededResponse, undefined>()
export const autocaptureCurrentPathActions = createAsyncAction(
  'routingService/CURRENT_PATH_REQUEST',
  'routingService/CURRENT_PATH_SUCCESS',
  'routingService/CURRENT_PATH_FAILURE'
)<undefined, AutocaptureCurrentPathResponse, undefined>()
export const routingStatusActions = createAsyncAction(
  'routingService/ROUTING_STATUS_REQUEST',
  'routingService/ROUTING_STATUS_SUCCESS',
  'routingService/ROUTING_STATUS_FAILURE'
)<undefined, RoutingStatusResponse, undefined>()
export const routingPolylineActions = createAsyncAction(
  'routingService/POLYLINE_REQUEST',
  'routingService/POLYLINE_SUCCESS',
  'routingService/POLYLINE_FAILURE'
)<undefined, RoutingPolylineResponse, undefined>()
export const autocapturePolygonsActions = createAsyncAction(
  'routingService/POLYGONS_REQUEST',
  'routingService/POLYGONS_SUCCESS',
  'routingService/POLYGONS_FAILURE'
)<undefined, AutocapturePolygonsResponse, undefined>()
export const autocaptureUpdatePolygonsActions = createAsyncAction(
  'routingService/UPDATE_POLYGONS_REQUEST',
  'routingService/UPDATE_POLYGONS_SUCCESS',
  'routingService/UPDATE_POLYGONS_FAILURE'
)<
  AutocaptureUpdatePolygonsRequest,
  AutocaptureUpdatePolygonsResponse,
  undefined
>()
export const autocaptureAbortActions = createAsyncAction(
  'routingService/AUTOCAPTURE_ABORT_REQUEST',
  'routingService/AUTOCAPTURE_ABORT_SUCCESS',
  'routingService/AUTOCAPTURE_ABORT_FAILURE'
)<undefined, undefined, undefined>()
export const autocaptureTrackListActions = createAsyncAction(
  'routingService/TRACK_LIST_REQUEST',
  'routingService/TRACK_LIST_SUCCESS',
  'routingService/TRACK_LIST_FAILURE'
)<AutocaptureTrackListRequest, AutocapturePolygonsResponse, undefined>()

// prettier-ignore
export const routingSubscribeAction = createAction('routingService/ROUTING_SUBSCRIBE')()
// prettier-ignore
export const routingUnsubscribeAction = createAction('routingService/ROUTING_UNSUBSCRIBE')()
// prettier-ignore
export const routingMessageAction = createAction('routingService/ROUTING_MESSAGE')<RoutingSocketNotification>()
// prettier-ignore
export const routingSocketConnectionAction = createAction('routingService/ROUTING_SOCKET_CONNECTION')<boolean>()

// prettier-ignore
export const reorderUncoveredPathsAction = createAction('routingService/REORDER_UNCOVERED_PATHS')<ReorderUncoveredPathsPayload>()
// prettier-ignore
export const reorderUncoveredInternalPathsAction = createAction('routingService/REORDER_UNCOVERED_INTERNAL_PATHS')<ReorderUncoveredInternalPathsPayload>()
// prettier-ignore
export const updateUncoveredPathSettingsAction = createAction('routingService/UPDATE_UNCOVERED_PATH_SETTINGS')<Polygon>()
// prettier-ignore
export const updateUncoveredInternalPathSettingsAction = createAction('routingService/UPDATE_UNCOVERED_INTERNAL_PATH_SETTINGS')<UpdatePathSettingsPayload>()
// prettier-ignore
export const resetRoutingAction = createAction('routingService/RESET_ROUTING')()
// prettier-ignore
export const confirmAbortAutocaptureAction = createAction('routingService/CONFIRM_ABORT')<ConfirmAbortAutocapturePayload>()
// prettier-ignore
export const routingDirectionsEnabledAction = createAction('routingService/ROUTING_DIRECTIONS_ENABLED')<boolean>()
// prettier-ignore
export const autocapturePolygonsEnabledAction = createAction('routingService/AUTOCAPTURE_POLYGONS_ENABLED')<AutocapturePolygonsEnabledType>()
export const trackIdSelectedAction = createAction(
  'routingService/TRACK_ID_SELECTED'
)<number>()

const actions = {
  autocaptureStatusActions,
  autocaptureStatusUpdateActions,
  autocaptureNeededActions,
  autocaptureCurrentPathActions,
  autocapturePolygonsActions,
  autocaptureAbortActions,
  autocaptureUpdatePolygonsActions,
  reorderUncoveredPathsAction,
  reorderUncoveredInternalPathsAction,
  updateUncoveredPathSettingsAction,
  updateUncoveredInternalPathSettingsAction,
  confirmAbortAutocaptureAction,
  routingStatusActions,
  routingPolylineActions,
  routingMessageAction,
  routingSubscribeAction,
  routingUnsubscribeAction,
  routingSocketConnectionAction,
  resetRoutingAction,
  routingDirectionsEnabledAction,
  autocapturePolygonsEnabledAction,
  autocaptureTrackListActions,
  trackIdSelectedAction,
}
export type RoutingAction = ActionType<typeof actions>

const restoredUncoveredPolygon = (uncovered: Polygon, original: Polygon) => {
  if (uncovered.paths.length === original.paths.length) return uncovered
  const completedPaths = original.paths.filter((p) => p.completed === 100) || []
  return {
    ...uncovered,
    paths: [...uncovered.paths, ...completedPaths],
  }
}

/**
 * REDUCERS
 */
type RoutingServiceState = Readonly<{
  autocaptureStatus: AutocaptureStatus
  autocapturePolygons: Polygon[]
  autocaptureCurrentPolygon: Polygon | null
  autocaptureNeeded: Needed | null
  routingState: HeremapsAction | null
  routingSocketConnected: boolean
  routingPolyline: Polygon | null
  routingStatus: RoutingStatus
  autocaptureNotifications: AutocaptureNotification[]
  routingSpeechDirection: HeremapsAction | null
  routingDirectionsEnabled: boolean
  moduleEnabled: boolean | null
  autocapturePolygonsEnabled: AutocapturePolygonsEnabledType
  trackIdSelected: number
}>

const initialState: RoutingServiceState = {
  autocaptureStatus: { enabled: false },
  autocaptureCurrentPolygon: null,
  autocapturePolygons: [],
  autocaptureNeeded: null,
  autocaptureNotifications: [],
  routingState: null,
  routingSocketConnected: false,
  routingPolyline: null,
  routingStatus: {
    enabled: false,
    initial: false,
    final: false,
  },
  routingSpeechDirection: null,
  routingDirectionsEnabled: true,
  moduleEnabled: null,
  autocapturePolygonsEnabled: AutocapturePolygonsEnabledType.NOTCAPTURED,
  trackIdSelected: -1,
}

const autocaptureStatus = createReducer(initialState.autocaptureStatus)
  .handleAction(
    autocaptureStatusActions.success,
    (prevState: AutocaptureStatus | null, { payload }) => {
      return payload
    }
  )
  // .handleAction(
  //   routingEnabledActions.failure,
  //   () => initialState.routingEnabled
  // )
  .handleAction(
    autocaptureAbortActions.success,
    (prevState: AutocaptureStatus) => {
      return mergeDeepRight(prevState, { enabled: false })
    }
  )
  .handleAction(resetRoutingAction, () => initialState.routingStatus)

const routingStatus = createReducer(initialState.routingStatus)
  .handleAction(
    routingStatusActions.success,
    (prevState: RoutingStatus | null, { payload }) => {
      return payload
    }
  )
  // .handleAction(
  //   routingEnabledActions.failure,
  //   () => initialState.routingEnabled
  // )
  .handleAction(autocaptureAbortActions.success, (prevState: RoutingStatus) => {
    return mergeDeepRight(prevState, { enabled: false })
  })
  .handleAction(resetRoutingAction, () => initialState.routingStatus)

const moduleEnabled = createReducer(initialState.moduleEnabled).handleAction(
  modulesActions.success,
  (prevState: boolean | null, { payload }) => {
    return payload.modules.includes(ModuleID.ROUTING)
  }
)

const autocaptureNeeded = createReducer(initialState.autocaptureNeeded)
  .handleAction(
    autocaptureNeededActions.success,
    (prevState: Needed | null, { payload }) => payload
  )
  .handleAction(
    [
      autocaptureNeededActions.failure,
      autocaptureAbortActions.success,
      resetRoutingAction,
    ],
    () => initialState.autocaptureNeeded
  )

const routingState = createReducer(initialState.routingState)
  .handleAction(
    routingMessageAction,
    (prevState: HeremapsAction | null, { payload }) => {
      if (isDirection(payload)) return payload.data || null
      return prevState
    }
  )
  .handleAction(
    [routingStatusActions.failure, autocaptureAbortActions.success],
    () => initialState.routingState
  )
  .handleAction(resetRoutingAction, () => initialState.routingState)

const routingSocketConnected = createReducer(
  initialState.routingSocketConnected
).handleAction(
  routingSocketConnectionAction,
  (prevState: boolean, { payload }) => payload
)

const autocaptureCurrentPolygon = createReducer(
  initialState.autocaptureCurrentPolygon
)
  .handleAction(
    autocaptureCurrentPathActions.success,
    (prevState: Polygon | null, { payload }) =>
      payload.polygons[0] ? { ...payload.polygons[0], isPolygon: false } : null
  )
  .handleAction(autocaptureCurrentPathActions.failure, () => null)
  .handleAction(
    resetRoutingAction,
    () => initialState.autocaptureCurrentPolygon
  )

const routingPolyline = createReducer(initialState.routingPolyline)
  .handleAction(
    routingPolylineActions.success,
    (prevState: Polygon | null, { payload }) =>
      payload.polygons[0] || initialState.routingPolyline
  )
  .handleAction(
    routingPolylineActions.failure,
    () => initialState.routingPolyline
  )
  // .handleAction(
  //   [routingPolygonsActions.success, routingUpdatePolygonsActions.success],
  //   (prevState: Polygon | null, { payload }) => {
  //     const uncovered = payload.polygons?.filter((t) => !complete(t))
  //     return uncovered?.length > 0 ? prevState : initialState.routingPolyline
  //   }
  // )
  .handleAction(resetRoutingAction, () => initialState.routingPolyline)

const autocapturePolygons = createReducer(initialState.autocapturePolygons)
  .handleAction(
    [
      autocapturePolygonsActions.success,
      autocaptureUpdatePolygonsActions.success,
      autocaptureTrackListActions.success,
    ],
    (prevState: Polygon[] | null, { payload }) =>
      payload.polygons || initialState.autocapturePolygons
  )
  .handleAction(
    reorderUncoveredPathsAction,
    (prevState: Polygon[], { payload }) => {
      const covered = prevState.filter((t) => complete(t))
      const uncovered = prevState.filter((t) => !complete(t))
      return [
        ...covered,
        ...move(payload.fromIndex, payload.toIndex, uncovered),
      ]
    }
  )
  .handleAction(
    reorderUncoveredInternalPathsAction,
    (prevState: Polygon[], { payload }) => {
      const covered = prevState.filter((t) => complete(t))
      const uncovered = prevState
        .map((t) => uncoveredPolygon(t))
        .filter(Boolean) as Polygon[]
      const restoredUncovered = prevState.filter((t) => !complete(t))
      /** this method uses the array index because it works
       * both for acquisition and planning
       * (in the planning we are not sure of the id)
       * In the planning "restoreUncovered" should be the full array
       */
      const polygonIndex = restoredUncovered.findIndex((t) => {
        const tempPolygonId = t.id || t.temp_id
        return tempPolygonId === payload.polygonId
      })
      /** create a copy of the "original" polygon */
      const originalPolygon = { ...restoredUncovered[polygonIndex] }
      const selectedPolygon = { ...uncovered[polygonIndex] }
      const updatedInternalPaths = move(
        payload.fromIndex,
        payload.toIndex,
        polygonPaths(selectedPolygon)
      )
      /** create an updated version */
      const updatedPolygon = withNewPaths(selectedPolygon, updatedInternalPaths)
      /** add the old paths at the end, to avoid BE conflicts */
      const restoredPolygon = restoredUncoveredPolygon(
        updatedPolygon,
        originalPolygon
      )

      return [
        ...covered,
        ...update(polygonIndex, restoredPolygon, restoredUncovered),
      ]
    }
  )
  .handleAction(
    updateUncoveredPathSettingsAction,
    (prevState: Polygon[], { payload }) => {
      if (!payload.paths) return prevState
      const polygonIndex = prevState.findIndex((t) => {
        const tempPolygonId = t.temp_id || t.id
        const payloadPolygonId = payload.temp_id || payload.id
        return tempPolygonId === payloadPolygonId
      })
      if (polygonIndex < 0) return prevState
      const selectedPolygon = { ...prevState[polygonIndex] }
      const updatedPolygon = withNewSettings(selectedPolygon, settings(payload))
      return update(polygonIndex, updatedPolygon, prevState)
    }
  )
  .handleAction(
    updateUncoveredInternalPathSettingsAction,
    (prevState: Polygon[], { payload }) => {
      const payloadPolygonId = payload.polygonId
      const polygonIndex = prevState.findIndex((t) => {
        const tempPolygonId = t.temp_id || t.id
        return tempPolygonId === payloadPolygonId
      })
      const selectedPolygon = { ...prevState[polygonIndex] }
      const oldInternalPaths = polygonPaths(selectedPolygon)
      if (!oldInternalPaths) return prevState
      const internalPathIndex = oldInternalPaths.findIndex(
        (gp) => gp.id === payload.path.id
      )
      if (internalPathIndex < 0) return prevState
      const updatedInternalPaths = update(
        internalPathIndex,
        withNewInternalSettings(payload.path, payload.settings),
        oldInternalPaths
      )
      const updatedPolygon = withNewPaths(selectedPolygon, updatedInternalPaths)
      return update(polygonIndex, updatedPolygon, prevState)
    }
  )
  // .handleAction(
  //   routingCurrentPathActions.failure,
  //   () => initialState.routingPolygons
  // )
  .handleAction(resetRoutingAction, () => initialState.autocapturePolygons)

const autocaptureNotifications = createReducer(
  initialState.autocaptureNotifications
)
  .handleAction(
    routingMessageAction,
    (prevState: AutocaptureNotification[], { payload }) => {
      if (isDirection(payload) || isSpeechDirection(payload)) return prevState
      const { type, code, description } = payload.data
      console.info(
        `[AUTOCAPTURE] command type:${type} code: ${code} description: ${description}`
      )
      // remove
      if (type === AutocaptureNotificationType.REMOVE)
        return filter((m) => m.code !== code, prevState)
      // display
      const isDisplayable =
        displayableAutocaptureNotifications.includes(code) ||
        [
          AutocaptureNotificationType.WARNING,
          AutocaptureNotificationType.ERROR,
        ].includes(type)
      if (isDisplayable) {
        // update or append
        const foundIndex = prevState.findIndex((n) => n.code === code)
        if (foundIndex >= 0) {
          return update(foundIndex, payload.data, prevState)
        }
        return append(payload.data, prevState)
      }
      // do nothing
      return prevState
    }
  )
  .handleAction(
    [autocaptureStatusActions.failure, autocaptureAbortActions.success],
    () => initialState.autocaptureNotifications
  )
  .handleAction(resetRoutingAction, () => initialState.autocaptureNotifications)

const routingSpeechDirection = createReducer(
  initialState.routingSpeechDirection
)
  .handleAction(
    routingMessageAction,
    (prevState: HeremapsAction | null, { payload }) => {
      if (isSpeechDirection(payload)) return payload.data || null
      return prevState
    }
  )
  .handleAction(
    [routingStatusActions.failure, autocaptureAbortActions.success],
    () => initialState.routingSpeechDirection
  )
  .handleAction(resetRoutingAction, () => initialState.routingSpeechDirection)

const routingDirectionsEnabled = createReducer(
  initialState.routingDirectionsEnabled
)
  .handleAction(
    routingDirectionsEnabledAction,
    (prevState: boolean, { payload }) => payload
  )
  .handleAction(autocaptureAbortActions.success, () => false)

const autocapturePolygonsEnabled = createReducer(
  initialState.autocapturePolygonsEnabled
)
  .handleAction(
    autocapturePolygonsEnabledAction,
    (prevState: AutocapturePolygonsEnabledType, { payload }) => payload
  )
  .handleAction(
    resetRoutingAction,
    () => initialState.autocapturePolygonsEnabled
  )

const trackIdSelected = createReducer(initialState.trackIdSelected)
  .handleAction(
    trackIdSelectedAction,
    (prevState: number, { payload }) => payload
  )
  .handleAction(resetRoutingAction, () => initialState.trackIdSelected)

export const routingServiceReducer = combineReducers({
  autocaptureStatus,
  autocapturePolygons,
  autocaptureNeeded,
  autocaptureCurrentPolygon,
  routingState,
  routingStatus,
  routingSocketConnected,
  routingPolyline,
  autocaptureNotifications,
  routingSpeechDirection,
  routingDirectionsEnabled,
  moduleEnabled,
  autocapturePolygonsEnabled,
  trackIdSelected,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      routingService: RoutingServiceState
    }
  | AnyObject
export const selectRoutingServiceState = (
  state: OptimizedRootState
): RoutingServiceState => state.routingService

export const selectRouting = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).routingState

export const selectRoutingEnabled = (state: OptimizedRootState) => {
  const { routingStatus, moduleEnabled: hasModule } =
    selectRoutingServiceState(state)
  return routingStatus?.enabled && hasModule
}

export const selectAutocaptureEnabled = (state: OptimizedRootState) => {
  const { autocaptureStatus, moduleEnabled: hasModule } =
    selectRoutingServiceState(state)
  return autocaptureStatus?.enabled && hasModule
}

export const selectAutocaptureStatus = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).autocaptureStatus

export const selectRoutingStatus = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).routingStatus

export const selectRoutingModule = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).moduleEnabled

export const selectAutocaptureNeeded = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).autocaptureNeeded

export const selectCurrentPolygon = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).autocaptureCurrentPolygon

export const selectPolyline = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).routingPolyline

export const selectAutocapturePolygons = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).autocapturePolygons

export const selectCoveredPolygons = createSelector(
  [selectAutocapturePolygons],
  (autocapturePolygons) =>
    autocapturePolygons
      .map((t) => coveredPolygon(t))
      .filter(Boolean) as Polygon[]
)

export const selectUncoveredPolygons = createSelector(
  [selectAutocapturePolygons],
  (autocapturePolygons) =>
    autocapturePolygons
      .map((t) => uncoveredPolygon(t))
      .filter(Boolean) as Polygon[]
)

/** restored are used to communiacate withe the backend while updating order or options */
export const selectRestoredCoveredPolygons = createSelector(
  [selectAutocapturePolygons],
  (autocapturePolygons) => autocapturePolygons.filter((t) => complete(t))
)

export const selectRestoredUncoveredPolygons = createSelector(
  [selectAutocapturePolygons],
  (autocapturePolygons) => autocapturePolygons.filter((t) => !complete(t))
)

export const selectAutocaptureNotifications = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).autocaptureNotifications

export const selectRoutingSocketConnected = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).routingSocketConnected

export const selectSpeechRouting = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).routingSpeechDirection

export const selectRoutingDirectionsEnabled = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).routingDirectionsEnabled

export const selectOutOfTrackEnabled = (state: OptimizedRootState) => {
  const { autocaptureNotifications } = selectRoutingServiceState(state)
  return !!autocaptureNotifications.find((n) => n.code === 'STT-002')
}

export const selectAutocapturePolygonsEnabled = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).autocapturePolygonsEnabled

export const selectTrackIdSelected = (state: OptimizedRootState) =>
  selectRoutingServiceState(state).trackIdSelected
