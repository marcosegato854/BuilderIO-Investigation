// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { DialogNames } from 'components/dialogs/dialogNames'
import { always, cond, DeepPartial, gte, mean, mergeDeepRight, T } from 'ramda'
import { call, put, select, takeLatest } from 'redux-saga/effects'
import { openDialogAction } from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import { selectUpdateSettings } from 'store/features/settings/slice'
import { UpdateSettings } from 'store/features/settings/types'
import api from 'store/features/system/api'
import {
  logError,
  logMessage,
  logWarning,
  modulesActions,
  systemCheckUpdateActions,
  systemInfoActions,
  systemNotificationsActions,
  systemReleaseTagActions,
  systemResponsivenessActions,
  systemStateActions,
  systemUpdateActionAbort,
  systemUpdateActionStart,
  systemUpdateInfoActions,
  systemUpdatePrepareActionInfo,
  systemUpdatePrepareActionStart,
  updateInfoActions,
} from 'store/features/system/slice'
import {
  CheckUpdateResponse,
  ConnectionStrenght,
  SystemInfoResponse,
  SystemLogType,
  SystemModulesResponse,
  SystemNotification,
  SystemNotificationsResponse,
  SystemResponsiveness,
  SystemResposivenessResponse,
  SystemStateResponse,
  UpdateActionResponse,
  UpdateInfoResponse,
  UpdatePrepareActionResponse,
} from 'store/features/system/types'
import { composeError, errorLogInfo, shortError } from 'utils/errors'
import { translateSystemNotification } from 'utils/notifications'
import { checkForDateValidity } from 'utils/time'
/**
 * SAGAS
 */
function* logErrorToBackend({ payload }: ReturnType<typeof logError>) {
  try {
    const message = errorLogInfo(payload)
    console.error(message)
    yield call(api.systemLog, {
      code: 'saga',
      message,
      type: SystemLogType.ERROR,
    })
  } catch (e) {
    console.error(e)
  }
}

function* logWarningToBackend({ payload }: ReturnType<typeof logWarning>) {
  try {
    console.warn(payload)
    yield call(api.systemLog, {
      code: 'saga',
      message: payload,
      type: SystemLogType.WARNING,
    })
  } catch (e) {
    console.error(e)
  }
}

function* logMessageToBackend({ payload }: ReturnType<typeof logMessage>) {
  try {
    console.info(payload)
    yield call(api.systemLog, {
      code: 'saga',
      message: payload,
      type: SystemLogType.MESSAGE,
    })
  } catch (e) {
    console.error(e)
  }
}

function* systemInfo() {
  try {
    const resp: AxiosResponse<SystemInfoResponse> = yield call(api.systemInfo)
    yield put(systemInfoActions.success(resp.data))
    console.info(`[SYSTEM] product: ${resp.data.product}`)
  } catch (e) {
    yield put(systemInfoActions.failure())
    yield put(errorAction(e))
  }
}

function* systemReleaseTag() {
  try {
    const resp: AxiosResponse<string> = yield call(api.systemReleaseTag)
    yield put(systemReleaseTagActions.success(resp.data))
  } catch (e) {
    yield put(systemReleaseTagActions.failure())
    yield put(errorAction(e))
  }
}

function* systemState() {
  try {
    const resp: AxiosResponse<SystemStateResponse> = yield call(api.systemState)
    yield put(systemStateActions.success(resp.data))
  } catch (e) {
    yield put(systemStateActions.failure())
    yield put(errorAction(e))
  }
}

function* getModules() {
  try {
    const resp: AxiosResponse<SystemModulesResponse> = yield call(
      api.activeModules
    )
    yield put(modulesActions.success(resp.data))
  } catch (e) {
    yield put(modulesActions.failure())
    yield put(errorAction(e))
  }
}

function* systemUpdateInfo({
  payload,
}: ReturnType<typeof systemUpdateInfoActions.request>) {
  try {
    const resp: AxiosResponse<SystemInfoResponse> = yield call(
      api.systemUpdateInfo,
      payload
    )
    yield put(systemUpdateInfoActions.success(resp.data))
    window.location.reload()
  } catch (e) {
    yield put(systemUpdateInfoActions.failure())
    yield put(errorAction(e))
  }
}

