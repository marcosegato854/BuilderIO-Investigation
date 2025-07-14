// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
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
import { cameraDisplayableNamesActions } from 'store/features/camera/slice'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/system/api'
import {
  hideInitializationAction,
  selectSystemState,
  systemCheckUpdateActions,
  systemStateActions,
} from 'store/features/system/slice'
import {
  SystemNotificationsResponse,
  SystemNotificationType,
  SystemState,
} from 'store/features/system/types'

/**
 * SAGAS
 */
/**
 * starts polling for initialization load
 * after successful authentication
 */
function* initializationPollSagaWorker() {
  // wait for successful initialization load
  while (true) {
    try {
      console.info('[INITIALIZATION] polling call')
      yield take(systemStateActions.success)
      const { state }: SystemState = yield select(selectSystemState)
      if (['Initializing', 'Starting'].includes(state)) {
        console.info('[INITIALIZATION] not yet', state)
        // yield put(systemStateActions.success(respLoad.data))
        // not yet, update progress
        // yield put(rtkServiceLoadinitializationAction(respLoad.data))
        yield delay(1000)
        yield put(systemStateActions.request())
      } else {
        // yield put(systemStateActions.success(respLoad.data))
        const resp: AxiosResponse<SystemNotificationsResponse> = yield call(
          api.systemNotifications
        )
        const { notifications } = resp.data
        const errors = notifications.filter(
          (n) => n.type === SystemNotificationType.ERROR
        )
        if (errors.length) break
        yield put(hideInitializationAction(true))
        // initialization are ready, get them
        console.info('[INITIALIZATION] done')
        // call again the available cameras to avoid missing data on login
        yield put(cameraDisplayableNamesActions.request())
        // check for updates moved after the responsiveness check
        // yield put(systemCheckUpdateActions.request({ userRequest: false }))
        break
      }
    } catch (e) {
      // remove loading
      console.error('[INITIALIZATION] info error', e)
      yield put(systemStateActions.failure())
      yield put(errorAction(e))
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* initializationPollSagaWatcher() {
  while (true) {
    yield take(systemStateActions.request)
    console.info('[INITIALIZATION] check initialization')
    yield race([
      call(initializationPollSagaWorker),
      take('POLLING_INITIALIZATION_STOP'),
    ])
  }
}

export function* initializationPollSaga() {
  yield all([fork(initializationPollSagaWatcher)])
}
