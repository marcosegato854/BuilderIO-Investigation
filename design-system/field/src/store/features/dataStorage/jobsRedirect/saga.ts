// eslint-disable-next-line import/no-extraneous-dependencies
import { push } from 'connected-react-router'
import { all, fork, put, race, take } from 'redux-saga/effects'
import {
  dataStorageDeleteJobTypeActions,
  dataStorageJobDeleteActions,
  dataStorageJobsActions,
  dataStorageJobTypesActions,
  dataStorageNewJobActions,
  dataStorageNewJobTypeActions,
  dataStorageUpdateJobActions,
  dataStorageUpdateJobTypeActions,
} from 'store/features/dataStorage/slice'

function* refreshAfterDeleteJob() {
  while (true) {
    yield take(dataStorageJobDeleteActions.success)
    yield put(dataStorageJobsActions.request())
  }
}

function* refreshAfterNewJob() {
  while (true) {
    yield take(dataStorageNewJobActions.success)
    yield put(dataStorageJobsActions.request())
  }
}

function* redirectAfterNewJob() {
  while (true) {
    const request: ReturnType<typeof dataStorageNewJobActions.request> =
      yield take(dataStorageNewJobActions.request)
    if (request.payload.redirect) {
      const results: unknown[] = yield race([
        take(dataStorageNewJobActions.success),
        take(dataStorageNewJobActions.failure),
      ])
      if (results[0]) yield put(push(request.payload.redirect))
    }
  }
}

function* redirectAfterUpdateJob() {
  while (true) {
    const request: ReturnType<typeof dataStorageUpdateJobActions.request> =
      yield take(dataStorageUpdateJobActions.request)
    if (request.payload.redirect) {
      const results: unknown[] = yield race([
        take(dataStorageUpdateJobActions.success),
        take(dataStorageUpdateJobActions.failure),
      ])
      if (results[0]) yield put(push(request.payload.redirect))
    }
  }
}

function* refreshAfterUpdateJob() {
  while (true) {
    yield take(dataStorageUpdateJobActions.success)
    yield put(dataStorageJobsActions.request())
  }
}

function* refreshAfterReport() {
  while (true) {
    yield take('REPORT_READY')
    yield put(dataStorageJobsActions.request())
  }
}

function* refreshAfterUdpateJobtype() {
  while (true) {
    yield race([
      take(dataStorageNewJobTypeActions.success),
      take(dataStorageUpdateJobTypeActions.success),
      take(dataStorageDeleteJobTypeActions.success),
    ])
    yield put(dataStorageJobTypesActions.request())
  }
}

// prettier-ignore
export function* dataStorageJobsRedirectSaga() {
  yield all([fork(refreshAfterDeleteJob)])
  yield all([fork(refreshAfterNewJob)])
  yield all([fork(redirectAfterNewJob)])
  yield all([fork(redirectAfterUpdateJob)])
  yield all([fork(refreshAfterUpdateJob)])
  yield all([fork(refreshAfterReport)])
  yield all([fork(refreshAfterUdpateJobtype)])
}
