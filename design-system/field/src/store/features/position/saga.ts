// eslint-disable-next-line import/no-extraneous-dependencies
import { all, fork } from 'redux-saga/effects'
import { positionAntennaSaga } from 'store/features/position/antenna/saga'
import { positionBackendSaga } from 'store/features/position/backend/saga'
import { positionSocketsSaga } from 'store/features/position/socket/socketSaga'

export function* positionSaga() {
  yield all([fork(positionAntennaSaga)])
  yield all([fork(positionBackendSaga)])
  yield all([fork(positionSocketsSaga)])
}
