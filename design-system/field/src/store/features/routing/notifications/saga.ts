// eslint-disable-next-line import/no-extraneous-dependencies
import { put, select, takeLatest } from 'redux-saga/effects'
import {
  autocaptureCurrentPathActions,
  autocaptureNeededActions,
  autocapturePolygonsActions,
  autocaptureStatusActions,
  routingMessageAction,
  routingPolylineActions,
  routingStatusActions,
  selectAutocaptureEnabled,
} from 'store/features/routing/slice'
import { isMessage } from 'store/features/routing/types'
import {
  stateMessageAction,
  systemStateActions,
} from 'store/features/system/slice'
import { activatedStates } from 'store/features/system/types'

/**
 * SAGAS
 */

function* updateRoutingTracksAtChange({
  payload,
}: ReturnType<typeof routingMessageAction>) {
  const autocaptureEnabled: boolean = yield select(selectAutocaptureEnabled)
  if (!autocaptureEnabled) return
  if (!isMessage(payload)) return
  const { code } = payload.data
  if (code === 'AC-001') {
    console.info('[ROUTING] tracks update, refresh list and current path')
    yield put(autocapturePolygonsActions.request())
    yield put(autocaptureCurrentPathActions.request())
  }
}

function* updateRoutingEstimations({
  payload,
}: ReturnType<typeof routingMessageAction>) {
  const autocaptureEnabled: boolean = yield select(selectAutocaptureEnabled)
  if (!autocaptureEnabled) return
  if (!isMessage(payload)) return
  const { code } = payload.data
  if (code === 'ROU-004') {
    console.info('[ROUTING] real time estimations changed, refresh from API')
    yield put(autocaptureNeededActions.request())
  }
}

function* updateRoutingEnabled({
  payload,
}: ReturnType<typeof routingMessageAction>) {
  if (!isMessage(payload)) return
  const { code } = payload.data
  if (code === 'ROU-005') {
    console.warn('[ROUTING] status changed, getting new from api')
    yield put(routingStatusActions.request())
  }
}

function* updateAutocaptureEnabled({
  payload,
}: ReturnType<typeof routingMessageAction>) {
  if (!isMessage(payload)) return
  const { code } = payload.data
  if (code === 'AC-001') {
    console.warn('[AUTOCAPTURE] status changed, getting new from api')
    yield put(autocaptureStatusActions.request())
  }
}

function* updateRoutingPolyline({
  payload,
}: ReturnType<typeof routingMessageAction>) {
  if (!isMessage(payload)) return
  const { code } = payload.data
  if (code === 'ROU-006') {
    console.info('[ROUTING] routing polyline changed')
    yield put(routingPolylineActions.request())
  }
}

function* updateCurrentTrackIfLogging({
  payload,
}: ReturnType<typeof systemStateActions.success>) {
  const { state } = payload
  const autocaptureEnabled: boolean = yield select(selectAutocaptureEnabled)
  if (!autocaptureEnabled) return
  if (activatedStates.includes(state)) {
    console.info('[AUTOCAPTURE] status is recording, refresh tracks list')
    yield put(autocapturePolygonsActions.request())
    console.info('[AUTOCAPTURE] status is recording, refresh current path')
    yield put(autocaptureCurrentPathActions.request())
  }
}

export function* autocaptureNotificationsSaga() {
  // TODO: move these three in routing slice
  yield takeLatest(routingMessageAction, updateRoutingTracksAtChange)
  yield takeLatest(routingMessageAction, updateRoutingEstimations)
  yield takeLatest(routingMessageAction, updateRoutingEnabled)
  yield takeLatest(routingMessageAction, updateAutocaptureEnabled)
  yield takeLatest(routingMessageAction, updateRoutingPolyline)
  yield takeLatest(
    [systemStateActions.success, stateMessageAction],
    updateCurrentTrackIfLogging
  )
}