function* systemNotifications() {
  try {
    const resp: AxiosResponse<SystemNotificationsResponse> = yield call(
      api.systemNotifications
    )
    // translate all the descriptions
    const translatedNotifications: SystemNotification[] =
      resp.data.notifications.map((notification) =>
        translateSystemNotification(notification)
      )
    const data = {
      ...resp.data,
      notifications: translatedNotifications,
    }
    yield put(systemNotificationsActions.success(data))
  } catch (e) {
    yield put(systemNotificationsActions.failure())
    yield put(errorAction(e))
  }
}

function* updateInfo() {
  try {
    const resp: AxiosResponse<UpdateInfoResponse> = yield call(api.updateInfo)
    yield put(updateInfoActions.success(resp.data))
  } catch (e) {
    yield put(updateInfoActions.failure())
    yield put(errorAction(e))
  }
}

/**
 * real values during a mission, always responsive without errors:
 * min: 467
 * max: 1256
 */
const resolveClientConnectionStrength: (n: number) => ConnectionStrenght = cond(
  [
    [gte(500), always(4)], // 0-500
    [gte(800), always(3)], // 500-800
    [gte(1300), always(2)], // 800-1300
    [gte(2500), always(1)], // 1300-2500
    [T, always(0)], // > 2500
  ]
)

const fillResponsiveness = (
  responseDelay: number,
  incompleteResponsiveness: SystemResponsiveness
) => {
  const clientConnectionHealth = resolveClientConnectionStrength(responseDelay)
  const clientConnectionCritical = clientConnectionHealth < 2
  const connectionCritical =
    clientConnectionCritical ||
    incompleteResponsiveness.connection.internet?.critical ||
    incompleteResponsiveness.connection.gateway?.critical
  const connectionHealth = Math.round(
    mean([
      clientConnectionHealth,
      incompleteResponsiveness.connection.gateway?.health || 0,
      incompleteResponsiveness.connection.internet?.health || 0,
    ])
  )
  const systemHealth = Math.round(
    mean([
      incompleteResponsiveness.system.details?.cpu?.health || 0,
      incompleteResponsiveness.system.details?.gpu?.health || 0,
      incompleteResponsiveness.system.details?.ram?.health || 0,
    ])
  )
  const systemCritical = systemHealth < 30
  const integration: DeepPartial<SystemResponsiveness> = {
    system: {
      health: systemHealth,
      critical: systemCritical,
    },
    connection: {
      health: connectionHealth,
      critical: connectionCritical,
      client: {
        critical: clientConnectionCritical,
        health: clientConnectionHealth,
      },
    },
  }
  console.info(
    [
      '[RESPONSIVENESS] CLIENT',
      `delay: ${responseDelay}`,
      `health: ${clientConnectionHealth}`,
      `critical:${clientConnectionCritical}`,
    ].join(' ')
  )
  console.info(
    [
      '[RESPONSIVENESS] SYSTEM',
      `health: ${systemHealth}`,
      `critical:${systemCritical}`,
    ].join(' ')
  )
  return mergeDeepRight(
    incompleteResponsiveness,
    integration
  ) as SystemResponsiveness
}

function* systemResponsiveness() {
  try {
    const resp: AxiosResponse<SystemResposivenessResponse> = yield call(
      api.systemResponsiveness
    )
    // check speed from nodejs
    const requestStartedAt = new Date().getTime()
    yield call(api.systemClientSpeed)
    const requestEndedAt = new Date().getTime()
    const responseDelay = requestEndedAt - requestStartedAt
    //
    const fullResponsiveness = fillResponsiveness(responseDelay, resp.data)
    // console.info(
    //   '[RESPONSIVENESS]',
    //   `storage available: ${fullResponsiveness.storage.available}`,
    //   `battery minutes: ${fullResponsiveness.battery.minutes}`
    // )
    yield put(systemResponsivenessActions.success(fullResponsiveness))
  } catch (e) {
    yield put(systemResponsivenessActions.failure())
  }
}

function* updatePrepareActionStart() {
  try {
    const resp: AxiosResponse<UpdatePrepareActionResponse> = yield call(
      api.updatePrepareActionStart
    )
    if (resp.data.action.status === 'error') {
      yield put(systemUpdatePrepareActionStart.failure())
      yield put(
        errorAction(
          composeError('Update Prepare failed', resp.data.action.errors)
        )
      )
    } else {
      yield put(systemUpdatePrepareActionStart.success(resp.data))
    }
  } catch (e) {
    yield put(systemUpdatePrepareActionStart.failure())
    yield put(errorAction(e))
  }
}

