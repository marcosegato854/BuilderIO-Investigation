// eslint-disable-next-line import/no-extraneous-dependencies
import { mergeDeepRight } from 'ramda'
import {
  all,
  call,
  delay,
  fork,
  put,
  race,
  select,
  take,
} from 'redux-saga/effects'
import { selectIsLoggedIn } from 'store/features/auth/slice'
import { errorAction } from 'store/features/errors/slice'
import { SocketNotificationCodes } from 'store/features/system/notifications/notificationCodes'
import {
  checkResponsivenessAction,
  notificationMessageAction,
  notificationRemovalAction,
  selectRealTimeNotifications,
  selectResponsiveness,
  selectSystemInfo,
  systemResponsivenessActions,
} from 'store/features/system/slice'
import {
  SystemInfo,
  SystemNotification,
  SystemResponsiveness,
} from 'store/features/system/types'
import { enumValues } from 'utils/objects'

/**
 * SAGAS
 */
/**
 * starts polling for responsiveness load
 * after successful authentication
 */
function* responsivenessPollSagaWorker() {
  while (true) {
    const systemInfo: SystemInfo = yield select(selectSystemInfo)
    const { responsivenessInterval } = systemInfo || {}
    const interval = (responsivenessInterval || 20) * 1000
    try {
      const isLoggedIn: boolean = yield select(selectIsLoggedIn)
      if (isLoggedIn) {
        yield put(systemResponsivenessActions.request())
        const [successResponse, failureResponse]: [
          ReturnType<typeof systemResponsivenessActions.success>,
          ReturnType<typeof systemResponsivenessActions.failure>
        ] = yield race([
          take(systemResponsivenessActions.success),
          take(systemResponsivenessActions.failure),
        ])
        if (successResponse) {
          // console.log('[RESPONSIVENESS] success', successResponse)
        }
        if (failureResponse) {
          console.warn('[RESPONSIVENESS] failure')
        }
      } else {
        console.warn('[RESPONSIVENESS] not logged in')
      }
    } catch (e) {
      console.error(e)
      // remove loading
      console.error('[RESPONSIVENESS] error')
      yield put(errorAction(e))
      break
    }
    yield delay(interval)
  }
}

/**
 * Saga watcher.
 */
function* responsivenessPollSagaWatcher() {
  while (true) {
    yield take(checkResponsivenessAction)
    console.info('[RESPONSIVENESS] wait a second')
    yield delay(1000)
    console.info('[RESPONSIVENESS] start the worker')
    yield race([
      call(responsivenessPollSagaWorker),
      take('POLLING_RESPONSIVENESS_STOP'),
    ])
  }
}

/**
 * Socket notificatons watcher. Puts client in critical if a socket is down
 */
function* socketNotificationsWatcher() {
  while (true) {
    yield race([
      take(notificationMessageAction),
      take(notificationRemovalAction),
    ])
    const rtNotifications: SystemNotification[] = yield select(
      selectRealTimeNotifications
    )
    const socketNotificationCodes = enumValues(SocketNotificationCodes)
    if (rtNotifications.find((n) => socketNotificationCodes.includes(n.code))) {
      console.warn('[RESPONSIVENESS] socket down, critical connection status')
      const responsiveness: SystemResponsiveness = yield select(
        selectResponsiveness
      )
      const newResponsiveness: SystemResponsiveness = mergeDeepRight(
        responsiveness,
        {
          connection: {
            critical: true,
            gateway: {
              critical: true,
            },
          },
        }
      )
      yield put(systemResponsivenessActions.success(newResponsiveness))
    }
  }
}

export function* responsivenessPollSaga() {
  yield all([fork(responsivenessPollSagaWatcher)])
  yield all([fork(socketNotificationsWatcher)])
}
