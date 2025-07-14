import { AxiosResponse } from 'axios'
import { t } from 'i18n/config'
import { append, insert, isNil, last, update } from 'ramda'
import {
  all,
  call,
  fork,
  put,
  select,
  take,
  takeLatest,
} from 'redux-saga/effects'
import { store } from 'store'
import { selectDataStorageCurrentJob } from 'store/features/dataStorage/slice'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/planning/api'
import {
  addPointAction,
  selectCurrentPolygon,
  addPointToPolygonAction,
  editPointAction,
  editPointInPolygonAction,
  addPolygonAction,
  selectPolygons,
  currentPolygonAction,
  deletePolygonAction,
  toolAction,
  extractPolygonDone,
} from 'store/features/planning/slice'
import {
  PlanningPathResponse,
  Waypoint,
  Polygon,
  PlanningTools,
} from 'store/features/planning/types'
import {
  emptyPolygon,
  emptyPolygonSinglePath,
  polygonPaths,
  arcs,
  waypoints,
  withNewWaypoints,
  getPolygonAutomaticName,
} from 'utils/planning/polygonHelpers'

/**
 * SAGAS
 */

/**
 * applies the add point action
 * to the current track
 */
function* addPointToTrack({ payload }: ReturnType<typeof addPointAction>) {
  const polygon: Polygon = yield select(selectCurrentPolygon)
  const polygonId = polygon?.temp_id || polygon?.id
  if (polygonId && polygonId >= 0) {
    const waypoint: Waypoint = {
      longitude: payload.coord.x,
      latitude: payload.coord.y,
      freePoint: payload.coord.isFreePoint,
    }
    const updatedPolygon = withNewWaypoints(
      polygon,
      isNil(payload.atIndex)
        ? append(waypoint, waypoints(polygon))
        : insert(payload.atIndex, waypoint, waypoints(polygon))
    )
    /** retrieve the points */
    const coords = waypoints(updatedPolygon)
    if (!updatedPolygon.isPolygon && coords.length > 1) {
      try {
        const resp: AxiosResponse<PlanningPathResponse> = yield call(
          api.planningPath,
          coords
        )
        const responsePolygon = resp?.data.polygons[0]
        if (arcs(responsePolygon)) {
          yield put(
            addPointToPolygonAction({
              polygonId,
              coord: payload.coord,
              atIndex: payload.atIndex,
              arcs: arcs(responsePolygon),
            })
          )
        } else {
          yield put(
            errorAction(
              new Error(t('planning.errors.arcs', 'arcs not retrieved'))
            )
          )
        }
      } catch (error) {
        yield put(
          errorAction(
            new Error(t('planning.errors.path', 'error retrieving path'))
          )
        )
      }
      return
    }
    /** add without points */
    yield put(
      addPointToPolygonAction({
        polygonId,
        coord: payload.coord,
        atIndex: payload.atIndex,
      })
    )
    return
  }
  console.warn('NO CURRENT TRACK')
}

/**
 * applies the edit point action
 * to the current track
 */
function* editPointInTrack({ payload }: ReturnType<typeof editPointAction>) {
  const polygon: Polygon = yield select(selectCurrentPolygon)
  const polygonId = polygon?.temp_id || polygon?.id
  if (polygonId && polygonId >= 0) {
    const waypoint: Waypoint = {
      longitude: payload.coord.x,
      latitude: payload.coord.y,
      freePoint: payload.coord.isFreePoint,
    }
    const updatedPolygon = withNewWaypoints(
      polygon,
      update(payload.atIndex, waypoint, waypoints(polygon))
    )
    /** retrieve the points */
    const coords = waypoints(updatedPolygon)
    if (!updatedPolygon.isPolygon && coords.length > 1) {
      const resp: AxiosResponse<PlanningPathResponse> = yield call(
        api.planningPath,
        coords
      )
      const responsePolygon = resp?.data.polygons[0]
      if (arcs(responsePolygon)) {
        yield put(
          editPointInPolygonAction({
            polygonId,
            coord: payload.coord,
            atIndex: payload.atIndex,
            arcs: arcs(responsePolygon),
          })
        )
      } else {
        yield put(
          errorAction(
            new Error(t('planning.errors.arcs', 'Arcs not retrieved'))
          )
        )
      }
      return
    }
    yield put(
      editPointInPolygonAction({
        polygonId,
        coord: payload.coord,
        atIndex: payload.atIndex,
      })
    )
    return
  }
  console.warn('NO CURRENT TRACK')
}

/** select the just created track automatically */
function* selectTrackAfterAdd() {
  while (true) {
    yield take(addPolygonAction)
    const polygons: Polygon[] = yield select(selectPolygons)
    try {
      const lastPolygonId = last(polygons)!.temp_id!
      yield put(currentPolygonAction(lastPolygonId))
    } catch (error) {
      console.warn('could not select track automatically')
    }
  }
}

/** deletes empty tracks after deselect */
function* deleteEmtyTrackAfterDeselect() {
  while (true) {
    const {
      payload: currentTrack,
    }: {
      payload: number
    } = yield take(currentPolygonAction)
    if (currentTrack < 0) {
      const tracks: Polygon[] = yield select(selectPolygons)
      tracks.forEach((tr) => {
        const wp = waypoints(tr)
        if (wp.length < 2) {
          console.info(
            `[PLANNING] deleting the polygon, not enough internal tracks ${wp.length}`
          )
          store.dispatch(deletePolygonAction({ id: tr.id || tr.temp_id }))
        }
      })
    }
  }
}

/** select the internal track selection tool if selected a polygon */
function* planningSelectionTool() {
  const currentTrack: Polygon | null = yield select(selectCurrentPolygon)
  if (currentTrack?.isPolygon) {
    const internal = polygonPaths(currentTrack)
    if (!internal?.length) return
    yield put(toolAction(PlanningTools.SELECT_INTERNAL))
  }
}

/** selecting a draw tool without a current track adds an empty track */
function* startWithEmptyTrackOrPolygon({
  payload,
}: ReturnType<typeof toolAction>) {
  if (![PlanningTools.DRAW_PATH, PlanningTools.DRAW_POLYGON].includes(payload))
    return
  const currentTrack: Polygon | null = yield select(selectCurrentPolygon)
  const currentJob: IJob | null = yield select(selectDataStorageCurrentJob)
  if (!currentTrack) {
    const tracks: Polygon[] = yield select(selectPolygons)
    const newTrackName = getPolygonAutomaticName(
      tracks,
      payload === PlanningTools.DRAW_POLYGON
    )
    // const newTrackName = `${t('planning.track', 'scan')}${
    //   tracks.filter((tr) => !tr.isPolygon).length + 1
    // }`
    const newPolygonName = `Polygon${
      tracks.filter((tr) => tr.isPolygon).length + 1
    }`
    const name =
      payload === PlanningTools.DRAW_PATH ? newTrackName : newPolygonName
    const newTrack =
      payload === PlanningTools.DRAW_POLYGON
        ? emptyPolygon(name)
        : emptyPolygonSinglePath(name, currentJob)
    yield put(addPolygonAction(newTrack))
  }
}

export function* planningDrawingSaga() {
  yield takeLatest(addPointAction, addPointToTrack)
  yield takeLatest(editPointAction, editPointInTrack)
  yield takeLatest(
    [currentPolygonAction, extractPolygonDone],
    planningSelectionTool
  )
  yield takeLatest(toolAction, startWithEmptyTrackOrPolygon)
  yield all([fork(selectTrackAfterAdd)])
  yield all([fork(deleteEmtyTrackAfterDeselect)])
}
