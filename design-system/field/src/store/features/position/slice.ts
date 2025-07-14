import { combineReducers } from 'redux'
import { createSelector } from 'reselect'
import {
  AntennaSettings,
  Get2ndAntennaSettingsResponse,
  MapNavigationMode,
  MapPanningMode,
  PositionNotification,
  PositionSatellitesResponse,
  Update2ndAntennaSettingsPayload,
  Update2ndAntennaSettingsResponse,
  ViewMode,
} from 'store/features/position/types'
import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
} from 'typesafe-actions'
import { MapMode, MapView } from 'utils/myVR/types'
import { AnyObject } from 'yup/lib/object'

/**
 * ACTIONS
 */
export const positionSatellitesActions = createAsyncAction(
  'positionService/SATELLITES_REQUEST',
  'positionService/SATELLITES_SUCCESS',
  'positionService/SATELLITES_FAILURE'
)<undefined, PositionSatellitesResponse, undefined>()

export const positionGet2ndAntennaSettingsActions = createAsyncAction(
  'positionService/GET_2ND_ANTENNA_SETTINGS_REQUEST',
  'positionService/GET_2ND_ANTENNA_SETTINGS_SUCCESS',
  'positionService/GET_2ND_ANTENNA_SETTINGS_FAILURE'
)<undefined, Get2ndAntennaSettingsResponse, undefined>()

export const positionUpdate2ndAntennaSettingsActions = createAsyncAction(
  'positionService/UPDATE_2ND_ANTENNA_SETTINGS_REQUEST',
  'positionService/UPDATE_2ND_ANTENNA_SETTINGS_SUCCESS',
  'positionService/UPDATE_2ND_ANTENNA_SETTINGS_FAILURE'
)<
  Update2ndAntennaSettingsPayload,
  Update2ndAntennaSettingsResponse,
  undefined
>()

export const statusSubscribeAction = createAction(
  'positionService/STATUS_SUBSCRIBE'
)()
export const statusUnsubscribeAction = createAction(
  'positionService/STATUS_UNSUBSCRIBE'
)()
export const positionMessageAction = createAction(
  'positionService/STATUS_POSITION_MESSAGE'
)<PositionNotification>()
export const mapNavigationModeAction = createAction(
  'positionService/MAP_NAVIGATION_MODE'
)<MapNavigationMode>()
export const mapPanningModeAction = createAction(
  'positionService/MAP_PANNING_MODE'
)<MapPanningMode>()
export const cameraViewZoomAction = createAction(
  'positionService/CAMERA_VIEW_ZOOM'
)<number>()
export const cameraHeightAction = createAction(
  'positionService/CAMERA_HEIGHT'
)<number>()
export const viewModeAction = createAction(
  'positionService/VIEW_MODE'
)<ViewMode>()
export const pointcloudActiveAction = createAction(
  'positionService/POINTCLOUD_ACTIVE'
)<boolean>()
export const planTracksVisibleAction = createAction(
  'positionService/PLAN_TRACKS_VISIBLE'
)<boolean>()
export const positionSocketConnectionAction = createAction(
  'positionService/POSITION_SOCKET_CONNECTION'
)<boolean>()
export const mapModeAction = createAction('positionService/MAP_MODE')<MapMode>()
export const mapViewAction = createAction('positionService/MAP_VIEW')<MapView>()
export const resetUserViewAction = createAction(
  'positionService/RESET_USER_VIEW'
)()
export const resetSecondAntennaAction = createAction(
  'positionService/RESET_SECOND_ANTENNA'
)<undefined>()
export const tilesCopyrightAction = createAction(
  'positionService/TILES_COPYRIGHT'
)<CopyrightInfo | CopyrighItemV3 | null>()

const actions = {
  positionMessageAction,
  statusSubscribeAction,
  statusUnsubscribeAction,
  positionSatellitesActions,
  positionGet2ndAntennaSettingsActions,
  positionUpdate2ndAntennaSettingsActions,
  mapNavigationModeAction,
  mapPanningModeAction,
  viewModeAction,
  pointcloudActiveAction,
  planTracksVisibleAction,
  cameraViewZoomAction,
  cameraHeightAction,
  positionSocketConnectionAction,
  mapModeAction,
  mapViewAction,
  resetUserViewAction,
  resetSecondAntennaAction,
  tilesCopyrightAction,
}
export type PositionAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type PositionServiceState = Readonly<{
  positionState: PositionNotification | null
  supportedSatellites: string[]
  navigationMode: MapNavigationMode
  panningMode: MapPanningMode
  viewMode: ViewMode
  pointcloudActive: boolean
  planTracksVisible: boolean
  cameraZoom: number
  positionSocketConnected: boolean
  mapMode: MapMode
  mapView: MapView
  cameraHeight: number
  antenna2: AntennaSettings
  tilesCopyright: CopyrightInfo | CopyrighItemV3 | null
}>

const initialState: PositionServiceState = {
  positionState: null,
  supportedSatellites: [],
  navigationMode: MapNavigationMode.NONE,
  panningMode: MapPanningMode.LOCKED,
  viewMode: ViewMode.MAP,
  pointcloudActive: true,
  planTracksVisible: true,
  cameraZoom: 0,
  cameraHeight: 200,
  positionSocketConnected: false,
  mapMode: MapMode.MAP_2D,
  mapView: MapView.THEME,
  antenna2: {
    enabled: false,
  },
  tilesCopyright: null,
}

const positionState = createReducer(initialState.positionState).handleAction(
  positionMessageAction,
  (prevState: PositionNotification | null, { payload }) => payload
)

