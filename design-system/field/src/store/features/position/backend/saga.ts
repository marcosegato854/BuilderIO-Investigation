// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { call, put, takeLatest } from 'redux-saga/effects'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/position/api'
import {
  positionGet2ndAntennaSettingsActions,
  positionSatellitesActions,
  positionUpdate2ndAntennaSettingsActions,
} from 'store/features/position/slice'
import {
  Get2ndAntennaSettingsResponse,
  PositionSatellitesResponse,
  Update2ndAntennaSettingsResponse,
} from 'store/features/position/types'

/**
 * SAGAS
 */
function* positionSatellites() {
  try {
    const resp: AxiosResponse<PositionSatellitesResponse> = yield call(
      api.positionSatellites
    )
    yield put(positionSatellitesActions.success(resp.data))
  } catch (e) {
    yield put(positionSatellitesActions.failure())
    yield put(errorAction(e))
  }
}

function* positionGet2ndAntennaSettings() {
  try {
    const resp: AxiosResponse<Get2ndAntennaSettingsResponse> = yield call(
      api.getAntenna2Settings
    )
    yield put(positionGet2ndAntennaSettingsActions.success(resp.data))
  } catch (e) {
    yield put(positionGet2ndAntennaSettingsActions.failure())
    yield put(errorAction(e))
  }
}

function* positionUpdate2ndAntennaSettings({
  payload,
}: ReturnType<typeof positionUpdate2ndAntennaSettingsActions.request>) {
  try {
    const resp: AxiosResponse<Update2ndAntennaSettingsResponse> = yield call(
      api.updateAntenna2Settings,
      payload
    )
    yield put(positionUpdate2ndAntennaSettingsActions.success(resp.data))
  } catch (e) {
    yield put(positionUpdate2ndAntennaSettingsActions.failure())
    yield put(errorAction(e))
  }
}

export function* positionBackendSaga() {
  yield takeLatest(positionSatellitesActions.request, positionSatellites)
  yield takeLatest(
    positionGet2ndAntennaSettingsActions.request,
    positionGet2ndAntennaSettings
  )
  yield takeLatest(
    positionUpdate2ndAntennaSettingsActions.request,
    positionUpdate2ndAntennaSettings
  )
}
