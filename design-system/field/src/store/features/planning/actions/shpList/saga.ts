// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import { all, call, delay, fork, put, race, take } from 'redux-saga/effects'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import api from 'store/features/planning/api'
import {
  listShpInfoActions,
  listShpStartActions,
} from 'store/features/planning/slice'
import {
  ListShpResponse,
  PlanningProcessInfoResponse,
} from 'store/features/planning/types'
import { composeErrorString, translateError } from 'utils/errors'

/**
 * SAGAS
 */

/**
 * error starting processing
 */
function* shpListError(description?: string, error?: unknown) {
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
function* shpListPollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<ListShpResponse> = yield call(
        api.planningListShpInfo
      )
      console.info('[SHP_LIST] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        yield call(
          shpListError,
          composeErrorString(
            t('planning.errors.shp_list_failed', 'Import SHP failed'),
            response.data.action.errors
          )
        )
        yield put(listShpInfoActions.failure())
        break
      } else if (response.data?.action?.status === 'done') {
        // startProcessing done
        yield put(listShpInfoActions.success(response.data))
        break
      } else {
        // not yet, update progress
        yield put(listShpInfoActions.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(listShpInfoActions.failure())
      yield call(shpListError, 'import shp polling error', e)
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* shpListPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: PlanningProcessInfoResponse
    } = yield take(listShpStartActions.success)
    console.info('[SHP_LIST] status', action.status)
    if (action.status === 'done') {
      console.info('[SHP_LIST] already done, no polling necessary')
    } else if (action.status !== 'error') {
      console.info('[SHP_LIST] start polling')
      // wait for successful startProcessing
      yield race([
        call(shpListPollSagaWorker),
        take('POLLING_START_SHPLIST_STOP'), // TODO: actually nobody dispatches this action
      ])
    } else {
      yield call(
        shpListError,
        composeErrorString(
          t('planning.errors.shp_failed', 'Import SHP failed'),
          action.errors
        )
      )
      console.info('[SHP_LIST] no polling needed', action.status)
    }
  }
}

export function* shpListPollSaga() {
  yield all([fork(shpListPollSagaWatcher)])
}
