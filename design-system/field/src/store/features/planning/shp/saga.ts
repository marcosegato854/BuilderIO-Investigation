import { mergeDeepRight } from 'ramda'
import { put, select, takeLatest } from 'redux-saga/effects'
import { selectDataStorageCurrentJob } from 'store/features/dataStorage/slice'
import { errorAction } from 'store/features/errors/slice'
import {
  currentPolygonAction,
  importShpDone,
  importShpInfoActions,
  importShpStartActions,
  selectPolygons,
  selectShpFileName,
} from 'store/features/planning/slice'
import { Path, Polygon } from 'store/features/planning/types'
import { getRandomColor, getShadesArray } from 'utils/colors'
import {
  defaultSettings,
  emptyUnnamedMultiPathPolygon,
  getPolygonAutomaticName,
  getPolygonCoordinatesFromPaths,
  getPolygonTempId,
  mergeJobSettings,
  sanitizeShpPolygons,
} from 'utils/planning/polygonHelpers'
import { filenameAndExtensionFromPath } from 'utils/strings'

/**
 * SAGAS
 */

function* importShp({
  payload,
}: ReturnType<typeof importShpStartActions.success>) {
  try {
    console.info(`[SHP] import status ${payload.action.status}`)
    if (payload.action.status !== 'done') return
    const name: string | null = yield select(selectShpFileName)
    const prevPolygons: Polygon[] = yield select(selectPolygons)
    const currentJob: IJob = yield select(selectDataStorageCurrentJob)
    const newSettings = mergeJobSettings(defaultSettings(), currentJob)
    const sanitizedShpPolygons =
      sanitizeShpPolygons(payload.result?.polygons) || []
    const avoidColors = prevPolygons.map((p) => p.color || '')
    const polygonColor = getRandomColor(avoidColors)
    const shadesArray = getShadesArray(polygonColor)
    const paths = sanitizedShpPolygons.map((p, i) => {
      const path: Path = p.paths[0]
      path.color = shadesArray[i % shadesArray.length]
      path.name = path.name || getPolygonAutomaticName(prevPolygons, false, i)
      path.id = i
      path.settings = newSettings
      return path
    })
    const { name: filename, ext } = filenameAndExtensionFromPath(name || '')
    const polygon = mergeDeepRight(emptyUnnamedMultiPathPolygon, {
      name: name ? `${filename}.${ext}` : 'ShapeFile',
      temp_id: getPolygonTempId(prevPolygons),
      coordinates: getPolygonCoordinatesFromPaths(paths),
      paths,
      color: polygonColor,
      isPolygon: true,
    }) as Polygon
    yield put(
      importShpDone({
        polygon,
      })
    )
    console.info(`[SHP] import done for ${polygon.name}`)
  } catch (e) {
    yield put(errorAction(e))
  }
}

function* resetSelection() {
  console.info('[SHP] reset polygon selection at start import')
  yield put(currentPolygonAction(-1))
}

export function* planningShpSaga() {
  yield takeLatest(
    [importShpStartActions.success, importShpInfoActions.success],
    importShp
  )
  yield takeLatest(importShpStartActions.request, resetSelection)
}
