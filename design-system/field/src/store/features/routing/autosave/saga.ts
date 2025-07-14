import { put, select, takeLatest } from 'redux-saga/effects'
import { Polygon } from 'store/features/planning/types'
import {
  autocaptureUpdatePolygonsActions,
  reorderUncoveredInternalPathsAction,
  reorderUncoveredPathsAction,
  selectRestoredUncoveredPolygons,
  updateUncoveredInternalPathSettingsAction,
  updateUncoveredPathSettingsAction,
} from 'store/features/routing/slice'

/**
 * SAGAS
 */
function* autoSaveUncoveredTracks() {
  const uncovered: Polygon[] = yield select(selectRestoredUncoveredPolygons)
  yield put(
    autocaptureUpdatePolygonsActions.request({
      plan: { polygons: uncovered },
    })
  )
}

export function* routingAutoSaveSaga() {
  yield takeLatest(
    [
      updateUncoveredPathSettingsAction,
      updateUncoveredInternalPathSettingsAction,
      reorderUncoveredPathsAction,
      reorderUncoveredInternalPathsAction,
    ],
    autoSaveUncoveredTracks
  )
}
