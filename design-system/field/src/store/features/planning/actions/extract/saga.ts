// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import { composeErrorString, translateError } from 'utils/errors'
import { all, call, delay, fork, put, race, take } from 'redux-saga/effects'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import api from 'store/features/planning/api'
import {
  extractPolygonInfoActions,
  extractPolygonStartActions,
} from 'store/features/planning/slice'
import {
  ExtractPolygonResponse,
  PlanningProcessInfoResponse,
} from 'store/features/planning/types'

/**
 * SAGAS
 */

/**
 * error starting processing
 */
function* extractError(description?: string, error?: unknown) {
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

/**
 * starts polling for start processing status
 */
function* extractPollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<ExtractPolygonResponse> = yield call(
        api.planningExtractPolygonInfo
      )
      console.info('[EXTRACT] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        yield call(
          extractError,
          composeErrorString('Extraction failed', response.data.action.errors)
        )
        yield put(extractPolygonInfoActions.failure())
        break
      } else if (response.data?.action?.status === 'done') {
        // startProcessing done
        yield put(extractPolygonInfoActions.success(response.data))
        break
      } else {
        // not yet, update progress
        yield put(extractPolygonInfoActions.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(extractPolygonInfoActions.failure())
      yield call(extractError, 'extract polling error', e)
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* extractPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: PlanningProcessInfoResponse
    } = yield take(extractPolygonStartActions.success)
    console.info('[EXTRACT] status', action.status)
    if (action.status !== 'error') {
      console.info('[EXTRACT] start polling')
      // wait for successful startProcessing
      yield race([
        call(extractPollSagaWorker),
        take('POLLING_START_EXTRACT_STOP'), // actually nobody dispatches this action
      ])
    } else {
      yield call(
        extractError,
        composeErrorString('Extraction failed', action.errors)
      )
      console.info('[EXTRACT] no polling needed', action.status)
    }
  }
}

export function* extractPollSaga() {
  yield all([fork(extractPollSagaWatcher)])
  // yield takeLatest(extractTracksStartActions.request, startProcessing)
}
