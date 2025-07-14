import { DeepPartial, mergeDeepRight } from 'ramda'
import { combineReducers } from 'redux'
import { select } from 'redux-saga/effects'
import { createSelector } from 'reselect'
import { closeAllDialogsAction } from 'store/features/dialogs/slice'
import { resetStoreAction } from 'store/features/global/slice'
import {
  activatedStates,
  CheckUpdate,
  CheckUpdateRequest,
  CheckUpdateResponse,
  ModuleID,
  NotificationsPosition,
  SystemInfo,
  SystemInfoResponse,
  SystemInfoUpdateRequest,
  SystemModulesResponse,
  SystemNotification,
  SystemNotificationPositionPayload,
  SystemNotificationsResponse,
  SystemNotificationType,
  SystemResponsiveness,
  SystemResposivenessResponse,
  SystemState,
  SystemStateResponse,
  UpdateAction,
  UpdateActionResponse,
  UpdateInfo,
  UpdateInfoResponse,
  UpdatePrepareAction,
  UpdatePrepareActionResponse,
} from 'store/features/system/types'
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
export const modulesActions = createAsyncAction(
  'systemService/MODULES_REQUEST',
  'systemService/MODULES_SUCCESS',
  'systemService/MODULES_FAILURE'
)<undefined, SystemModulesResponse, undefined>()

export const systemStateActions = createAsyncAction(
  'systemService/STATE_REQUEST',
  'systemService/STATE_SUCCESS',
  'systemService/STATE_FAILURE'
)<undefined, SystemStateResponse, undefined>()

export const systemInfoActions = createAsyncAction(
  'systemService/INFO_REQUEST',
  'systemService/INFO_SUCCESS',
  'systemService/INFO_FAILURE'
)<undefined, SystemInfoResponse, undefined>()

export const systemUpdateInfoActions = createAsyncAction(
  'systemService/INFO_UPDATE_REQUEST',
  'systemService/INFO_UPDATE_SUCCESS',
  'systemService/INFO_UPDATE_FAILURE'
)<SystemInfoUpdateRequest, SystemInfoResponse, undefined>()

export const systemNotificationsActions = createAsyncAction(
  'systemService/NOTIFICATIONS_REQUEST',
  'systemService/NOTIFICATIONS_SUCCESS',
  'systemService/NOTIFICATIONS_FAILURE'
)<undefined, SystemNotificationsResponse, undefined>()

export const systemResponsivenessActions = createAsyncAction(
  'systemService/RESPONSIVENESS_REQUEST',
  'systemService/RESPONSIVENESS_SUCCESS',
  'systemService/RESPONSIVENESS_FAILURE'
)<undefined, SystemResposivenessResponse, undefined>()

export const systemReleaseTagActions = createAsyncAction(
  'systemService/RELEASE_TAG_REQUEST',
  'systemService/RELEASE_TAG_SUCCESS',
  'systemService/RELEASE_TAG_FAILURE'
)<undefined, string, undefined>()

export const systemUpdatePrepareActionStart = createAsyncAction(
  'actionsService/SYSTEM_UPDATE_PREPARE_ACTION_START_REQUEST',
  'actionsService/SYSTEM_UPDATE_PREPARE_ACTION_START_SUCCESS',
  'actionsService/SYSTEM_UPDATE_PREPARE_ACTION_START_FAILURE'
)<undefined, UpdatePrepareActionResponse, undefined>()

export const systemUpdatePrepareActionInfo = createAsyncAction(
  'actionsService/SYSTEM_UPDATE_PREPARE_ACTION_INFO_REQUEST',
  'actionsService/SYSTEM_UPDATE_PREPARE_ACTION_INFO_SUCCESS',
  'actionsService/SYSTEM_UPDATE_PREPARE_ACTION_INFO_FAILURE'
)<undefined, UpdatePrepareActionResponse, undefined>()

// export const systemUpdatePrepareActionAbort = createAsyncAction(
//   'actionsService/SYSTEM_UPDATE_PREPARE_ACTION_REQUEST',
//   'actionsService/SYSTEM_UPDATE_PREPARE_ACTION_SUCCESS',
//   'actionsService/SYSTEM_UPDATE_PREPARE_ACTION_FAILURE'
// )<undefined, UpdatePrepareActionAbortResponse, undefined>()

