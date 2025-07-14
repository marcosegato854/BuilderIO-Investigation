import { all, fork, put, race, select, take } from 'redux-saga/effects'
import { selectDataStorageCurrentJob } from 'store/features/dataStorage/slice'
import {
  routingPolylineActions,
  selectRoutingEnabled,
} from 'store/features/routing/slice'
import {
  selectSystemState,
  stateMessageAction,
  systemStateActions,
} from 'store/features/system/slice'
import { directionsStates, SystemState } from 'store/features/system/types'
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
    const currentJob: IJob = yield select(selectDataStorageCurrentJob)
    const routingEnabled: boolean = yield select(selectRoutingEnabled)
    if (currentJob?.planned && routingEnabled) {
      const response: { payload: SystemState } = results.filter(Boolean)[0]!
      const newState = response?.payload.state
      if (savedState?.state !== newState) {
        if (!directionsStates.includes(newState)) {
          console.info('[STATUS_MONITOR] remove polyline')
          yield put(routingPolylineActions.failure())
        }
        if (
          directionsStates.includes(newState) &&
          !directionsStates.includes(savedState?.state)
        ) {
          console.info('[STATUS_MONITOR] load polyline')
          yield put(routingPolylineActions.request())
        }
      }
    }
  }
}

export function* routingPolylineSaga() {
  yield all([fork(monitorStateChanges)])
}
