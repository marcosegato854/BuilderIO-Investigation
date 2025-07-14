// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import {
  all,
  call,
  fork,
  put,
  race,
  select,
  take,
  takeLatest,
} from 'redux-saga/effects'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/settings/api'
import {
  selectSettingsState,
  setAdminSettings,
  setAudioSettings,
  setI18nSettings,
  setLastPositionSettings,
  setPlanningSettings,
  settingsGetActions,
  settingsSaveActions,
  setUpdateSettings,
} from 'store/features/settings/slice'
import {
  Settings,
  SettingsGetResponse,
  SettingsSaveResponse,
} from 'store/features/settings/types'

/**
 * SAGAS
 */
function* settingsGet() {
  try {
    const resp: AxiosResponse<SettingsGetResponse> = yield call(api.getSettings)
    yield put(settingsGetActions.success(resp.data))
    const lastScanners = JSON.stringify(resp.data.planning?.scanner || {})
    console.info('[SCANNERS] from settings', lastScanners)
  } catch (e) {
    yield put(settingsGetActions.failure())
    yield put(errorAction(e))
  }
}

function* settingsSave({
  payload,
}: ReturnType<typeof settingsSaveActions.request>) {
  try {
    const resp: AxiosResponse<SettingsSaveResponse> = yield call(
      api.saveSettings,
      payload
    )
    if (resp && resp.data) {
      yield put(settingsSaveActions.success(resp.data))
    } else {
      yield put(settingsSaveActions.failure())
    }
  } catch (e) {
    yield put(settingsSaveActions.failure())
    yield put(errorAction(e))
  }
}

/**
 * Automatically save settings on change
 */
function* saveSettingsOnChange() {
  // TODO: save language on change (set frontend language on save result?)
  while (true) {
    yield race([
      take(setAudioSettings),
      take(setLastPositionSettings),
      take(setPlanningSettings),
      take(setI18nSettings),
      take(setAdminSettings),
      take(setUpdateSettings),
    ])
    const settings: Settings = yield select(selectSettingsState)
    yield put(settingsSaveActions.request(settings))
  }
}

export function* settingsBackendSaga() {
  yield takeLatest(settingsGetActions.request, settingsGet)
  yield takeLatest(settingsSaveActions.request, settingsSave)
  yield all([fork(saveSettingsOnChange)])
}
