import { AxiosResponse } from 'axios'
import { t } from 'i18n/config'
import { call, put, select, takeLatest } from 'redux-saga/effects'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/planning/api'
import {
  deletePlannedJobActions,
  extractPolygonInfoActions,
  extractPolygonStartActions,
  getPlannedJobActions,
  importShpInfoActions,
  importShpStartActions,
  listShpInfoActions,
  listShpStartActions,
  processingInfoPlanActions,
  savePlannedJobActions,
  selectCurrentPolygon,
  selectcurrentInternalPathId,
  splitActions,
  splitInternalPathActions,
  startProcessingPlanActions,
  toolAction,
  updatePlannedJobActions,
} from 'store/features/planning/slice'
import {
  ExtractPolygonResponse,
  ImportShpResponse,
  ListShpResponse,
  PlanningDeletePlanResponse,
  PlanningGetPlanResponse,
  PlanningProcessInfoResponse,
  PlanningProcessStartResponse,
  PlanningSavePlanResponse,
  PlanningSplitRequest,
  PlanningSplitResponse,
  PlanningTools,
  PlanningUpdatePlanResponse,
  Polygon,
} from 'store/features/planning/types'
import { composeErrorString, extractErrorStatusCode } from 'utils/errors'
import { polygonPaths } from 'utils/planning/polygonHelpers'

/**
 * SAGAS
 */

function* plannedJobsGet({
  payload,
}: ReturnType<typeof getPlannedJobActions.request>) {
  try {
    const resp: AxiosResponse<PlanningGetPlanResponse> = yield call(
      api.planningGetPlan,
      payload
    )
    yield put(getPlannedJobActions.success(resp.data))
  } catch (e) {
    yield put(getPlannedJobActions.failure(e as Error))
    const statusCode = extractErrorStatusCode(e)
    if (statusCode === 404) return
    yield put(errorAction(e))
  }
}

function* plannedJobsSave({
  payload,
}: ReturnType<typeof savePlannedJobActions.request>) {
  try {
    console.info('[PLANNING] plannedJobsSave')
    const resp: AxiosResponse<PlanningSavePlanResponse> = yield call(
      api.planningSavePlan,
      payload
    )
    yield put(savePlannedJobActions.success(resp.data))
  } catch (e) {
    yield put(savePlannedJobActions.failure(e as Error))
    // the error should be dispatched with the action and then handled by another saga
  }
}

function* plannedJobsUpdate({
  payload,
}: ReturnType<typeof updatePlannedJobActions.request>) {
  try {
    console.info('[PLANNING] plannedJobsUpdate')
    const resp: AxiosResponse<PlanningUpdatePlanResponse> = yield call(
      api.planningUpdatePlan,
      payload
    )
    yield put(updatePlannedJobActions.success(resp.data))
  } catch (e) {
    yield put(updatePlannedJobActions.failure(e))
  }
}

function* plannedJobsDelete({
  payload,
}: ReturnType<typeof deletePlannedJobActions.request>) {
  try {
    const resp: AxiosResponse<PlanningDeletePlanResponse> = yield call(
      api.planningDeletePlan,
      payload
    )
    yield put(deletePlannedJobActions.success(resp.data))
  } catch (e) {
    yield put(deletePlannedJobActions.failure())
    yield put(errorAction(e))
  }
}

function* startProcessing({
  payload,
}: ReturnType<typeof startProcessingPlanActions.request>) {
  try {
    console.info('[PLANNING] startProcessing')
    // yield put({ type: 'POLLING_START_RECORDING_STOP' }) // stop polling
    const resp: AxiosResponse<PlanningProcessStartResponse> = yield call(
      api.planningProcessStart,
      payload
    )
    if (resp.data.action.status === 'error') {
      yield put(
        startProcessingPlanActions.failure(
          new Error(
            composeErrorString('Processing failed', resp.data.action.errors)
          )
        )
      )
    } else {
      yield put(startProcessingPlanActions.success(resp.data))
    }
  } catch (e) {
    yield put(startProcessingPlanActions.failure(e as Error))
    yield put(errorAction(e))
  }
}

