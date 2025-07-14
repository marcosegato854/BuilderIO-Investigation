// eslint-disable-next-line import/no-extraneous-dependencies
import { all, fork, put, race, select, take } from 'redux-saga/effects'
import {
  dataStorageJobDetailActions,
  selectDataStorageCurrentJob,
} from 'store/features/dataStorage/slice'
import {
  stateMessageAction,
  systemStateActions,
  selectSystemState,
} from 'store/features/system/slice'
import { SystemState } from 'store/features/system/types'

/**
 * SAGAS
 */

function* reloadJobDetails() {
  while (true) {
    yield race([take(systemStateActions.success), take(stateMessageAction)])
    const currentJob: IJob = yield select(selectDataStorageCurrentJob)
    const systemState: SystemState = yield select(selectSystemState)
    if (currentJob && ['Recording', 'Activated'].includes(systemState.state)) {
      console.info('[DATASTORAGE] reloading job details')
      yield put(dataStorageJobDetailActions.request(currentJob.name))
    }
  }
}

// prettier-ignore
export function* dataStorageAcquisitionSaga() {
  yield all([fork(reloadJobDetails)])
}
