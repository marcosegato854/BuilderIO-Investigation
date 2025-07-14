// eslint-disable-next-line import/no-extraneous-dependencies
import { put, select, takeLatest } from 'redux-saga/effects'
import { actionsServiceActivateSystemAction } from 'store/features/actions/slice'
import { selectIsAdmin } from 'store/features/auth/slice'
import {
  dataStorageJobDetailActions,
  selectDataStorageCurrentJob,
} from 'store/features/dataStorage/slice'
import {
  routingMessageAction,
  autocapturePolygonsActions,
  routingStatusActions,
  selectRoutingEnabled,
  selectAutocaptureEnabled,
} from 'store/features/routing/slice'
import {
  isDirection,
  isMessage,
  isSpeechDirection,
} from 'store/features/routing/types'
import {
  notificationMessageAction,
  notificationRemovalAction,
  resetNotificationsAction,
  updateInfoActions,
} from 'store/features/system/slice'
import { SystemNotificationType } from 'store/features/system/types'
import { translateAutocaptureNotification } from 'utils/notifications'

/**
 * SAGAS
 */
function* resetNotifications() {
  yield put(resetNotificationsAction())
}

function* updateRoutingStatusAtChange({
  payload,
}: ReturnType<typeof routingMessageAction>) {
  const autocaptureEnabled: boolean = yield select(selectAutocaptureEnabled)
  const routingEnabled: boolean = yield select(selectRoutingEnabled)
  if (!autocaptureEnabled) return
  if (!isMessage(payload)) return
  const { code } = payload.data
  if (code === 'ROU-001') {
    console.info('[NOTIFICATION] tracks update received, refresh list')
    yield put(autocapturePolygonsActions.request())
  }
  if (routingEnabled && code === 'ROU-003') {
    console.info('[ROUTING] alignment status update')
    yield put(routingStatusActions.request())
    // TODO: routing - do we have a different notification if autocapture changes?
  }
}

function* logRoutingNotification({
  payload,
}: ReturnType<typeof routingMessageAction>) {
  const isAdmin: boolean = yield select(selectIsAdmin)
  if (isDirection(payload) || isSpeechDirection(payload)) return
  const { description } = translateAutocaptureNotification(payload.data)
  console.info(
    `[MESSAGE_DISPLAYED] autocapture notification: ${description} - admin: ${isAdmin}`
  )
}

function* updateJobAtCameraAutomaticOrientation({
  payload,
}: ReturnType<typeof notificationMessageAction>) {
  const { code } = payload
  if (code === 'CAM-082') {
    console.info(
      '[NOTIFICATION] camera automatic orientation done, update the job'
    )
    const currentJob: IJob | null = yield select(selectDataStorageCurrentJob)
    if (currentJob) {
      yield put(dataStorageJobDetailActions.request(currentJob.name))
    } else {
      console.error(
        '[NOTIFICATION] job not found, cannot update camera orientation'
      )
    }
  }
}

function* logSystemNotifications({
  payload,
}: ReturnType<typeof notificationMessageAction>) {
  const isAdmin: boolean = yield select(selectIsAdmin)
  if (payload.type === SystemNotificationType.INTERNAL) return
  const { description } = payload
  console.info(
    `[MESSAGE_DISPLAYED] system notification: ${description} - admin: ${isAdmin}`
  )
}

function* refreshUpdateInfo({
  payload,
}: ReturnType<
  typeof notificationMessageAction | typeof notificationRemovalAction
>) {
  const { code } = payload
  if (code === 'UPD-001') {
    yield put(updateInfoActions.request())
  }
}

export function* systemNotificationsSaga() {
  yield takeLatest(routingMessageAction, updateRoutingStatusAtChange)
  yield takeLatest(routingMessageAction, logRoutingNotification)
  yield takeLatest(
    notificationMessageAction,
    updateJobAtCameraAutomaticOrientation
  )
  yield takeLatest(notificationMessageAction, logSystemNotifications)
  yield takeLatest(notificationMessageAction, refreshUpdateInfo)
  yield takeLatest(notificationRemovalAction, refreshUpdateInfo)
  yield takeLatest(
    [
      /** disabled, otherwise at the end of the job the user cannot review the notifications */
      // actionsServiceDeactivateSystemAction,
      actionsServiceActivateSystemAction,
    ],
    resetNotifications
  )
}