export const updateInfoActions = createAsyncAction(
  'systemService/UPDATE_INFO_REQUEST',
  'systemService/UPDATE_INFO_SUCCESS',
  'systemService/UPDATE_INFO_FAILURE'
)<undefined, UpdateInfoResponse, undefined>()

export const systemUpdateActionStart = createAsyncAction(
  'actionsService/SYSTEM_UPDATE_ACTION_START_REQUEST',
  'actionsService/SYSTEM_UPDATE_ACTION_START_SUCCESS',
  'actionsService/SYSTEM_UPDATE_ACTION_START_FAILURE'
)<undefined, UpdateActionResponse, undefined>()

export const systemUpdateActionInfo = createAsyncAction(
  'actionsService/SYSTEM_UPDATE_ACTION_INFO_REQUEST',
  'actionsService/SYSTEM_UPDATE_ACTION_INFO_SUCCESS',
  'actionsService/SYSTEM_UPDATE_ACTION_INFO_FAILURE'
)<undefined, UpdateActionResponse, undefined>()

export const systemUpdateActionAbort = createAsyncAction(
  'actionsService/SYSTEM_UPDATE_ACTION_ABORT_REQUEST',
  'actionsService/SYSTEM_UPDATE_ACTION_ABORT_SUCCESS',
  'actionsService/SYSTEM_UPDATE_ACTION_ABORT_FAILURE'
)<undefined, undefined, undefined>()

export const systemCheckUpdateActions = createAsyncAction(
  'systemService/CHECK_UPDATE_REQUEST',
  'systemService/CHECK_UPDATE_SUCCESS',
  'systemService/CHECK_UPDATE_FAILURE'
)<CheckUpdateRequest, CheckUpdateResponse, undefined>()

export const stateSubscribeAction = createAction(
  'systemService/STATE_SUBSCRIBE'
)()
export const stateUnsubscribeAction = createAction(
  'systemService/STATE_UNSUBSCRIBE'
)()
export const stateMessageAction = createAction(
  'systemService/STATE_MESSAGE'
)<SystemState>()
export const stateSocketConnectionAction = createAction(
  'systemService/STATE_SOCKET_CONNECTION'
)<boolean>()

export const notificationsSubscribeAction = createAction(
  'systemService/NOTIFICATIONS_SUBSCRIBE'
)()
export const notificationsUnsubscribeAction = createAction(
  'systemService/NOTIFICATIONS_UNSUBSCRIBE'
)()
export const notificationMessageAction = createAction(
  'systemService/NOTIFICATIONS_MESSAGE'
)<SystemNotification>()
export const notificationRemovalAction = createAction(
  'systemService/NOTIFICATIONS_REMOVAL'
)<SystemNotification>()
export const notificationPositionAction = createAction(
  'systemService/NOTIFICATIONS_POSIITON'
)<SystemNotificationPositionPayload>()
export const resetNotificationsAction = createAction(
  'systemService/NOTIFICATIONS_RESET'
)()
export const notificationsSocketConnectionAction = createAction(
  'systemService/NOTIFICATIONS_SOCKET_CONNECTION'
)<boolean>()
export const logError = createAction('systemService/LOG_ERROR')<Error>()
export const logWarning = createAction('systemService/LOG_WARNING')<string>()
export const logMessage = createAction('systemService/LOG_MESSAGE')<string>()
export const hideInitializationAction = createAction(
  'systemService/HIDE_INITIALIZATION'
)<boolean>()
export const checkResponsivenessAction = createAction(
  'systemService/CHECK_RESPONSIVENESS'
)()
export const flushLogsAction = createAction(
  'systemService/FLUSH_LOGS'
)<boolean>()

