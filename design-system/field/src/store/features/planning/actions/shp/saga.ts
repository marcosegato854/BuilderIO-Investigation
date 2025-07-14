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
  importShpInfoActions,
  importShpStartActions,
} from 'store/features/planning/slice'
import {
  ImportShpResponse,
  PlanningProcessInfoResponse,
} from 'store/features/planning/types'

/**
 * SAGAS
 */

/**
 * error starting processing
 */
function* shpError(description?: string, error?: unknown) {
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
function* shpPollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<ImportShpResponse> = yield call(
        api.planningImportShpInfo
      )
      console.info('[SHP] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        yield call(
          shpError,
          composeErrorString(
            t('planning.errors.shp_failed', 'Import SHP failed'),
            response.data.action.errors
          )
        )
        yield put(importShpInfoActions.failure())
        break
      } else if (response.data?.action?.status === 'done') {
        // startProcessing done
        yield put(importShpInfoActions.success(response.data))
        break
      } else {
        // not yet, update progress
        yield put(importShpInfoActions.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(importShpInfoActions.failure())
      yield call(shpError, 'import shp polling error', e)
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* shpPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: PlanningProcessInfoResponse
    } = yield take(importShpStartActions.success)
    console.info('[SHP] status', action.status)
    if (action.status === 'done') {
      console.info('[SHP] already done, no polling necessary')
    } else if (action.status !== 'error') {
      console.info('[SHP] start polling')
      // wait for successful startProcessing
      yield race([
        call(shpPollSagaWorker),
        take('POLLING_START_SHP_STOP'), // actually nobody dispatches this action
      ])
    } else {
      yield call(
        shpError,
        composeErrorString(
          t('planning.errors.shp_failed', 'Import SHP failed'),
          action.errors
        )
      )
      console.info('[SHP] no polling needed', action.status)
    }
  }
}

export function* shpPollSaga() {
  yield all([fork(shpPollSagaWatcher)])
}
