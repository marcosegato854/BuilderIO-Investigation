import { all, fork } from 'redux-saga/effects'
import { alignmentBackendSaga } from 'store/features/alignment/backend/saga'
import { alignmentLoggingSaga } from 'store/features/alignment/logging/saga'
import { alignmentMonitorSaga } from 'store/features/alignment/monitor/saga'
import { alignmentSocketsSaga } from 'store/features/alignment/socket/socketSaga'

/**
 * SAGAS
 */

export function* alignmentSaga() {
  yield all([fork(alignmentBackendSaga)])
  yield all([fork(alignmentSocketsSaga)])
  yield all([fork(alignmentLoggingSaga)])
  yield all([fork(alignmentMonitorSaga)])
}
