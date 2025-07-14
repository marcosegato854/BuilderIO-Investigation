import { all, delay, fork, put, select, take } from 'redux-saga/effects'
import { selectIsLoggedIn } from 'store/features/auth/slice'
import { systemStateActions } from 'store/features/system/slice'

/**
 * SAGAS
 */

function* handleFailures() {
  while (true) {
    yield take(systemStateActions.failure)
    const isLoggedIn: boolean = yield select(selectIsLoggedIn)
    if (isLoggedIn) {
      console.warn('[SYSTEM] state API failed, retrying in 3 seconds')
      yield delay(3000)
      console.info('[SYSTEM] retry state API')
      yield put(systemStateActions.request())
    }
  }
}

export function* systemStateSaga() {
  yield all([fork(handleFailures)])
}
