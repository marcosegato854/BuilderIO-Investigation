import { combineReducers } from 'redux'
import { resetStoreAction } from 'store/features/global/slice'
import {
  BufferObj,
  PointBufferSettings,
  PointCloudHspcListResponse,
  PointCloudNotification,
} from 'store/features/pointcloud/types'
import { modulesActions } from 'store/features/system/slice'
import { ModuleID } from 'store/features/system/types'
import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
} from 'typesafe-actions'
import { AnyObject } from 'yup/lib/object'

/**
 * ACTIONS
 */
// export const pointCloudStateActions = createAsyncAction(
//   'pointCloudService/STATE_REQUEST',
//   'pointCloudService/STATE_SUCCESS',
//   'pointCloudService/STATE_FAILURE'
// )<undefined, PointCloudStateResponse, undefined>()

export const pointCloudSubscribeAction = createAction(
  'pointCloudService/POINTCLOUD_SUBSCRIBE'
)()
export const pointCloudUnsubscribeAction = createAction(
  'pointCloudService/POINTCLOUD_UNSUBSCRIBE'
)()
export const pointCloudMessageAction = createAction(
  'pointCloudService/POINTCLOUD_MESSAGE'
)<PointCloudNotification>()
export const pointCloudConnected = createAction(
  'pointCloudService/POINTCLOUD_CONNECTED'
)<boolean>()
export const pointCloudProjectionAction = createAction(
  'pointCloudService/POINTCLOUD_PROJECTION'
)<string | null>()
export const pointCloudProj4Action = createAction(
  'pointCloudService/POINTCLOUD_PROJ4'
)<string | null>()
export const pointCloudBufferSettinsAction = createAction(
  'pointCloudService/POINTCLOUD_BUFFER_SETTINGS'
)<PointBufferSettings | null>()
export const pointCloudHspcListAction = createAsyncAction(
  'pointCloudService/HSPC_LIST_REQUEST',
  'pointCloudService/HSPC_LIST_SUCCESS',
  'pointCloudService/HSPC_LIST_FAILURE'
)<undefined, PointCloudHspcListResponse, undefined>()

/**
 * SET THE POINTCLOUD THICKNESS
 */
export const pointCloudThicknessSetAction = createAction(
  'pointCloudService/POINTCLOUD_SET_THICKNESS'
)<number>()

const actions = {
  pointCloudMessageAction,
  pointCloudSubscribeAction,
  pointCloudUnsubscribeAction,
  pointCloudConnected,
  pointCloudProjectionAction,
  pointCloudProj4Action,
  pointCloudThicknessSetAction,
  pointCloudBufferSettinsAction,
  pointCloudHspcListAction,
}
export type PointCloudAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type PointCloudServiceState = Readonly<{
  connected: boolean
  projection: string | null
  proj4: string | null
  notification: PointCloudNotification | null
  thickness: number
  bufferSettings: PointBufferSettings | null
  hspcList: string[]
  bufferList: BufferObj[]
  moduleEnabled: boolean | null
}>

const initialState: PointCloudServiceState = {
  connected: false,
  projection: null,
  proj4: null,
  notification: null,
  thickness: 2,
  bufferSettings: null,
  hspcList: [],
  bufferList: [],
  moduleEnabled: null,
}

const moduleEnabled = createReducer(initialState.moduleEnabled).handleAction(
  modulesActions.success,
  (prevState: boolean | null, { payload }) => {
    return payload.modules.includes(ModuleID.POINTCLOUD)
  }
)

const connected = createReducer(initialState.connected)
  .handleAction(
    pointCloudConnected,
    (prevState: boolean, { payload }) => payload
  )
  .handleAction(resetStoreAction, () => initialState.connected)

const projection = createReducer(initialState.projection).handleAction(
  pointCloudProjectionAction,
  (prevState: string | null, { payload }) => payload
)

const proj4 = createReducer(initialState.proj4).handleAction(
  pointCloudProj4Action,
  (prevState: string | null, { payload }) => payload
)

const bufferSettings = createReducer(initialState.bufferSettings).handleAction(
  pointCloudBufferSettinsAction,
  (prevState: PointBufferSettings | null, { payload }) =>
    payload || initialState.bufferSettings
)

const notification = createReducer(initialState.notification).handleAction(
  pointCloudMessageAction,
  (prevState: PointCloudNotification | null, { payload }) => payload
)

const thickness = createReducer(initialState.thickness).handleAction(
  pointCloudThicknessSetAction,
  (prevState: number, { payload }) => payload
)

const hspcList = createReducer(initialState.hspcList)
  .handleAction(
    pointCloudHspcListAction.success,
    (prevState: string[], { payload }) => {
      return payload.tree || initialState.hspcList
    }
  )
  .handleAction(resetStoreAction, () => initialState.hspcList)

const bufferList = createReducer(initialState.bufferList)
  .handleAction(
    pointCloudHspcListAction.success,
    (prevState: BufferObj[], { payload }) => {
      return payload.buffer || initialState.bufferList
    }
  )
  .handleAction(resetStoreAction, () => initialState.bufferList)

export const pointCloudServiceReducer = combineReducers({
  moduleEnabled,
  connected,
  projection,
  proj4,
  notification,
  thickness,
  bufferSettings,
  hspcList,
  bufferList,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      pointCloudService: PointCloudServiceState
    }
  | AnyObject

export const selectPointCloudServiceState = (
  state: OptimizedRootState
): PointCloudServiceState => state.pointCloudService

export const selectPointcloudModule = (state: OptimizedRootState) =>
  selectPointCloudServiceState(state).moduleEnabled

export const selectPointCloudConnected = (state: OptimizedRootState) =>
  selectPointCloudServiceState(state).connected

export const selectPointCloudProjection = (state: OptimizedRootState) =>
  selectPointCloudServiceState(state).projection

export const selectPointCloudProj4 = (state: OptimizedRootState) =>
  selectPointCloudServiceState(state).proj4

export const selectBufferSettings = (state: OptimizedRootState) =>
  selectPointCloudServiceState(state).bufferSettings

export const selectNotification = (state: OptimizedRootState) =>
  selectPointCloudServiceState(state).notification

export const selectPointCloudThickness = (state: OptimizedRootState) =>
  selectPointCloudServiceState(state).thickness

export const selectHspcList = (state: OptimizedRootState) =>
  selectPointCloudServiceState(state).hspcList

export const selectBufferList = (state: OptimizedRootState) =>
  selectPointCloudServiceState(state).bufferList
