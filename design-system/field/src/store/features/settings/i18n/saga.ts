// eslint-disable-next-line import/no-extraneous-dependencies
import i18next from 'i18next'
import { call, delay, put, select, takeLatest } from 'redux-saga/effects'
import { getUserInfoActions, selectIsAdmin } from 'store/features/auth/slice'
import {
  selectI18SettingsState,
  setFont,
  setI18nSettings,
  settingsGetActions,
} from 'store/features/settings/slice'
import { systemInfoActions } from 'store/features/system/slice'
import { getFontFromLanguage, getLanguageFromCountryCode } from 'utils/i18n'

/**
 * SAGAS
 */

/**
 * Update language after getting user settings
 */
function* setLanguage({
  payload,
}: ReturnType<typeof settingsGetActions.success>) {
  if (!payload.i18n) return
  const {
    i18n: { language },
  } = payload
  if (!language) return
  const { language: currentLanguage } = yield select(selectI18SettingsState)
  if (language === currentLanguage) {
    console.info(`[SETTINGS] language is already ${currentLanguage}`)
    if (i18next.language !== language) {
      console.info(`[SETTINGS] force i18n language to ${currentLanguage}`)
      i18next.changeLanguage(language)
    }
    const font = getFontFromLanguage(language)
    console.info(`[SETTINGS] set font to ${font}`)
    yield put(setFont(font))
    return
  }
  console.info(`[SETTINGS] set language to ${language} from settings`)
  yield put(setI18nSettings({ language }))
  const font = getFontFromLanguage(language)
  console.info(`[SETTINGS] set font to ${font} from settings`)
  yield put(setFont(font))
}

/**
 * set i18n language
 */
function* changeLanguage({ payload }: ReturnType<typeof setI18nSettings>) {
  const { language } = payload
  if (!language) return
  console.info(`[SETTINGS] change language to ${language}`)
  yield call(() => {
    i18next.changeLanguage(language)
  })
}

/**
 * set font
 */
function* changeFont({ payload }: ReturnType<typeof setI18nSettings>) {
  const { language } = payload
  if (!language) return
  const font = getFontFromLanguage(language)
  console.info(`[SETTINGS] set font from language to ${font}`)
  yield put(setFont(font))
}

/**
 * set default language from system info
 */
function* setDefaultLanguage({
  payload,
}: ReturnType<typeof systemInfoActions.success>) {
  const { countryCode } = payload
  if (!countryCode) return
  const { language } = yield select(selectI18SettingsState)
  if (language) return
  const newLanguage = getLanguageFromCountryCode(countryCode)
  console.info(
    `[SETTINGS] set default language to ${newLanguage} from system info`
  )
  yield put(setI18nSettings({ language: newLanguage }))
}

/**
 * set default language from system info
 */
function* forceEnglishForAdmin({
  payload,
}: ReturnType<typeof getUserInfoActions.success>) {
  const isAdmin: boolean = yield select(selectIsAdmin)
  if (isAdmin) {
    yield delay(1000)
    console.info('[LANGUAGE] force english for admin')
    i18next.changeLanguage('en')
  }
}

export function* settingsI18nSaga() {
  yield takeLatest(setI18nSettings, changeLanguage)
  yield takeLatest(setI18nSettings, changeFont)
  yield takeLatest(settingsGetActions.success, setLanguage)
  yield takeLatest(systemInfoActions.success, setDefaultLanguage)
  yield takeLatest(getUserInfoActions.success, forceEnglishForAdmin)
}
