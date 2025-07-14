import { combineReducers } from 'redux'
import { createSelector } from 'reselect'
import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
} from 'typesafe-actions'
import { resetStoreAction } from 'store/features/global/slice'
import {
  RtkServiceInterfaceModesResponse,
  RtkServiceServersResponse,
  RtkServiceGetInfoResponse,
  RtkServiceServerAuthenticateRequest,
  RtkServiceServerAuthenticateResponse,
  RtkServer,
  RtkServiceLoadMountpointsResponse,
  RtkServiceGetMountpointsResponse,
  RtkServiceServerSubmitRequest,
  RtkServiceServerSubmitResponse,
  RtkServiceServerDeleteRequest,
  RtkServiceServerDeleteResponse,
  RtkServiceServerUpdateRequest,
  RtkServiceServerUpdateResponse,
  RtkServiceServerTestRequest,
  RtkServiceServerTestResponse,
  RtkCloseDialogPayload,
  RtkMountpoint,
  RtkTestInfo,
  RtkServerError,
} from 'store/features/rtk/types'
import { AnyObject } from 'yup/lib/types'

/**
 * TYPES
 */

/**
 * ACTIONS
 */
export const rtkServiceInterfaceModesActions = createAsyncAction(
  'rtkService/INTERFACE_MODES_REQUEST',
  'rtkService/INTERFACE_MODES_SUCCESS',
  'rtkService/INTERFACE_MODES_FAILURE'
)<undefined, RtkServiceInterfaceModesResponse, undefined>()

export const rtkServiceServersActions = createAsyncAction(
  'rtkService/SERVERS_REQUEST',
  'rtkService/SERVERS_SUCCESS',
  'rtkService/SERVERS_FAILURE'
)<undefined, RtkServiceServersResponse, undefined>()

export const rtkServiceInfoActions = createAsyncAction(
  'rtkService/INFO_REQUEST',
  'rtkService/INFO_SUCCESS',
  'rtkService/INFO_FAILURE'
)<undefined, RtkServiceGetInfoResponse, undefined>()

export const rtkServiceAuthenticateServerActions = createAsyncAction(
  'rtkService/SERVER_AUTHENTICATE_REQUEST',
  'rtkService/SERVER_AUTHENTICATE_SUCCESS',
  'rtkService/SERVER_AUTHENTICATE_FAILURE'
)<
  RtkServiceServerAuthenticateRequest,
  RtkServiceServerAuthenticateResponse,
  undefined
>()

export const rtkServiceSetCurrentServer = createAction(
  'rtkService/SET_CURRENT_SERVER'
)<RtkServer | null>()

export const rtkServiceLoadMountpointsAction = createAction(
  'rtkService/LOAD_MOUNTPOINTS_SUCCESS'
)<RtkServiceLoadMountpointsResponse>()

export const rtkServiceResetCurrentServerConnection = createAction(
  'rtkService/RESET_CURRENT_SERVER_CONNECTION'
)()

export const rtkServiceGetMountpointsAction = createAction(
  'rtkService/GET_MOUNTPOINTS_SUCCESS'
)<RtkServiceGetMountpointsResponse>()

export const rtkServiceSubmitServerActions = createAsyncAction(
  'rtkService/SERVER_SUBMIT_REQUEST',
  'rtkService/SERVER_SUBMIT_SUCCESS',
  'rtkService/SERVER_SUBMIT_FAILURE'
)<RtkServiceServerSubmitRequest, RtkServiceServerSubmitResponse, undefined>()

export const rtkServiceDeleteServerActions = createAsyncAction(
  'rtkService/SERVER_DELETE_REQUEST',
  'rtkService/SERVER_DELETE_SUCCESS',
  'rtkService/SERVER_DELETE_FAILURE'
)<RtkServiceServerDeleteRequest, RtkServiceServerDeleteResponse, undefined>()

export const rtkServiceUpdateServerActions = createAsyncAction(
  'rtkService/SERVER_UPDATE_REQUEST',
  'rtkService/SERVER_UPDATE_SUCCESS',
  'rtkService/SERVER_UPDATE_FAILURE'
)<RtkServiceServerUpdateRequest, RtkServiceServerUpdateResponse, undefined>()