function* updatePrepareActionInfo() {
  try {
    const resp: AxiosResponse<UpdatePrepareActionResponse> = yield call(
      api.updatePrepareActionInfo
    )
    if (resp.data.action.status === 'error') {
      yield put(systemUpdatePrepareActionInfo.failure())
      // no error display here, false negative
    } else {
      yield put(systemUpdatePrepareActionInfo.success(resp.data))
    }
  } catch (e) {
    yield put(systemUpdatePrepareActionInfo.failure())
    yield put(errorAction(e))
  }
}

function* updateActionStart() {
  try {
    const resp: AxiosResponse<UpdateActionResponse> = yield call(
      api.updateActionStart
    )
    if (resp.data.action.status === 'error') {
      yield put(systemUpdateActionStart.failure())
      yield put(
        errorAction(composeError('Update failed', resp.data.action.errors))
      )
    } else {
      yield put(systemUpdateActionStart.success(resp.data))
    }
  } catch (e) {
    yield put(systemUpdateActionStart.failure())
    yield put(errorAction(e))
  }
}

function* updateAbortAction() {
  try {
    console.warn('[UPDATE] user called and abort action')
    yield call(api.updateActionAbort)
    yield put(systemUpdateActionAbort.success())
  } catch (e) {
    yield put(systemUpdateActionAbort.failure())
    yield put(errorAction(e))
  }
}

/**
 * Checks if there is a new version available.
 * if the check is not user requested, we need to show a dialog
 * only if the version is newer than the current one
 * and the user has not disabled the notification for 7 days
 */
function* checkUpdate({
  payload,
}: ReturnType<typeof systemCheckUpdateActions.request>) {
  try {
    const resp: AxiosResponse<CheckUpdateResponse> = yield call(api.checkUpdate)
    yield put(systemCheckUpdateActions.success(resp.data))
    console.info(
      `[CHECK UPDATE] received last available version: ${resp.data.version}`
    )
    if (payload.userRequest) return
    // BE check if it's not a new version
    if (!resp.data.newUpdate) return
    // retrive user settings stored
    const userUpdateSettings: UpdateSettings = yield select(
      selectUpdateSettings
    )
    // if the user has disabled the notification for 7 days, we need to hide the dialog
    if (
      userUpdateSettings.checkDate &&
      !checkForDateValidity(userUpdateSettings.checkDate, 7) &&
      userUpdateSettings.hideUpdate
    )
      return
    // other cases: no date or date is older than 7 days or the user has not disabled the notification
    yield put(
      openDialogAction({
        component: DialogNames.UpdateAvailableDialog,
      })
    )
  } catch (e) {
    console.info(
      '[CHECK UPDATE] there was an error with myWorld: ',
      shortError(e)
    )
    yield put(systemCheckUpdateActions.failure())
    // yield put(errorAction(e))
  }
}

export function* systemBackendSaga() {
  yield takeLatest(modulesActions.request, getModules)
  yield takeLatest(systemInfoActions.request, systemInfo)
  yield takeLatest(systemStateActions.request, systemState)
  yield takeLatest(systemNotificationsActions.request, systemNotifications)
  yield takeLatest(systemResponsivenessActions.request, systemResponsiveness)
  yield takeLatest(systemUpdateInfoActions.request, systemUpdateInfo)
  yield takeLatest(systemReleaseTagActions.request, systemReleaseTag)
  yield takeLatest(updateInfoActions.request, updateInfo)
  yield takeLatest(
    systemUpdatePrepareActionStart.request,
    updatePrepareActionStart
  )
  yield takeLatest(
    systemUpdatePrepareActionInfo.request,
    updatePrepareActionInfo
  )
  yield takeLatest(systemUpdateActionStart.request, updateActionStart)
  yield takeLatest(systemUpdateActionAbort.request, updateAbortAction)
  yield takeLatest(logError, logErrorToBackend)
  yield takeLatest(logWarning, logWarningToBackend)
  yield takeLatest(logMessage, logMessageToBackend)
  yield takeLatest(systemCheckUpdateActions.request, checkUpdate)
}
