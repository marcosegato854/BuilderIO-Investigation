// eslint-disable-next-line import/no-extraneous-dependencies
import { all, fork } from 'redux-saga/effects'
import { dataStorageAcquisitionSaga } from 'store/features/dataStorage/acquisition/saga'
import { jobReportPollSaga } from 'store/features/dataStorage/actions/report/saga'
import { dataStorageBackendSaga } from 'store/features/dataStorage/backend/saga'
import { dataStorageCloneSaga } from 'store/features/dataStorage/clone/saga'
import { dataStorageJobsSaga } from 'store/features/dataStorage/jobs/saga'
import { dataStorageJobsRedirectSaga } from 'store/features/dataStorage/jobsRedirect/saga'
import { dataStorageNotificationSaga } from 'store/features/dataStorage/notifications/saga'
import { dataStorageProjectsSaga } from 'store/features/dataStorage/projects/saga'
import { dataStorageReportSaga } from 'store/features/dataStorage/report/saga'

/**
 * SAGAS
 */

// prettier-ignore
export function* dataStorageSaga() {
  yield all([fork(dataStorageBackendSaga)])
  yield all([fork(dataStorageProjectsSaga)])
  yield all([fork(dataStorageJobsRedirectSaga)])
  yield all([fork(dataStorageJobsSaga)])
  yield all([fork(dataStorageNotificationSaga)])
  yield all([fork(dataStorageCloneSaga)])
  yield all([fork(dataStorageAcquisitionSaga)])
  yield all([fork(dataStorageReportSaga)])
  yield all([fork(jobReportPollSaga)])
}
