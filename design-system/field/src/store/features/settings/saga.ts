// eslint-disable-next-line import/no-extraneous-dependencies
import { all, fork } from 'redux-saga/effects'
import { settingsBackendSaga } from 'store/features/settings/backend/saga'
import { settingsI18nSaga } from 'store/features/settings/i18n/saga'

/**
 * SAGAS
 */

// prettier-ignore
export function* settingsSaga() {
  yield all([fork(settingsBackendSaga)])
  yield all([fork(settingsI18nSaga)])
}
