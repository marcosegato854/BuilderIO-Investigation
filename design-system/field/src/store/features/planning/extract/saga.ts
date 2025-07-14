import { t } from 'i18n/config'
import { put, select, takeLatest } from 'redux-saga/effects'
import { selectDataStorageCurrentJob } from 'store/features/dataStorage/slice'
import { errorAction } from 'store/features/errors/slice'
import {
  extractPolygonDone,
  extractPolygonInfoActions,
  extractPolygonStartActions,
  selectCurrentPolygon,
} from 'store/features/planning/slice'
import { Polygon } from 'store/features/planning/types'
import { getRandomColor } from 'utils/colors'
import {
  defaultSettings,
  mergeJobSettings,
} from 'utils/planning/polygonHelpers'

/**
 * SAGAS
 */

function* extractTracks({
  payload,
}: ReturnType<typeof extractPolygonStartActions.success>) {
  try {
    const currentTrack: Polygon | null = yield select(selectCurrentPolygon)
    if (!currentTrack) return
    const id = currentTrack.id || currentTrack.temp_id
    if (payload.action.status !== 'done') return
    const currentJob: IJob | null = yield select(selectDataStorageCurrentJob)
    const newSettings = mergeJobSettings(defaultSettings(), currentJob)
    const intTracks = (payload.result.polygons[0]?.paths || []).map(
      (path, index) => ({
        id: index,
        name: `${t('planning.track', 'track')}${index + 1}`,
        color: getRandomColor(),
        settings: newSettings,
        ...path,
      })
    )
    const classes = payload.result.polygons[0]?.classes || []
    yield put(
      extractPolygonDone({
        polygonId: id!,
        paths: intTracks,
        classes,
      })
    )
  } catch (e) {
    yield put(errorAction(e))
  }
}

export function* planningExtractSaga() {
  yield takeLatest(
    [extractPolygonStartActions.success, extractPolygonInfoActions.success],
    extractTracks
  )
}