const tilesCopyright = createReducer(initialState.tilesCopyright).handleAction(
  tilesCopyrightAction,
  (prevState: CopyrightInfo | CopyrighItemV3 | null, { payload }) => payload
)

const positionSocketConnected = createReducer(
  initialState.positionSocketConnected
).handleAction(
  positionSocketConnectionAction,
  (prevState: boolean, { payload }) => payload
)
// .handleAction(systemStateActions.failure, () => null)

const pointcloudActive = createReducer(initialState.pointcloudActive)
  .handleAction(
    pointcloudActiveAction,
    (prevState: boolean, { payload }) => payload
  )
  .handleAction(resetUserViewAction, () => initialState.pointcloudActive)
// .handleAction(systemStateActions.failure, () => null)

const planTracksVisible = createReducer(initialState.planTracksVisible)
  .handleAction(
    planTracksVisibleAction,
    (prevState: boolean, { payload }) => payload
  )
  .handleAction(resetUserViewAction, () => initialState.planTracksVisible)
// .handleAction(systemStateActions.failure, () => null)

const viewMode = createReducer(initialState.viewMode)
  .handleAction(viewModeAction, (prevState: ViewMode, { payload }) => payload)
  .handleAction(resetUserViewAction, () => initialState.viewMode)

const antenna2 = createReducer(initialState.antenna2)
  .handleAction(
    [
      positionGet2ndAntennaSettingsActions.success,
      positionUpdate2ndAntennaSettingsActions.success,
    ],
    (prevState: AntennaSettings | null, { payload }) => payload
  )
  .handleAction(
    [
      positionGet2ndAntennaSettingsActions.failure,
      positionUpdate2ndAntennaSettingsActions.failure,
      resetSecondAntennaAction,
    ],
    () => initialState.antenna2
  )

const supportedSatellites = createReducer(initialState.supportedSatellites)
  .handleAction(
    positionSatellitesActions.success,
    (prevState: string[], { payload }) => payload.satellites
  )
  .handleAction(
    positionSatellitesActions.failure,
    () => initialState.supportedSatellites
  )

const navigationMode = createReducer(initialState.navigationMode)
  .handleAction(
    mapNavigationModeAction,
    (prevState: MapNavigationMode, { payload }) => payload
  )
  .handleAction(resetUserViewAction, () => initialState.navigationMode)

const panningMode = createReducer(initialState.panningMode)
  .handleAction(
    mapPanningModeAction,
    (prevState: MapPanningMode, { payload }) => payload
  )
  .handleAction(resetUserViewAction, () => initialState.panningMode)

const cameraZoom = createReducer(initialState.cameraZoom)
  .handleAction(cameraViewZoomAction, (prevState: number, { payload }) =>
    Math.max(Math.min(payload, 50), 0)
  )
  .handleAction(resetUserViewAction, () => initialState.cameraZoom)

const cameraHeight = createReducer(initialState.cameraHeight)
  .handleAction(cameraHeightAction, (prevState: number, { payload }) => payload)
  .handleAction(resetUserViewAction, () => initialState.cameraHeight)

const mapMode = createReducer(initialState.mapMode)
  .handleAction(mapModeAction, (prevState: MapMode, { payload }) => payload)
  .handleAction(resetUserViewAction, () => initialState.mapMode)

const mapView = createReducer(initialState.mapView)
  .handleAction(mapViewAction, (prevState: MapView, { payload }) => payload)
  .handleAction(resetUserViewAction, () => initialState.mapView)

export const positionServiceReducer = combineReducers({
  positionState,
  supportedSatellites,
  navigationMode,
  panningMode,
  viewMode,
  pointcloudActive,
  planTracksVisible,
  cameraZoom,
  cameraHeight,
  positionSocketConnected,
  mapMode,
  mapView,
  antenna2,
  tilesCopyright,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      positionService: PositionServiceState
    }
  | AnyObject
export const selectPositionServiceState = (
  state: OptimizedRootState
): PositionServiceState => state.positionService

export const selectViewMode = (state: OptimizedRootState) =>
  selectPositionServiceState(state).viewMode

export const selectPosition = (state: OptimizedRootState) =>
  selectPositionServiceState(state).positionState

export const selectNavigationMode = (state: OptimizedRootState) =>
  selectPositionServiceState(state).navigationMode

export const selectPanningMode = (state: OptimizedRootState) =>
  selectPositionServiceState(state).panningMode

export const selectCameraZoom = (state: OptimizedRootState) =>
  selectPositionServiceState(state).cameraZoom

export const selectCameraHeight = (state: OptimizedRootState) =>
  selectPositionServiceState(state).cameraHeight

export const selectSupportedSatellites = (state: OptimizedRootState) =>
  selectPositionServiceState(state).supportedSatellites

export const selectPointcloudActive = (state: OptimizedRootState) =>
  selectPositionServiceState(state).pointcloudActive

export const selectPlanTracksVisible = createSelector(
  selectPositionServiceState,
  (data) => data.planTracksVisible
)

export const selectMapMode = (state: OptimizedRootState) =>
  selectPositionServiceState(state).mapMode

export const selectMapView = (state: OptimizedRootState) =>
  selectPositionServiceState(state).mapView

export const select2ndAntenna = (state: OptimizedRootState) =>
  selectPositionServiceState(state).antenna2

export const selectPositionSocketConnected = (state: OptimizedRootState) =>
  selectPositionServiceState(state).positionSocketConnected

export const selectTilesCopyright = (state: OptimizedRootState) =>
  selectPositionServiceState(state).tilesCopyright