function* processingInfo() {
  try {
    const resp: AxiosResponse<PlanningProcessInfoResponse> = yield call(
      api.planningProcessInfo
    )
    if (resp.data.action.status === 'error') {
      yield put(
        startProcessingPlanActions.failure(
          new Error(
            composeErrorString('Processing failed', resp.data.action.errors)
          )
        )
      )
    } else {
      yield put(processingInfoPlanActions.success(resp.data))
    }
  } catch (e) {
    yield put(processingInfoPlanActions.failure(e as Error))
    // yield put(errorAction(e))
  }
}

function* extractTracksStart({
  payload,
}: ReturnType<typeof extractPolygonStartActions.request>) {
  try {
    // yield put({ type: 'POLLING_START_RECORDING_STOP' }) // stop polling
    const resp: AxiosResponse<ExtractPolygonResponse> = yield call(
      api.planningExtractPolygonStart,
      payload
    )
    if (resp.data.action.status === 'error') {
      yield put(extractPolygonStartActions.failure())
      yield put(
        errorAction(
          new Error(
            composeErrorString('Extraction failed', resp.data.action.errors)
          )
        )
      )
    } else {
      yield put(extractPolygonStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(extractPolygonStartActions.failure())
    yield put(errorAction(e))
  }
}

function* extractTracksInfo() {
  try {
    const resp: AxiosResponse<ExtractPolygonResponse> = yield call(
      api.planningExtractPolygonInfo
    )
    if (resp.data.action.status === 'error') {
      yield put(extractPolygonInfoActions.failure())
      yield put(
        errorAction(
          new Error(
            composeErrorString('Extraction failed', resp.data.action.errors)
          )
        )
      )
    } else {
      yield put(extractPolygonInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(extractPolygonInfoActions.failure())
    yield put(errorAction(e))
  }
}

function* importShpStart({
  payload,
}: ReturnType<typeof importShpStartActions.request>) {
  try {
    // yield put({ type: 'POLLING_START_RECORDING_STOP' }) // stop polling
    const resp: AxiosResponse<ImportShpResponse> = yield call(
      api.planningImportShpStart,
      payload
    )
    if (resp.data.action.status === 'error') {
      yield put(importShpStartActions.failure())
      yield put(
        errorAction(
          new Error(
            composeErrorString(
              t('planning.errors.shp_failed', 'Import SHP failed'),
              resp.data.action.errors
            )
          )
        )
      )
    } else {
      yield put(importShpStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(importShpStartActions.failure())
    yield put(errorAction(e))
  }
}

function* importShpInfo() {
  try {
    const resp: AxiosResponse<ImportShpResponse> = yield call(
      api.planningImportShpInfo
    )
    if (resp.data.action.status === 'error') {
      yield put(importShpInfoActions.failure())
      yield put(
        errorAction(
          new Error(
            composeErrorString(
              t('planning.errors.shp_failed', 'Import SHP failed'),
              resp.data.action.errors
            )
          )
        )
      )
    } else {
      yield put(importShpInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(importShpInfoActions.failure())
    yield put(errorAction(e))
  }
}

function* listShpStart() {
  try {
    // yield put({ type: 'POLLING_START_RECORDING_STOP' }) // stop polling
    const resp: AxiosResponse<ListShpResponse> = yield call(
      api.planningListShpStart
    )
    if (resp.data.action.status === 'error') {
      yield put(listShpStartActions.failure())
      yield put(
        errorAction(
          new Error(
            composeErrorString(
              t('planning.errors.shp_list_failed', 'list SHP failed'),
              resp.data.action.errors
            )
          )
        )
      )
    } else {
      yield put(listShpStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(listShpStartActions.failure())
    yield put(errorAction(e))
  }
}

function* listShpInfo() {
  try {
    const resp: AxiosResponse<ListShpResponse> = yield call(
      api.planningListShpInfo
    )
    if (resp.data.action.status === 'error') {
      yield put(listShpInfoActions.failure())
      yield put(
        errorAction(
          new Error(
            composeErrorString(
              t('planning.errors.shp_list_failed', 'list SHP failed'),
              resp.data.action.errors
            )
          )
        )
      )
    } else {
      yield put(listShpInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(listShpInfoActions.failure())
    yield put(errorAction(e))
  }
}

function* splitTrack({ payload }: ReturnType<typeof splitActions.request>) {
  const polygon: Polygon = yield select(selectCurrentPolygon)
  // TODO: PLANNING - handle split track in polygon
  /* if (polygon.isPolygon) {
    yield put(splitActions.failure())
    yield put(
      errorAction(new Error('Split track in polygon not supported yet'))
    )
    return
  } */
  yield put(toolAction(PlanningTools.SELECT))
  const req: PlanningSplitRequest = {
    polygons: [polygon],
    splitPolygon: 0,
    splitPath: 0,
    splitPoint: payload.splitPoint,
  }
  try {
    const resp: AxiosResponse<PlanningSplitResponse> = yield call(
      api.planningSplit,
      req
    )
    const {
      data: { polygons: tracks },
    } = resp
    yield put(
      splitActions.success({
        polygon,
        polygons: tracks,
      })
    )
  } catch (e) {
    yield put(splitActions.failure())
    yield put(errorAction(e))
  }
}

function* splitInternalTrack({
  payload,
}: ReturnType<typeof splitInternalPathActions.request>) {
  const polygon: Polygon = yield select(selectCurrentPolygon)
  const internalTrackId: number = yield select(selectcurrentInternalPathId)
  const internal = polygonPaths(polygon)
  if (!internal) return
  const path = internal.find((p) => p.id === internalTrackId)
  if (!path) return
  /* const points = archsToPos3D(arcs(path))
  const nearest: Point = findNearest(
    { latitude: clicked.latitude, longitude: clicked.longitude },
    points.map((p) => ({ latitude: p.y, longitude: p.x }))
  ) as Point
  const paths = splitPath(path, nearest) */
  yield put(toolAction(PlanningTools.SELECT_INTERNAL))
  const polygonFiltered: Polygon = {
    ...polygon,
    paths: [path],
  }
  const req: PlanningSplitRequest = {
    polygons: [polygonFiltered],
    splitPolygon: 0,
    splitPath: 0,
    splitPoint: payload.splitPoint,
  }

  try {
    const resp: AxiosResponse<PlanningSplitResponse> = yield call(
      api.planningSplit,
      req
    )
    const {
      data: { polygons: tracks },
    } = resp
    yield put(
      splitActions.success({
        polygon: polygonFiltered,
        polygons: tracks,
      })
    )
  } catch (e) {
    yield put(splitActions.failure())
    yield put(errorAction(e))
  }
}

export function* planningBackendSaga() {
  yield takeLatest(getPlannedJobActions.request, plannedJobsGet)
  yield takeLatest(savePlannedJobActions.request, plannedJobsSave)
  yield takeLatest(updatePlannedJobActions.request, plannedJobsUpdate)
  yield takeLatest(deletePlannedJobActions.request, plannedJobsDelete)
  yield takeLatest(startProcessingPlanActions.request, startProcessing)
  yield takeLatest(processingInfoPlanActions.request, processingInfo)
  yield takeLatest(extractPolygonStartActions.request, extractTracksStart)
  yield takeLatest(extractPolygonInfoActions.request, extractTracksInfo)
  yield takeLatest(importShpStartActions.request, importShpStart)
  yield takeLatest(importShpInfoActions.request, importShpInfo)
  yield takeLatest(listShpStartActions.request, listShpStart)
  yield takeLatest(listShpInfoActions.request, listShpInfo)
  yield takeLatest(splitActions.request, splitTrack)
  yield takeLatest(splitInternalPathActions.request, splitInternalTrack)
}
