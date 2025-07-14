// eslint-disable-next-line import/no-extraneous-dependencies
import { all, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import { selectIsAuthenticating } from 'store/features/auth/slice'
import {
  rtkServiceDeleteServerActions,
  rtkServiceServersActions,
  rtkServiceUpdateServerActions,
  rtkServiceSubmitServerActions,
  rtkServiceCloseDialog,
  rtkServiceTestServerActions,
  rtkServiceAuthenticateServerActions,
  rtkServiceResetCurrentServerConnection,
} from 'store/features/rtk/slice'

/**
 * SAGAS
 */
function* refreshAfterDeleteServer() {
  while (true) {
    yield take(rtkServiceDeleteServerActions.success)
    yield put(rtkServiceServersActions.request())
  }
}

function* refreshAfterUpdateServer() {
  while (true) {
    yield take(rtkServiceUpdateServerActions.success)
    yield put(rtkServiceServersActions.request())
  }
}

function* refreshAfterSubmitServer() {
  while (true) {
    yield take(rtkServiceSubmitServerActions.success)
    yield put(rtkServiceServersActions.request())
  }
}

function* rtkResetPendingConnections({
  payload,
}: ReturnType<typeof rtkServiceCloseDialog>) {
  console.info('[RTK_CLOSE_DIALOG] rtkResetPendingConnections')
  const isAuthenticating: boolean = yield select(selectIsAuthenticating)
  if (isAuthenticating) {
    // reset authenticating status
    yield put(rtkServiceTestServerActions.failure())
    yield put(rtkServiceAuthenticateServerActions.failure())
  }
  // stop mountpoints polling
  yield put({ type: 'POLLING_TEST_SERVER_STOP' })
  // stop test polling
  yield put({ type: 'POLLING_MOUNTPOINTS_STOP' })
}

export function* rtkServersSaga() {
  yield takeLatest(
    [rtkServiceCloseDialog, rtkServiceResetCurrentServerConnection],
    rtkResetPendingConnections
  )
  yield all([fork(refreshAfterDeleteServer)])
  yield all([fork(refreshAfterUpdateServer)])
  yield all([fork(refreshAfterSubmitServer)])
}
