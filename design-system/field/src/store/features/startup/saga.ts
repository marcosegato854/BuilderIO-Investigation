import { put, race, select, take, takeLatest } from 'redux-saga/effects'
import { alignmentStatusActions } from 'store/features/alignment/slice'
import {
  getUserInfoActions,
  loginActions,
  selectIsLoggedIn,
} from 'store/features/auth/slice'
import { cameraDisplayableNamesActions } from 'store/features/camera/slice'
import {
  dataStorageAvailableDisksActions,
  dataStorageConfigActions,
  dataStorageJobTypesActions,
  dataStorageProcessingStatusActions,
} from 'store/features/dataStorage/slice'
import { errorAction } from 'store/features/errors/slice'
import {
  startupAction,
  visibilityChangeAction,
} from 'store/features/global/slice'
import { positionSatellitesActions } from 'store/features/position/slice'
import {
  resetScannerStore,
  scannerInfoActions,
  scannerSupportedSettingsActions,
} from 'store/features/scanner/slice'
import { settingsGetActions } from 'store/features/settings/slice'
import {
  checkResponsivenessAction,
  modulesActions,
  notificationsSubscribeAction,
  stateSubscribeAction,
  systemCheckUpdateActions,
  systemInfoActions,
  systemNotificationsActions,
  systemReleaseTagActions,
  systemStateActions,
  updateInfoActions,
} from 'store/features/system/slice'

/**
 * SAGAS
 */

/**
 * Execute these actions if the user is logged in
 */
function* startupCalls() {
  console.info('[STARTUP] begin')
  try {
    yield put(modulesActions.request()) // load modules
    const [successResponse]: [
      ReturnType<typeof modulesActions.success> | undefined
    ] = yield race([take(modulesActions.success), take(modulesActions.failure)])
    if (!successResponse) {
      console.warn('[STARTUP] modules failed')
      // eslint-disable-next-line no-alert
      // alert('modules failed to load')
      const error = new Error('modules failed to load')
      yield put(errorAction(error))
      return
    }
    yield put(resetScannerStore()) // reset scanner store
    console.info(`[STARTUP] modules loaded ${successResponse.payload.modules}`)
    const isLoggedIn: boolean = yield select(selectIsLoggedIn)
    const savedToken: string = yield localStorage.getItem('PEF_token')
    console.info('[STARTUP] isLoggedIn', isLoggedIn || !!savedToken)
    if (isLoggedIn || !!savedToken) {
      yield put(systemReleaseTagActions.request()) // load release tag
      yield put(settingsGetActions.request()) // load settings
      yield put(getUserInfoActions.request()) // load user info
      yield put(scannerSupportedSettingsActions.request()) // load scanner suppoerted settings
      yield put(dataStorageConfigActions.request()) // load job types
      yield put(dataStorageJobTypesActions.request()) // load datastorage config
      yield put(positionSatellitesActions.request()) // load satellites
      yield put(systemStateActions.request()) // load system state
      yield put(systemInfoActions.request()) // load system info
      yield put(dataStorageAvailableDisksActions.request()) // load available disks
      yield put(scannerInfoActions.request()) // load scanners
      yield put(systemNotificationsActions.request()) // load system notifications
      yield put(checkResponsivenessAction()) // load responsiveness info
      yield put(cameraDisplayableNamesActions.request()) // load displayableCameras
      yield put(dataStorageProcessingStatusActions.request()) // load processing status
      yield put(alignmentStatusActions.request()) // load routing alignment status
      yield put(updateInfoActions.request()) //load update info
      yield put(stateSubscribeAction())//start socket state notifications
      yield put(notificationsSubscribeAction())//start socket state notifications 
      // yield put(systemCheckUpdateActions.request({ userRequest: false })) // load check update
    } else {
      yield put(settingsGetActions.request()) // load settings
      yield put(systemReleaseTagActions.request()) // load release tag
    }
  } catch (e) {
    console.error(e)
  }
}

function* updateOnAppVisible({
  payload,
}: ReturnType<typeof visibilityChangeAction>) {
  console.info(`[STARTUP] visibility: ${payload}`)
  if (payload === 'hidden') return
  yield put(systemStateActions.request()) // load system state
  yield put(dataStorageProcessingStatusActions.request()) // load processing status
}

export function* startupSaga() {
  yield takeLatest([startupAction, loginActions.success], startupCalls)
  yield takeLatest(visibilityChangeAction, updateOnAppVisible)
}