const actions = {
  modulesActions,
  stateSubscribeAction,
  stateUnsubscribeAction,
  stateMessageAction,
  stateSocketConnectionAction,
  systemStateActions,
  systemInfoActions,
  systemUpdateInfoActions,
  systemNotificationsActions,
  notificationsSubscribeAction,
  notificationMessageAction,
  notificationsUnsubscribeAction,
  notificationPositionAction,
  notificationRemovalAction,
  systemResponsivenessActions,
  systemReleaseTagActions,
  resetNotificationsAction,
  notificationsSocketConnectionAction,
  logError,
  logWarning,
  logMessage,
  hideInitializationAction,
  checkResponsivenessAction,
  flushLogsAction,
  systemUpdatePrepareActionInfo,
  systemUpdatePrepareActionStart,
  // systemUpdatePrepareActionAbort,
  updateInfoActions,
  systemUpdateActionStart,
  systemUpdateActionInfo,
  systemUpdateActionAbort,
  systemCheckUpdateActions,
}
export type StateAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type SystemServiceState = Readonly<{
  systemState: SystemState | null
  info: SystemInfo | null
  notifications: SystemNotification[]
  realTimeNotifications: SystemNotification[]
  responsiveness: SystemResponsiveness | null
  notificationsSocketConnected: boolean
  stateSocketConnected: boolean
  initializationHidden: boolean
  modules: ModuleID[] | null
  releaseTag: string | null
  shouldFlushLogs: boolean
  updatePrepareStatus: UpdatePrepareAction | null
  updateInfo: UpdateInfo | null
  readyToUpdate: boolean
  updateStatus: UpdateAction | null
  checkUpdate: CheckUpdate | null
  checkUpdateError: boolean
}>

const initialState: SystemServiceState = {
  systemState: null,
  info: null,
  notifications: [],
  realTimeNotifications: [],
  responsiveness: null,
  notificationsSocketConnected: false,
  stateSocketConnected: false,
  initializationHidden: false,
  modules: null,
  releaseTag: null,
  shouldFlushLogs: false,
  updatePrepareStatus: null,
  updateInfo: null,
  readyToUpdate: false,
  updateStatus: null,
  checkUpdate: null,
  checkUpdateError: false,
}

const shouldFlushLogs = createReducer(initialState.shouldFlushLogs)
  .handleAction(flushLogsAction, (prevState: boolean, { payload }) => payload)
  .handleAction(resetStoreAction, () => initialState.shouldFlushLogs)

const releaseTag = createReducer(initialState.releaseTag)
  .handleAction(
    systemReleaseTagActions.success,
    (prevState: string | null, { payload }) => payload
  )
  .handleAction(resetStoreAction, () => initialState.releaseTag)

const modules = createReducer(initialState.modules)
  .handleAction(
    modulesActions.success,
    (prevState: ModuleID[] | null, { payload }) => payload.modules
  )
  .handleAction(resetStoreAction, () => initialState.modules)

const systemState = createReducer(initialState.systemState)
  .handleAction(
    [systemStateActions.success, stateMessageAction],
    (prevState: SystemState | null, { payload }) => payload
  )
  .handleAction(
    systemStateActions.failure,
    (prevState: SystemState | null) => initialState.systemState
  )
  .handleAction(resetStoreAction, () => initialState.systemState)
// .handleAction(systemStateActions.failure, () => null)

const notificationsSocketConnected = createReducer(
  initialState.notificationsSocketConnected
).handleAction(
  notificationsSocketConnectionAction,
  (prevState: boolean, { payload }) => payload
)
// .handleAction(systemStateActions.failure, () => null)

const stateSocketConnected = createReducer(
  initialState.stateSocketConnected
).handleAction(
  stateSocketConnectionAction,
  (prevState: boolean, { payload }) => payload
)
// .handleAction(systemStateActions.failure, () => null)

const initializationHidden = createReducer(
  initialState.initializationHidden
).handleAction(
  hideInitializationAction,
  (prevState: boolean, { payload }) => payload
)
// .handleAction(systemStateActions.failure, () => null)

const info = createReducer(initialState.info).handleAction(
  [systemInfoActions.success, systemUpdateInfoActions.success],
  (prevState: SystemInfo | null, { payload }) => payload
)
// .handleAction(systemInfoActions.failure, () => null)

const notifications = createReducer(initialState.notifications)
  .handleAction(
    systemNotificationsActions.success,
    (prevState: SystemNotification[] | null, { payload }) =>
      payload.notifications
  )
  .handleAction(
    notificationMessageAction,
    (prevState: SystemNotification[], { payload }) => {
      if (payload.type === SystemNotificationType.INTERNAL) return prevState
      return [...prevState, payload]
    }
  )
  .handleAction(
    notificationRemovalAction,
    (prevState: SystemNotification[], { payload }) => {
      return [...prevState, payload]
    }
  )
  .handleAction(resetNotificationsAction, () => initialState.notifications)
  .handleAction(resetStoreAction, () => initialState.notifications)

