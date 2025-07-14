import { all, fork, put, race, select, take } from 'redux-saga/effects'
import { alignmentStatusActions } from 'store/features/alignment/slice'
import {
  selectSystemState,
  stateMessageAction,
  systemStateActions,
} from 'store/features/system/slice'
import { ActivationStatus, SystemState } from 'store/features/system/types'

/**
 * SAGAS
 */

function* monitorStateChanges() {
  while (true) {
    const savedState: SystemState = yield select(selectSystemState)
    const results: [
      ReturnType<typeof systemStateActions.success> | undefined,
      ReturnType<typeof stateMessageAction> | undefined
    ] = yield race([take(systemStateActions.success), take(stateMessageAction)])
    const response: { payload: SystemState } = results.filter(Boolean)[0]!
    const newState = response?.payload.state
    if (savedState?.state !== newState) {
      const triggerStates: ActivationStatus[] = [
        'Activated',
        'InitialAlignment',
        'FinalAlignment',
        'StartingLogging',
        'Deactivating',
      ]
      if (triggerStates.includes(newState)) {
        console.info('[ALIGNMENT] update state API', newState)
        yield put(alignmentStatusActions.request())
      }
    }
  }
}

export function* alignmentMonitorSaga() {
  yield all([fork(monitorStateChanges)])
}
