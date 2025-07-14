// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { call, put, takeLatest } from 'redux-saga/effects'
import {
  cameraCalculateAntenna2LeverarmActions,
  cameraDisplayableNamesActions,
  cameraExposureActions,
  cameraExposureSetActions,
  cameraGet2ndAntennaClientSettingsActions,
  cameraSnapshotActions,
  cameraTriggerActions,
  cameraTriggerDistanceSetActions,
  cameraTriggerToggleActions,
  cameraUpdate2ndAntennaClientSettingsActions,
} from 'store/features/camera/slice'
import {
  DisplayableCameraNamesResponse,
  CameraExposureResponse,
  CameraTriggerResponse,
  CalculateAntenna2LeverarmResponse,
  Get2ndAntennaClientSettingsResponse,
  Update2ndAntennaClientSettingsResponse,
} from 'store/features/camera/types'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/camera/api'

/**
 * SAGAS
 */
function* cameraDisplayableNames() {
  try {
    const resp: AxiosResponse<DisplayableCameraNamesResponse> = yield call(
      api.displayableCameraNames
    )
    yield put(cameraDisplayableNamesActions.success(resp.data))
  } catch (e) {
    yield put(cameraDisplayableNamesActions.failure())
    yield put(errorAction(e))
  }
}

function* cameraExposure() {
  try {
    const resp: AxiosResponse<CameraExposureResponse> = yield call(
      api.cameraExposure
    )
    yield put(cameraExposureActions.success(resp.data))
  } catch (e) {
    yield put(cameraExposureActions.failure())
    yield put(errorAction(e))
  }
}

function* cameraSetExposure({
  payload,
}: ReturnType<typeof cameraExposureSetActions.request>) {
  try {
    const resp: AxiosResponse<CameraExposureResponse> = yield call(
      api.cameraSetExposure,
      payload
    )
    yield put(cameraExposureSetActions.success(resp.data))
  } catch (e) {
    yield put(cameraExposureSetActions.failure())
    yield put(errorAction(e))
  }
}

function* cameraTrigger() {
  try {
    const resp: AxiosResponse<CameraTriggerResponse> = yield call(
      api.cameraTrigger
    )
    yield put(cameraTriggerActions.success(resp.data))
  } catch (e) {
    yield put(cameraTriggerActions.failure())
    yield put(errorAction(e))
  }
}

function* cameraSetDistance({
  payload,
}: ReturnType<typeof cameraTriggerDistanceSetActions.request>) {
  try {
    const resp: AxiosResponse<CameraTriggerResponse> = yield call(
      api.cameraSetDistance,
      payload
    )
    yield put(cameraTriggerDistanceSetActions.success(resp.data))
  } catch (e) {
    yield put(cameraTriggerDistanceSetActions.failure())
    yield put(errorAction(e))
  }
}

function* cameraToggle({
  payload,
}: ReturnType<typeof cameraTriggerToggleActions.request>) {
  try {
    const resp: AxiosResponse<CameraTriggerResponse> = yield call(
      api.cameraTriggerToggle,
      payload
    )
    yield put(cameraTriggerToggleActions.success(resp.data))
  } catch (e) {
    yield put(cameraTriggerToggleActions.failure())
    yield put(errorAction(e))
  }
}

function* cameraGet2ndAntennaClientSettings() {
  try {
    const resp: AxiosResponse<Get2ndAntennaClientSettingsResponse> = yield call(
      api.getAntenna2ClientSettings
    )
    yield put(cameraGet2ndAntennaClientSettingsActions.success(resp.data))
  } catch (e) {
    yield put(cameraGet2ndAntennaClientSettingsActions.failure())
    yield put(errorAction(e))
  }
}

function* cameraUpdate2ndAntennaClientSettings({
  payload,
}: ReturnType<typeof cameraUpdate2ndAntennaClientSettingsActions.request>) {
  try {
    console.info('[CAMERA] update antenna client settings with', payload)
    const resp: AxiosResponse<Update2ndAntennaClientSettingsResponse> =
      yield call(api.updateAntenna2ClientSettings, payload)
    yield put(cameraUpdate2ndAntennaClientSettingsActions.success(resp.data))
  } catch (e) {
    yield put(cameraUpdate2ndAntennaClientSettingsActions.failure())
    yield put(errorAction(e))
  }
}

function* cameraCalculateAntenna2Leverarm({
  payload,
}: ReturnType<typeof cameraCalculateAntenna2LeverarmActions.request>) {
  try {
    const resp: AxiosResponse<CalculateAntenna2LeverarmResponse> = yield call(
      api.calculateLeverarm,
      payload
    )
    yield put(cameraCalculateAntenna2LeverarmActions.success(resp.data))
  } catch (e) {
    yield put(cameraCalculateAntenna2LeverarmActions.failure())
    yield put(errorAction(e))
  }
}

function* cameraSnapshot() {
  try {
    yield call(api.takeSnapshot)
    yield put(cameraSnapshotActions.success())
  } catch (e) {
    yield put(cameraSnapshotActions.failure())
    yield put(errorAction(e))
  }
}

export function* cameraSaga() {
  yield takeLatest(
    cameraDisplayableNamesActions.request,
    cameraDisplayableNames
  )
  yield takeLatest(cameraExposureActions.request, cameraExposure)
  yield takeLatest(cameraExposureSetActions.request, cameraSetExposure)
  yield takeLatest(cameraTriggerActions.request, cameraTrigger)
  yield takeLatest(cameraTriggerDistanceSetActions.request, cameraSetDistance)
  yield takeLatest(cameraTriggerToggleActions.request, cameraToggle)
  yield takeLatest(
    cameraGet2ndAntennaClientSettingsActions.request,
    cameraGet2ndAntennaClientSettings
  )
  yield takeLatest(
    cameraUpdate2ndAntennaClientSettingsActions.request,
    cameraUpdate2ndAntennaClientSettings
  )
  yield takeLatest(
    cameraCalculateAntenna2LeverarmActions.request,
    cameraCalculateAntenna2Leverarm
  )
  yield takeLatest(cameraSnapshotActions.request, cameraSnapshot)
}
