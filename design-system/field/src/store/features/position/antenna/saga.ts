// eslint-disable-next-line import/no-extraneous-dependencies
import { lensProp, set } from 'ramda'
import { put, select, takeLatest } from 'redux-saga/effects'
import {
  cameraCalculateAntenna2LeverarmActions,
  cameraGet2ndAntennaClientSettingsActions,
} from 'store/features/camera/slice'
import {
  positionGet2ndAntennaSettingsActions,
  positionUpdate2ndAntennaSettingsActions,
  select2ndAntenna,
} from 'store/features/position/slice'
import { AntennaSettings } from 'store/features/position/types'

/**
 * SAGAS
 */
function* updateAntennaLeverarm({
  payload,
}: ReturnType<typeof cameraCalculateAntenna2LeverarmActions.success>) {
  console.info('[POSITION] update antenna leverarm with calculated value')
  const antennaSettings: AntennaSettings = yield select(select2ndAntenna)
  const updatedSettings = set(
    lensProp('leverarm'),
    payload,
    antennaSettings
  ) as AntennaSettings
  yield put(positionUpdate2ndAntennaSettingsActions.success(updatedSettings))
}

function* syncAntennaClientSettings() {
  console.info('[POSITION] sync client antenna settings')
  yield put(cameraGet2ndAntennaClientSettingsActions.request())
}

export function* positionAntennaSaga() {
  yield takeLatest(
    cameraCalculateAntenna2LeverarmActions.success,
    updateAntennaLeverarm
  )
  yield takeLatest(
    positionGet2ndAntennaSettingsActions.request,
    syncAntennaClientSettings
  )
}
