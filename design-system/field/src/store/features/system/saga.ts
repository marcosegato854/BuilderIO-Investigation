// eslint-disable-next-line import/no-extraneous-dependencies
import { all, fork } from 'redux-saga/effects'
import { systemBackendSaga } from 'store/features/system/backend/saga'
import { systemBatteryNotificationsSaga } from 'store/features/system/battery/saga'
import { systemCameraDisconnectionSaga } from 'store/features/system/camera/saga'
import { initializationPollSaga } from 'store/features/system/initialization/saga'
import { systemNotificationsSaga } from 'store/features/system/notifications/saga'
import { responsivenessPollSaga } from 'store/features/system/responsiveness/saga'
import { systemNotificationsSocketsSaga } from 'store/features/system/socket/notifications/socketSaga'
import { systemStateSocketsSaga } from 'store/features/system/socket/state/socketSaga'
import { systemStateSaga } from 'store/features/system/state/saga'
import { updatePollSaga } from 'store/features/system/update/saga'

/**
 * SAGAS
 */

export function* systemSaga() {
  yield all([fork(systemBackendSaga)])
  yield all([fork(initializationPollSaga)])
  yield all([fork(responsivenessPollSaga)])
  yield all([fork(systemNotificationsSocketsSaga)])
  yield all([fork(systemStateSocketsSaga)])
  yield all([fork(systemCameraDisconnectionSaga)])
  yield all([fork(systemNotificationsSaga)])
  yield all([fork(systemBatteryNotificationsSaga)])
  yield all([fork(systemStateSaga)])
  yield all([fork(updatePollSaga)])
}