export const rtkServiceTestServerActions = createAsyncAction(
  'rtkService/SERVER_TEST_REQUEST',
  'rtkService/SERVER_TEST_SUCCESS',
  'rtkService/SERVER_TEST_FAILURE'
)<RtkServiceServerTestRequest, RtkServiceServerTestResponse, undefined>()

export const rtkServiceCloseDialog = createAction(
  'rtkService/CLOSE_DIALOG'
)<RtkCloseDialogPayload>()

export const rtkServiceServerError = createAction(
  'rtkService/SERVER_ERROR'
)<RtkServerError | null>()

const actions = {
  rtkServiceInfoActions,
  rtkServiceServersActions,
  rtkServiceInterfaceModesActions,
  rtkServiceAuthenticateServerActions,
  rtkServiceSetCurrentServer,
  rtkServiceLoadMountpointsAction,
  rtkServiceGetMountpointsAction,
  rtkServiceSubmitServerActions,
  rtkServiceUpdateServerActions,
  rtkServiceDeleteServerActions,
  rtkServiceTestServerActions,
  rtkServiceResetCurrentServerConnection,
  rtkServiceServerError,
}
export type RtkServiceAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type RtkState = Readonly<{
  isAuthenticating: boolean
  interfaceModes: string[]
  mountpoints: RtkMountpoint[]
  mountpointsActionProgress: number
  testActionProgress: number
  currentServer: RtkServer | null
  servers: RtkServer[] | null
  testInfo: RtkTestInfo | null
  info: RtkServiceGetInfoResponse | null
  serverError: RtkServerError | null
}>

const initialState: RtkState = {
  isAuthenticating: false,
  interfaceModes: [],
  mountpoints: [],
  mountpointsActionProgress: 0,
  testActionProgress: 0,
  currentServer: null,
  servers: null,
  testInfo: null,
  info: null,
  serverError: null,
}

const isAuthenticating = createReducer(initialState.isAuthenticating)
  .handleAction([rtkServiceAuthenticateServerActions.request], () => true)
  .handleAction(
    [
      rtkServiceResetCurrentServerConnection,
      rtkServiceGetMountpointsAction,
      rtkServiceAuthenticateServerActions.failure,
      rtkServiceTestServerActions.failure,
    ],
    () => false
  )
  .handleAction(resetStoreAction, () => initialState.isAuthenticating)

const interfaceModes = createReducer(initialState.interfaceModes)
  .handleAction(
    rtkServiceInterfaceModesActions.success,
    (prevState: string[], { payload }) => payload.ntripsupportedinterfacemode
  )
  .handleAction(resetStoreAction, () => initialState.interfaceModes)
// .handleAction(rtkInterfaceModesActions.failure, () => null)

const currentServer = createReducer(initialState.currentServer)
  .handleAction(
    rtkServiceSetCurrentServer,
    (prevState: RtkServer | null, { payload }) => payload
  )
  .handleAction(
    rtkServiceAuthenticateServerActions.failure,
    (prevState: RtkServer | null) =>
      prevState
        ? { ...prevState, connected: false }
        : initialState.currentServer
  )
  .handleAction(
    rtkServiceResetCurrentServerConnection,
    (prevState: RtkServer | null) => ({
      ...prevState!,
      connected: false,
      mountpoint: initialState.currentServer?.mountpoint,
      interfacemode: initialState.currentServer?.interfacemode,
    })
  )
  .handleAction(resetStoreAction, () => initialState.currentServer)
// .handleAction(rtkInterfaceModesActions.failure, () => null)

const servers = createReducer(initialState.servers)
  .handleAction(resetStoreAction, () => initialState.servers)
  .handleAction(
    rtkServiceServersActions.success,
    (prevState: RtkServer[] | null, { payload }) => payload.servers
  )
// .handleAction(rtkInterfaceModesActions.failure, () => null)

const mountpointsActionProgress = createReducer(
  initialState.mountpointsActionProgress
)
  .handleAction(
    rtkServiceLoadMountpointsAction,
    (prevState: number, { payload }) => payload.action.progress || prevState
  )
  .handleAction(
    rtkServiceResetCurrentServerConnection,
    (prevState: number) => initialState.mountpointsActionProgress
  )
  .handleAction(
    rtkServiceAuthenticateServerActions.failure,
    (prevState: number) => initialState.mountpointsActionProgress
  )
  .handleAction(resetStoreAction, () => initialState.mountpointsActionProgress)
