import { put, takeLatest } from 'redux-saga/effects'
import {
  actionsServiceActivateSystemAction,
  actionsServiceDeactivateSystemAction,
} from 'store/features/actions/slice'
import { resetRoutingAction } from 'store/features/routing/slice'

/**
 * SAGAS
 */
function* resetRouting() {
  yield put(resetRoutingAction())
}

export function* routingDeactivateSaga() {
  yield takeLatest(
    [actionsServiceDeactivateSystemAction, actionsServiceActivateSystemAction],
    resetRouting
  )
}
