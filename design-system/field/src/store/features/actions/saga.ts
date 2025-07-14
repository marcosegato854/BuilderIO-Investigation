// eslint-disable-next-line import/no-extraneous-dependencies
import { all, fork } from 'redux-saga/effects'
import { activationPollSaga } from 'store/features/actions/activation/saga'
import { actionsBackendsSaga } from 'store/features/actions/backend/saga'
import { deactivationPollSaga } from 'store/features/actions/deactivation/saga'
import { finalAlignmentPollSaga } from 'store/features/actions/finalAlignment/saga'
import { initialAlignmentPollSaga } from 'store/features/actions/initialAlignment/saga'
import { startRecordingPollSaga } from 'store/features/actions/startRecording/saga'
import { stopRecordingPollSaga } from 'store/features/actions/stopRecording/saga'
// import { push } from 'connected-react-router'

// import { rootPath } from 'config'

/**
 * SAGAS
 */

export function* actionsSaga() {
  yield all([fork(actionsBackendsSaga)])
  yield all([fork(activationPollSaga)])
  yield all([fork(deactivationPollSaga)])
  yield all([fork(startRecordingPollSaga)])
  yield all([fork(stopRecordingPollSaga)])
  yield all([fork(initialAlignmentPollSaga)])
  yield all([fork(finalAlignmentPollSaga)])
}
