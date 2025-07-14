// eslint-disable-next-line import/no-extraneous-dependencies
import { all, fork } from 'redux-saga/effects'
import { rtkBackendSaga } from 'store/features/rtk/backend/saga'
import { rtkFormSaga } from 'store/features/rtk/form/saga'
import { rtkServersSaga } from 'store/features/rtk/servers/saga'
import { testServerPollSaga } from 'store/features/rtk/test/saga'
import { mountpointsPollSaga } from './mountpoints/saga'

/**
 * SAGAS
 */

export function* rtkSaga() {
  yield all([fork(rtkBackendSaga)])
  yield all([fork(mountpointsPollSaga)])
  yield all([fork(testServerPollSaga)])
  yield all([fork(rtkServersSaga)])
  yield all([fork(rtkFormSaga)])
}
