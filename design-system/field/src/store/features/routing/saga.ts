import { all, fork } from 'redux-saga/effects'
import { routingAbortSaga } from 'store/features/routing/abort/saga'
import { routingActivateSaga } from 'store/features/routing/activate/saga'
import { routingAutoSaveSaga } from 'store/features/routing/autosave/saga'
import { routingBackendSaga } from 'store/features/routing/backend/saga'
import { routingDeactivateSaga } from 'store/features/routing/deactivate/saga'
import { autocaptureNotificationsSaga } from 'store/features/routing/notifications/saga'
import { routingPolylineSaga } from 'store/features/routing/polyline/saga'
import { routingSocketsSaga } from 'store/features/routing/socket/socketSaga'
import { routingStateMonitorSaga } from 'store/features/routing/stateMonitor/saga'

/**
 * SAGAS
 */
export function* routingSaga() {
  yield all([fork(routingBackendSaga)])
  yield all([fork(routingSocketsSaga)])
  yield all([fork(routingActivateSaga)])
  yield all([fork(routingDeactivateSaga)])
  yield all([fork(routingAutoSaveSaga)])
  yield all([fork(routingAbortSaga)])
  yield all([fork(routingStateMonitorSaga)])
  yield all([fork(autocaptureNotificationsSaga)])
  yield all([fork(routingPolylineSaga)])
}
