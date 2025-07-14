import { put, select, takeLatest } from 'redux-saga/effects'
import { errorAction } from 'store/features/errors/slice'
import { getPlannedJobActions } from 'store/features/planning/slice'
import { extractErrorStatusCode } from 'utils/errors'
import { getSectionFromPathname } from 'utils/strings'

/**
 * SAGAS
 */

function* plannedJobsError({
  payload,
}: ReturnType<typeof getPlannedJobActions.failure>) {
  const statusCode = extractErrorStatusCode(payload)
  if (statusCode !== 404) return
  const pathname: string = yield select(
    (state) => state.router.location.pathname
  )
  const section = getSectionFromPathname(pathname)
  if (section !== 'acquisition') return
  yield put(errorAction(payload))
}

export function* planningAcquisitionSaga() {
  yield takeLatest(getPlannedJobActions.failure, plannedJobsError)
}