const realTimeNotifications = createReducer(initialState.realTimeNotifications)
  .handleAction(
    notificationMessageAction,
    (prevState: SystemNotification[], { payload }) => {
      if (payload.type === SystemNotificationType.INTERNAL) return prevState
      /** disabled PEF-1202 */
      // const foundIndex = prevState.findIndex((n) => n.code === payload.code)
      // if (foundIndex >= 0) return update(foundIndex, payload, prevState)
      return [...prevState, payload]
    }
  )
  .handleAction(
    notificationPositionAction,
    (
      prevState: SystemNotification[],
      { payload: { notification, position } }
    ) => {
      console.info(`[NOTIFICATIONS] move ${notification.code} to ${position}`)
      return prevState.map((n) => {
        if (n.code === notification.code)
          return mergeDeepRight(n, {
            displayAt: position,
          }) as SystemNotification
        return n
      })
    }
  )
  .handleAction(closeAllDialogsAction, (prevState: SystemNotification[]) => {
    return prevState.map((n) => {
      console.info(
        `[NOTIFICATIONS] move ${n.code} to ${NotificationsPosition.BOTTOM}`
      )
      if (n.type === SystemNotificationType.ERROR)
        return mergeDeepRight(n, {
          displayAt: NotificationsPosition.BOTTOM,
        }) as SystemNotification
      return n
    })
  })
  .handleAction(
    notificationRemovalAction,
    (prevState: SystemNotification[], { payload }) =>
      prevState.filter((notification) => notification.code !== payload.code)
  )
  // .handleAction(
  //   notificationsUnsubscribeAction,
  //   (prevState: SystemNotification[]) => initialState.realTimeNotifications
  // )
  .handleAction(
    resetNotificationsAction,
    () => initialState.realTimeNotifications
  )
  .handleAction(resetStoreAction, () => initialState.realTimeNotifications)

const responsiveness = createReducer(initialState.responsiveness)
  .handleAction(
    systemResponsivenessActions.success,
    (prevState: SystemResponsiveness | null, { payload }) => {
      return payload
    }
  )
  .handleAction(
    systemResponsivenessActions.failure,
    (prevState: SystemResponsiveness | null) => {
      const override: DeepPartial<SystemResponsiveness> = {
        system: {
          critical: true,
          health: 0,
          details: {
            cpu: {
              critical: true,
            },
            gpu: {
              critical: true,
            },
            ram: {
              critical: true,
            },
          },
        },
        connection: {
          critical: true,
          internet: {
            health: 0,
            critical: false,
          },
          gateway: {
            health: 0,
            critical: false,
          },
          client: {
            health: 0,
            critical: false,
          }
        },
        battery: undefined,
        storage: undefined,
        usersConnected: 0,
      }
      return prevState
        ? (mergeDeepRight(prevState, override) as SystemResponsiveness)
        : initialState.responsiveness
    }
  )
  .handleAction(resetStoreAction, () => initialState.responsiveness)

const updatePrepareStatus = createReducer(initialState.updatePrepareStatus)
  .handleAction(
    updateInfoActions.request,
    () => initialState.updatePrepareStatus
  )
  .handleAction(
    [
      systemUpdatePrepareActionStart.success,
      systemUpdatePrepareActionInfo.success,
    ],
    (prevState: UpdatePrepareAction | null, { payload }) => {
      return payload.action
    }
  )
  .handleAction(resetStoreAction, () => initialState.updatePrepareStatus)

const updateInfo = createReducer(initialState.updateInfo)
  .handleAction(
    updateInfoActions.success,
    (prevState: UpdateInfo | null, { payload }) => {
      return payload
    }
  )
  .handleAction(
    [updateInfoActions.request, updateInfoActions.failure],
    (prevState: UpdateInfo | null) => initialState.updateInfo
  )
  .handleAction(resetStoreAction, () => initialState.updateInfo)

const readyToUpdate = createReducer(initialState.readyToUpdate)
  .handleAction(
    systemUpdatePrepareActionInfo.success,
    (prevState: boolean, { payload }) =>
      payload.action.status === 'done' ? true : false
  )
  .handleAction(
    systemUpdateActionAbort.success,
    () => initialState.readyToUpdate
  )
  .handleAction(resetStoreAction, () => initialState.readyToUpdate)

const updateStatus = createReducer(initialState.updateStatus)
  .handleAction(
    [systemUpdateActionStart.success, systemUpdateActionInfo.success],
    (prevState: UpdateAction | null, { payload }) => {
      return payload.action
    }
  )
  .handleAction(
    systemUpdateActionAbort.success,
    () => initialState.updateStatus
  )
  .handleAction(resetStoreAction, () => initialState.updateStatus)

