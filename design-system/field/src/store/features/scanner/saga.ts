// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import {
  all,
  call,
  delay,
  fork,
  put,
  select,
  take,
  takeLatest,
} from 'redux-saga/effects'
import { store } from 'store/configureStore'
import { openDialogAction } from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/scanner/api'
import {
  scannerInfoActions,
  scannerSupportedSettingsActions,
  scannerTemperatureShow,
  selectScannerInfo,
  selectShowTemperature,
} from 'store/features/scanner/slice'
import {
  ScannerInfoResponse,
  ScannerSpecs,
  ScannerSupportedSettingsResponse,
  TemperatureStatus,
} from 'store/features/scanner/types'
import { scannerTemperatureNotifications } from 'store/features/system/notifications/notificationCodes'
import {
  notificationMessageAction,
  notificationRemovalAction,
} from 'store/features/system/slice'
import { SystemNotification } from 'store/features/system/types'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import { Task } from 'redux-saga'

const HIGH_INTERVAL = 10000
const WARNING_INTERVAL = 2000
const STANDARD_INTERVAL = 60000

/* Function to check if in the scanner array a value has a high temperature */
const temperatureStatus = (scanner: ScannerSpecs[]): TemperatureStatus => {
  if (scanner.some((s) => s.temperature?.state === TemperatureStatus.Error)) {
    return TemperatureStatus.Error
  }
  if (scanner.some((s) => s.temperature?.state === TemperatureStatus.Warning)) {
    return TemperatureStatus.Warning
  }
  if (scanner.some((s) => s.temperature?.state === TemperatureStatus.High)) {
    return TemperatureStatus.High
  }
  return TemperatureStatus.Normal
}

/**
 * SAGAS
 */
function* scannerSupportedSettings() {
  try {
    const resp: AxiosResponse<ScannerSupportedSettingsResponse> = yield call(
      api.scannerSupportedSettings
    )
    yield put(scannerSupportedSettingsActions.success(resp.data))
  } catch (e) {
    yield put(scannerSupportedSettingsActions.failure())
    yield put(errorAction(e))
  }
}

function* scannerInfo() {
  try {
    const resp: AxiosResponse<ScannerInfoResponse> = yield call(api.scannerInfo)
    yield put(scannerInfoActions.success(resp.data))
    const scanners = resp.data.scanner.map((s) => s.manufacturer).join(', ')
    console.info(`[SCANNERS] ${scanners}`)
    /* if there's a temperature property, show it */
    if (resp.data.scanner.some((s) => s.temperature)) {
      const { value: temperature1 = 0 } = resp.data.scanner[0].temperature || {}
      const { value: temperature2 = 0 } = resp.data.scanner[1].temperature || {}
      console.info(
        `[SCANNER TEMPERATURE]: Scanner1: ${temperature1} | Scanner2: ${temperature2}`
      )
    }
  } catch (e) {
    yield put(scannerInfoActions.failure())
    yield put(errorAction(e))
  }
}

function* scannerTemperatureNotification() {
  while (true) {
    const { payload }: { payload: SystemNotification } = yield take(
      notificationMessageAction
    )
    if (scannerTemperatureNotifications.includes(payload.code)) {
      console.info(
        '[SCANNER TEMPERATURE] temperature is high, show the notification'
      )
      yield put(scannerTemperatureShow(true))
      const dialogData: any = t(
        `notifications.scannerTemperature.${payload.code}`,
        {
          returnObjects: true,
        }
      )
      const notificationInterval =
        payload.code === 'SCN-072' ? HIGH_INTERVAL : WARNING_INTERVAL
      /* request to check the GET api for the scanner, 10 seconds if high, 2 seconds if warning */
      console.info(
        `[SCANNER TEMPERATURE] start checking the temperature every ${
          notificationInterval / 1000
        } seconds`
      )
      yield fork(startScannerTemperatureRequest, notificationInterval)
      if (dialogData) {
        const { title, text, okButton } = dialogData
        const alertType: { [key: string]: 'error' | 'warning' | 'message' } = {
          'SCN-070': 'error',
          'SCN-071': 'warning',
          'SCN-072': 'message',
        }
        /* this handles the high temperature */
        store.dispatch(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: {
              type: alertType[payload.code],
              variant: 'colored',
              title,
              text,
              okButtonLabel: okButton,
            } as IAlertProps,
          })
        )
      }
    }
  }
}

