import { all, fork } from 'redux-saga/effects'
import { planningAcquisitionSaga } from 'store/features/planning/acquisition/saga'
import { extractPollSaga } from 'store/features/planning/actions/extract/saga'
import { startProcessingPollSaga } from 'store/features/planning/actions/process/saga'
import { shpPollSaga } from 'store/features/planning/actions/shp/saga'
import { shpListPollSaga } from 'store/features/planning/actions/shpList/saga'
import { planningBackendSaga } from 'store/features/planning/backend/saga'
import { planningDiskSaga } from 'store/features/planning/disk/saga'
import { planningDrawingSaga } from 'store/features/planning/drawing/saga'
import { planningExtractSaga } from 'store/features/planning/extract/saga'
import { planningInitSaga } from 'store/features/planning/init/saga'
import { planningShpSaga } from 'store/features/planning/shp/saga'
import { planningSubmitSaga } from 'store/features/planning/submit/saga'
import { planningSystemInfoSaga } from 'store/features/planning/systemInfo/saga'

export function* planningSaga() {
  yield all([fork(planningBackendSaga)])
  yield all([fork(planningDiskSaga)])
  yield all([fork(planningInitSaga)])
  yield all([fork(startProcessingPollSaga)])
  yield all([fork(extractPollSaga)])
  yield all([fork(shpPollSaga)])
  yield all([fork(shpListPollSaga)])
  yield all([fork(planningDrawingSaga)])
  yield all([fork(planningSubmitSaga)])
  yield all([fork(planningExtractSaga)])
  yield all([fork(planningShpSaga)])
  yield all([fork(planningAcquisitionSaga)])
  yield all([fork(planningSystemInfoSaga)])
}
