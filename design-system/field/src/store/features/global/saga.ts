// eslint-disable-next-line import/no-extraneous-dependencies
import {
  all,
  call,
  delay,
  fork,
  put,
  race,
  take,
  takeLatest,
} from 'redux-saga/effects'
import { alignmentSocketConnectionAction } from 'store/features/alignment/slice'
import { errorAction } from 'store/features/errors/slice'
import {
  redirectToJobsAction,
  resetSocketsAction,
} from 'store/features/global/slice'
import { pointCloudConnected } from 'store/features/pointcloud/slice'
import { positionSocketConnectionAction } from 'store/features/position/slice'
import { routingSocketConnectionAction } from 'store/features/routing/slice'
import {
  logError,
  notificationsSocketConnectionAction,
  stateSocketConnectionAction,
  systemResponsivenessActions,
  systemStateActions,
} from 'store/features/system/slice'
import { redirectToCurrentJob } from 'utils/saga/redirect'

/**
 * SAGAS
 */

/**
 * subscribe to pointcloud socket if activation is ok, unsubscribe if it's not
 * */
function* redirectToCurrentProjectJobs() {
  yield call(redirectToCurrentJob)
}

/**
 * subscribe to pointcloud socket if activation is ok, unsubscribe if it's not
 * */
function* logHandledErrorsToBackend({
  payload,
}: ReturnType<typeof errorAction>) {
  try {
    yield put(logError(payload as Error))
  } catch (error) {
    console.error("Couldn't log error to backend", error)
  }
}

/**
 * Automatically close dialogs on specific actions dispatches
 */
function* globalKeepAlive() {
  const RESTORE_DELAY = 300
  while (true) {
    /** wait for responsiveness to fail or for position to be idle for 5sec */
    yield race([
      take(systemResponsivenessActions.failure),
      take(resetSocketsAction),
    ])
    yield put(
      logError(new Error('[GLOBAL_KEEP_ALIVE] connectivity issue detected'))
    )
    /** wait for successful responsiveness or try again in 2 seconds */
    const { respSuccess } = yield race({
      data: take(systemResponsivenessActions.success),
      timeout: delay(2000),
    })
    const errorMessage = `[GLOBAL_KEEP_ALIVE] reset sockets, responsiveness available = ${
      respSuccess ? 'true' : 'false'
    }`
    /** mark the socket connections as disconnected so each saga tries to reconnect automatically */
    yield put(logError(new Error(errorMessage)))
    console.info('[GLOBAL_KEEP_ALIVE] reset state socket')
    yield put(stateSocketConnectionAction(false))
    console.info('[GLOBAL_KEEP_ALIVE] refresh system state')
    yield put(systemStateActions.request())
    yield delay(RESTORE_DELAY)
    console.info('[GLOBAL_KEEP_ALIVE] reset position socket')
    yield put(positionSocketConnectionAction(false))
    yield delay(RESTORE_DELAY)
    console.info('[GLOBAL_KEEP_ALIVE] reset alignment socket')
    yield put(alignmentSocketConnectionAction(false))
    yield delay(RESTORE_DELAY)
    console.info('[GLOBAL_KEEP_ALIVE] reset notifications socket')
    yield put(notificationsSocketConnectionAction(false))
    yield delay(RESTORE_DELAY)
    console.info('[GLOBAL_KEEP_ALIVE] reset pointcloud socket')
    yield put(pointCloudConnected(false))
    yield delay(RESTORE_DELAY)
    console.info('[GLOBAL_KEEP_ALIVE] reset routing socket')
    yield put(routingSocketConnectionAction(false))
  }
}

export function* globalSaga() {
  yield takeLatest(redirectToJobsAction, redirectToCurrentProjectJobs)
  yield takeLatest(errorAction, logHandledErrorsToBackend)
  yield all([fork(globalKeepAlive)])
}
