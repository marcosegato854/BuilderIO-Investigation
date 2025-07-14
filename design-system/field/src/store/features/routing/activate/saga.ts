import { put, select, takeLatest } from 'redux-saga/effects'
import { actionsServiceAcquisitionReady } from 'store/features/actions/slice'
import { selectDataStorageCurrentJob } from 'store/features/dataStorage/slice'
import {
  autocapturePolygonsActions,
  selectAutocaptureEnabled,
  selectRoutingServiceState,
} from 'store/features/routing/slice'

/**
 * SAGAS
 */
function* loadAutocaptureTracks() {
  const currentJob: IJob | undefined = yield select(selectDataStorageCurrentJob)
  const planned = currentJob?.planned
  if (!planned) {
    console.info('[AUTOCAPTURE] not planned, skip loading tracks')
    return
  }
  /** the list of the tracks should be loaded in any case if a job is planned */
  /* const enabled: boolean = yield select(selectAutocaptureEnabled)
   if (!enabled) {
    console.info('[AUTOCAPTURE] not enabled, skip loading tracks')
    return
  } */
  const routing: { autocapturePolygons: unknown[] } = yield select(
    selectRoutingServiceState
  )
  if (routing.autocapturePolygons?.length) {
    console.info('[AUTOCAPTURE] tracks already available')
    return
  }
  console.info('[AUTOCAPTURE] loading tracks at activation')
  yield put(autocapturePolygonsActions.request())
}

export function* routingActivateSaga() {
  yield takeLatest(actionsServiceAcquisitionReady, loadAutocaptureTracks)
}