const checkUpdate = createReducer(initialState.checkUpdate)
  .handleAction(
    systemCheckUpdateActions.success,
    (prevState: CheckUpdate | null, { payload }) => payload
  )
  .handleAction(
    [systemCheckUpdateActions.request, systemCheckUpdateActions.failure],
    (prevState: CheckUpdate | null) => initialState.checkUpdate
  )
  .handleAction(resetStoreAction, () => initialState.checkUpdate)

const checkUpdateError = createReducer(initialState.checkUpdateError)
  .handleAction(systemCheckUpdateActions.failure, (prevState: boolean) => true)
  .handleAction(
    [systemCheckUpdateActions.request, systemCheckUpdateActions.success],
    (prevState: boolean, { payload }) => false
  )
  .handleAction(resetStoreAction, () => initialState.checkUpdateError)

export const systemServiceReducer = combineReducers({
  modules,
  systemState,
  info,
  notifications,
  realTimeNotifications,
  responsiveness,
  notificationsSocketConnected,
  stateSocketConnected,
  initializationHidden,
  releaseTag,
  shouldFlushLogs,
  updatePrepareStatus,
  updateInfo,
  readyToUpdate,
  updateStatus,
  checkUpdate,
  checkUpdateError,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      system: SystemServiceState
    }
  | AnyObject
export const selectSystemServiceState = (
  state: OptimizedRootState
): SystemServiceState => state.system

export const selectSystemState = (state: OptimizedRootState) =>
  selectSystemServiceState(state).systemState

export const selectClientReleaseTag = (state: OptimizedRootState) =>
  selectSystemServiceState(state).releaseTag

export const selectSystemIsActivated = createSelector(
  selectSystemState,
  (data) => {
    if (!data?.state) return false
    return activatedStates.includes(data.state)
  }
)

export const selectSystemInfo = (state: OptimizedRootState) =>
  selectSystemServiceState(state).info

export const selectBackendVersion = (state: OptimizedRootState) =>
  selectSystemInfo(state)?.softwareversion

export const selectSystemSerial = (state: OptimizedRootState) =>
  selectSystemInfo(state)?.serial

export const selectInitializationHidden = (state: OptimizedRootState) =>
  selectSystemServiceState(state)?.initializationHidden

export const selectSystemNotifications = (state: OptimizedRootState) =>
  selectSystemServiceState(state).notifications.filter(
    (n) => n.type !== SystemNotificationType.REMOVE
  )

export const selectRealTimeNotifications = (state: OptimizedRootState) =>
  selectSystemServiceState(state).realTimeNotifications.filter(
    (n) => n.type !== SystemNotificationType.REMOVE
  )

export const selectRealTimeErrors = (state: OptimizedRootState) =>
  selectSystemServiceState(state).realTimeNotifications.filter((n) =>
    [SystemNotificationType.ERROR, SystemNotificationType.WARNING].includes(
      n.type
    )
  )

export const selectResponsiveness = (state: OptimizedRootState) =>
  selectSystemServiceState(state).responsiveness

export const selectInternetIsActive = (state: OptimizedRootState) =>
  selectResponsiveness(state)?.connection?.internet?.health !== -1

export const selectStateSocketConnected = (state: OptimizedRootState) =>
  selectSystemServiceState(state).stateSocketConnected

export const selectNotificationsSocketConnected = (state: OptimizedRootState) =>
  selectSystemServiceState(state).notificationsSocketConnected

export const selectFlushLogs = (state: OptimizedRootState) =>
  selectSystemServiceState(state).shouldFlushLogs

export const selectUpdatePrepareStatus = (state: OptimizedRootState) =>
  selectSystemServiceState(state).updatePrepareStatus

export const selectUpdateInfo = (state: OptimizedRootState) =>
  selectSystemServiceState(state).updateInfo

export const selectReadyToUpdate = (state: OptimizedRootState) =>
  selectSystemServiceState(state).readyToUpdate

export const selectUpdateStatus = (state: OptimizedRootState) =>
  selectSystemServiceState(state).updateStatus

export const selectCheckUpdate = (state: OptimizedRootState) =>
  selectSystemServiceState(state).checkUpdate

export const selectCheckUpdateError = (state: OptimizedRootState) =>
  selectSystemServiceState(state).checkUpdateError