/** Check if a removal notification is sent:
 * - if it's removing the high temperature notification, it will stop the request
 * - if it's removing the warning temperature notification, it will request the GET api for the scanner every 10 seconds
 * - if it's removing the error temperature notification, it will request the GET api for the scanner every 2 seconds
 */
function* scannerTemperatureRemoveNotification() {
  while (true) {
    const { payload }: { payload: SystemNotification } = yield take(
      notificationRemovalAction
    )
    if (scannerTemperatureNotifications.includes(payload.code)) {
      if (payload.code === 'SCN-072') {
        console.info(
          '[SCANNER TEMPERATURE] temperature is back on save values. Remove the notification'
        )
        yield put(scannerTemperatureShow(false))
      }
      if (payload.code === 'SCN-071') {
        console.info(
          '[SCANNER  TEMPERATURE] temperature is high, check is every 10 secs from now'
        )
        yield fork(startScannerTemperatureRequest, HIGH_INTERVAL)
      }
      if (payload.code === 'SCN-070') {
        console.info(
          '[SCANNER  TEMPERATURE] temperature is in warning state, check is every 2 secs from now'
        )
        yield fork(startScannerTemperatureRequest, WARNING_INTERVAL)
      }
    }
  }
}

/** Check for temperature alerts
 * conditions: the scanner info is retrived and the temperature is shown
 * if the temperature is high, check every 10 seconds
 * if the temperature is in warning state, check every 2 seconds
 */
function* scannerTemperatureCheckOnRefresh() {
  while (true) {
    /* if the temperature is not shown, check for warnings */
    const isScannerTemperatureShow: boolean = yield select(
      selectShowTemperature
    )
    if (!isScannerTemperatureShow) {
      const scannerInfo: ScannerSpecs[] = yield select(selectScannerInfo)
      if (scannerInfo && scannerInfo.length) {
        if (
          temperatureStatus(scannerInfo) === TemperatureStatus.Error ||
          temperatureStatus(scannerInfo) === TemperatureStatus.Warning
        ) {
          console.info(
            '[SCANNER  TEMPERATURE] temperature is in warning state, check is every 2 secs from now'
          )
          yield put(scannerTemperatureShow(true))
          yield fork(startScannerTemperatureRequest, WARNING_INTERVAL)
        } else if (temperatureStatus(scannerInfo) === TemperatureStatus.High) {
          console.info(
            '[SCANNER  TEMPERATURE] temperature is high, check is every 10 secs from now'
          )
          yield put(scannerTemperatureShow(true))
          yield fork(startScannerTemperatureRequest, HIGH_INTERVAL)
        } else if (
          temperatureStatus(scannerInfo) === TemperatureStatus.Normal
        ) {
          console.info(
            '[SCANNER  TEMPERATURE] temperature is normal, no need to check'
          )
        }
      }
    } else break
    yield delay(5000)
  }
}

/** GET api for the scanner info:
 * we need a task to control the istances of the request
 * and delete it when it's not needed anymore
 *  */
let scannerTemperatureTask: Task | undefined

function* scannerTemperatureRequest(time?: number) {
  while (true) {
    const isScannerTemperatureShow: boolean = yield select(
      selectShowTemperature
    )
    if (!isScannerTemperatureShow) {
      break
    }
    yield put(scannerInfoActions.request())
    yield delay(time || STANDARD_INTERVAL)
  }
}

function* startScannerTemperatureRequest(time?: number) {
  if (scannerTemperatureTask) {
    yield scannerTemperatureTask.cancel()
  }
  scannerTemperatureTask = yield fork(scannerTemperatureRequest, time)
}

export function* scannerSaga() {
  yield takeLatest(
    scannerSupportedSettingsActions.request,
    scannerSupportedSettings
  )
  yield takeLatest(scannerInfoActions.request, scannerInfo)
  yield all([fork(scannerTemperatureNotification)])
  yield all([fork(scannerTemperatureCheckOnRefresh)])
  yield all([fork(scannerTemperatureRemoveNotification)])
  yield all([fork(scannerTemperatureRequest)])
}
