import { all, fork } from 'redux-saga/effects'
import { actionsSaga } from 'store/features/actions/saga'
import { alignmentSaga } from 'store/features/alignment/saga'
import { authSaga } from 'store/features/auth/saga'
import { cameraSaga } from 'store/features/camera/saga'
import { dataStorageSaga } from 'store/features/dataStorage/saga'
import { dialogsSaga } from 'store/features/dialogs/saga'
import { globalSaga } from 'store/features/global/saga'
import { planningSaga } from 'store/features/planning/saga'
import { pointCloudSaga } from 'store/features/pointcloud/saga'
import { positionSaga } from 'store/features/position/saga'
import { routingSaga } from 'store/features/routing/saga'
import { rtkSaga } from 'store/features/rtk/saga'
import { scannerSaga } from 'store/features/scanner/saga'
import { settingsSaga } from 'store/features/settings/saga'
import { speechSaga } from 'store/features/speech/saga'
import { startupSaga } from 'store/features/startup/saga'
import { systemSaga } from 'store/features/system/saga'
import { errorsSaga } from 'store/features/errors/saga'
import { coordsysSaga } from 'store/features/coordsys/saga'

export default function* rootSaga() {
  try {
    yield all([
      fork(authSaga),
      fork(globalSaga),
      fork(startupSaga),
      fork(dialogsSaga),
      fork(systemSaga),
      fork(settingsSaga),
      fork(scannerSaga),
      fork(dataStorageSaga),
      fork(actionsSaga),
      fork(positionSaga),
      fork(alignmentSaga),
      fork(routingSaga),
      fork(planningSaga),
      fork(cameraSaga),
      fork(pointCloudSaga),
      fork(rtkSaga),
      fork(speechSaga),
      fork(errorsSaga),
      fork(coordsysSaga),
    ])
  } catch (error) {
    if (process.env.NODE_ENV === 'test') {
      const shouldHideError = (error as Error).message?.indexOf('authSaga') >= 0
      if (shouldHideError) return
    }
    throw error
  }
}