// .handleAction(rtkInterfaceModesActions.failure, () => null)

const testActionProgress = createReducer(initialState.testActionProgress)
  .handleAction(
    rtkServiceTestServerActions.success,
    (prevState: number, { payload }) => payload.action!.progress || prevState
  )
  .handleAction(
    [
      rtkServiceTestServerActions.failure,
      rtkServiceAuthenticateServerActions.failure,
    ],
    (prevState: number) => initialState.testActionProgress
  )
  .handleAction(resetStoreAction, () => initialState.testActionProgress)
// .handleAction(rtkInterfaceModesActions.failure, () => null)

const mountpoints = createReducer(initialState.mountpoints)
  .handleAction(
    rtkServiceGetMountpointsAction,
    (prevState: RtkMountpoint[], { payload }) => payload
  )
  .handleAction(
    [
      rtkServiceAuthenticateServerActions.failure,
      rtkServiceResetCurrentServerConnection,
    ],
    (prevState: RtkMountpoint[]) => initialState.mountpoints
  )
  .handleAction(
    rtkServiceSetCurrentServer,
    (prevState: RtkMountpoint[], { payload }) =>
      payload?.connected ? prevState : initialState.mountpoints
  )
  .handleAction(resetStoreAction, () => initialState.mountpoints)
// .handleAction(rtkInterfaceModesActions.failure, () => null)

const testInfo = createReducer(initialState.testInfo)
  .handleAction(
    rtkServiceTestServerActions.success,
    (prevState: RtkTestInfo | null, { payload }) => payload.result || null
  )
  .handleAction(
    [
      rtkServiceAuthenticateServerActions.request,
      rtkServiceResetCurrentServerConnection,
    ],
    () => null
  )
  .handleAction(
    [
      rtkServiceTestServerActions.failure,
      rtkServiceAuthenticateServerActions.failure,
    ],
    () => null
  )
  .handleAction(resetStoreAction, () => initialState.testInfo)
// .handleAction(rtkInterfaceModesActions.failure, () => null)

const info = createReducer(initialState.info)
  .handleAction(
    rtkServiceInfoActions.success,
    (prevState: RtkServiceGetInfoResponse | null, { payload }) => payload
  )
  .handleAction(
    [
      rtkServiceTestServerActions.failure,
      rtkServiceAuthenticateServerActions.failure,
      rtkServiceInfoActions.failure,
    ],
    () => null
  )

const serverError = createReducer(initialState.serverError)
  .handleAction(
    rtkServiceServerError,
    (prevState: RtkServerError | null, { payload }) => payload
  )
  .handleAction(
    rtkServiceResetCurrentServerConnection,
    (prevState: RtkServerError | null) => initialState.serverError
  )

export const rtkServiceReducer = combineReducers({
  isAuthenticating,
  interfaceModes,
  mountpoints,
  mountpointsActionProgress,
  testActionProgress,
  currentServer,
  servers,
  testInfo,
  info,
  serverError,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      rtkService: RtkState
    }
  | AnyObject
export const selectRtkState = (state: OptimizedRootState): RtkState =>
  state.rtkService

export const selectRtkInfo = createSelector(selectRtkState, (data) => data.info)

export const selectRtkServers = createSelector(
  selectRtkState,
  (data) => data.servers
)

export const selectRtkInterfaceModes = createSelector(
  selectRtkState,
  (data) => data.interfaceModes
)

export const selectRtkMountpoints = createSelector(
  selectRtkState,
  (data) => data.mountpoints
)

export const selectRtkMountpointsActionProgress = createSelector(
  selectRtkState,
  (data) => data.mountpointsActionProgress
)

export const selectRtkTestActionProgress = createSelector(
  selectRtkState,
  (data) => data.testActionProgress
)

export const selectRtkCurrentServer = createSelector(
  selectRtkState,
  (data) => data.currentServer
)

export const selectRtkTestInfo = createSelector(
  selectRtkState,
  (data) => data.testInfo
)

export const selectRtkServerError = createSelector(
  selectRtkState,
  (data) => data.serverError
)

export const selectIsAuthenticating = (state: OptimizedRootState) => {
  const progress = selectRtkState(state).mountpointsActionProgress
  return (
    selectRtkState(state).isAuthenticating || (progress !== 0 && progress < 100)
  )
}
