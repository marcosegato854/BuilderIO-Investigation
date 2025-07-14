import { all, fork } from 'redux-saga/effects'
import { coordsysSystemSaga } from 'store/features/coordsys/system/saga'
import { coordsysWktSaga } from 'store/features/coordsys/wkt/saga'

export function* coordsysSaga() {
  yield all([fork(coordsysSystemSaga)])
  yield all([fork(coordsysWktSaga)])
}
