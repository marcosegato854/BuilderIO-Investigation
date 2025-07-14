// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import {
  all,
  call,
  delay,
  fork,
  put,
  race,
  select,
  take,
  takeLatest,
} from 'redux-saga/effects'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import api from 'store/features/system/api'
import {
  CheckUpdate,
  UpdateActionResponse,
  UpdatePrepareActionResponse,
} from 'store/features/system/types'
import { composeErrorString, translateError } from 'utils/errors'
import {
  selectCheckUpdate,
  selectCheckUpdateError,
  selectInternetIsActive,
  systemCheckUpdateActions,
  systemResponsivenessActions,
  systemUpdateActionInfo,
  systemUpdateActionStart,
  systemUpdatePrepareActionInfo,
  systemUpdatePrepareActionStart,
} from '../slice'

/**
 * SAGAS
 */

/**
 * error starting processing
 */
function* updatePrepareError(description?: string, error?: unknown) {
  const messages = [description]
  if (error) messages.push(translateError(error))
  const message = messages.join(' - ')
  yield put(
    openDialogAction({
      component: DialogNames.Alert,
      componentProps: {
        type: 'error',
        variant: 'colored',
        okButtonLabel: 'OK',
        title: t('planning.title', 'Extract Tracks'),
        text: message,
      } as IAlertProps,
    })
  )
  yield take(closeDialogAction)
}

function* updateDialogHandler() {
  yield put(
    openDialogAction({
      component: DialogNames.UpdateDialog,
    })
  )
}

/**
 * starts polling for start processing status
 */
function* updatePreparePollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<UpdatePrepareActionResponse> = yield call(
        api.updatePrepareActionInfo
      )
      console.info('[UPDATEPREPARE] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        // yield call(
        //   updatePrepareError,
        //   composeErrorString(
        //     'Update prepare failed',
        //     response.data.action.errors
        //   )
        // )
        // TODO: handle errors
        yield put(systemUpdatePrepareActionInfo.success(response.data))
        yield put(systemUpdatePrepareActionInfo.failure())
        break
      } else if (response.data?.action?.status === 'done') {
        // startProcessing done
        yield put(systemUpdatePrepareActionInfo.success(response.data))
        yield call(updateDialogHandler)
        break
      } else if (response.data?.action?.status === 'abort') {
        console.info('[UPDATEPREPARE] aborted')
        break
      } else {
        // not yet, update progress
        yield put(systemUpdatePrepareActionInfo.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(systemUpdatePrepareActionInfo.failure())
      // yield call(updatePrepareError, 'Update prepare polling error', e)
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * starts polling for start processing status
 */
function* updatePollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<UpdateActionResponse> = yield call(
        api.updateActionInfo
      )
      console.info('[UPDATE] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        // TODO: handle errors
        yield put(systemUpdateActionInfo.success(response.data))
        yield put(systemUpdateActionInfo.failure())
        break
      } else if (response.data?.action?.status === 'done') {
        // startProcessing done
        yield put(systemUpdateActionInfo.success(response.data))
        break
      } else if (response.data?.action?.status === 'abort') {
        console.info('[UPDATE] aborted')
        break
      } else {
        // not yet, update progress
        yield put(systemUpdateActionInfo.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(systemUpdateActionInfo.failure())
      // yield call(updatePrepareError, 'Update prepare polling error', e)
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* updatePreparePollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: UpdatePrepareActionResponse
    } = yield take(systemUpdatePrepareActionStart.success)
    console.info('[UPDATEPREPARE] status', action.status)
    if (action.status !== 'error') {
      console.info('[UPDATEPREPARE] start polling')
      // wait for successful startProcessing
      yield race([
        call(updatePreparePollSagaWorker),
        take('POLLING_START_UPDATEPREPARE_STOP'), // actually nobody dispatches this action
      ])
    } else {
      yield call(
        updatePrepareError,
        composeErrorString('Extraction failed', action.errors)
      )
      console.info('[UPDATEPREPARE] no polling needed', action.status)
    }
  }
}

/**
 * Saga watcher.
 */
function* updatePollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: UpdateActionResponse
    } = yield take(systemUpdateActionStart.success)
    console.info('[UPDATE] status', action.status)
    if (action.status !== 'error') {
      console.info('[UPDATE] start polling')
      // wait for successful startProcessing
      yield race([
        call(updatePollSagaWorker),
        take('POLLING_START_UPDATE_STOP'), // actually nobody dispatches this action
      ])
    } else {
      yield call(
        updatePrepareError,
        composeErrorString('Extraction failed', action.errors)
      )
      console.info('[UPDATE] no polling needed', action.status)
    }
  }
}

function* checkForUpdates() {
  const internetIsActive: boolean = yield select(selectInternetIsActive)
  if (internetIsActive) {
    const checkUpdate: CheckUpdate = yield select(selectCheckUpdate)
    if (checkUpdate) return
    const checkUpdateError: boolean = yield select(selectCheckUpdateError)
    if (checkUpdateError) return
    yield put(systemCheckUpdateActions.request({ userRequest: false }))
  }
}

export function* updatePollSaga() {
  yield all([fork(updatePreparePollSagaWatcher)])
  yield all([fork(updatePollSagaWatcher)])
  // yield takeLatest(extractTracksStartActions.request, startProcessing)
  yield takeLatest(systemResponsivenessActions.success, checkForUpdates)
}
