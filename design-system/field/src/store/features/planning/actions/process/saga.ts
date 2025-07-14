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
  processingInfoPlanActions,
  startProcessingPlanActions,
} from 'store/features/planning/slice'
import { PlanningProcessInfoResponse } from 'store/features/planning/types'

/**
 * SAGAS
 */

/**
 * error starting processing
 */
function* startProcessingError(description?: string, error?: unknown) {
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
        title: t('planning.title', 'Start Processing'),
        text: message,
      } as IAlertProps,
    })
  )
  yield take(closeDialogAction)
}

/**
 * do the steps to start processing
 */
// function* startProcessing() {
//   console.info('[PROCESSING] start processing')
//   // get system info
//   yield put(processingInfoPlanActions.request())
//   yield race([
//     take(processingInfoPlanActions.success),
//     take(processingInfoPlanActions.failure),
//   ])
//   // get system state
//   const processingStatus: ActionStatus = yield select(selectProcessingStatus)
//   console.info('[PROCESSING] status', processingStatus)
//   if (processingStatus === 'done') {
//     console.info('[PROCESSING] already processing')
//     // seems to return an error the first time, so I ignore it, just log
//   } else if (processingStatus === 'error') {
//     console.info('[PROCESSING] start processing error')
//     // start startProcessing
//     yield put(startProcessingPlanActions.request())
//   } else {
//     console.info('[PROCESSING] not processing')
//     // start startProcessing
//     yield put(startProcessingPlanActions.request())
//   }
// }

/**
 * starts polling for start processing status
 */
function* startProcessingPollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<PlanningProcessInfoResponse> = yield call(
        api.planningProcessInfo
      )
      console.info('[PROCESSING] polling', response.data.action.status)
      if (response.data.action.status === 'error') {
        yield call(
          startProcessingError,
          composeErrorString(
            t('planning.errors.estimate_failed', 'Estimate failed'),
            []
          )
        )
        yield put(
          processingInfoPlanActions.failure(
            new Error(
              composeErrorString(
                t('planning.errors.estimate_failed', 'Estimate failed'),
                []
              )
            )
          )
        )
        break
      } else if (response.data.action.status === 'done') {
        // startProcessing done
        yield put(processingInfoPlanActions.success(response.data))
        break
      } else {
        // not yet, update progress
        yield put(processingInfoPlanActions.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      // console.error(e)
      yield put(processingInfoPlanActions.failure(e as Error))
      yield call(startProcessingError, 'start processing polling error', e)
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* startProcessingPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: PlanningProcessInfoResponse
    } = yield take(startProcessingPlanActions.success)
    console.info('[PROCESSING] start startProcessing status', action.status)
    if (action.status !== 'error') {
      console.info('[PROCESSING] start polling')
      // wait for successful startProcessing
      yield race([
        call(startProcessingPollSagaWorker),
        take('POLLING_START_PROCESSING_STOP'), // actually nobody dispatches this action
      ])
    } else {
      yield call(
        startProcessingError,
        composeErrorString(
          t('planning.errors.estimate_failed', 'Estimate failed'),
          []
        )
        // composeErrorString('Processing failed', action.errors)
      )
      console.info('[PROCESSING] no polling needed', action.status)
    }
  }
}

export function* startProcessingPollSaga() {
  yield all([fork(startProcessingPollSagaWatcher)])
  // yield takeLatest(startProcessingPlanActions.request, startProcessing)
}
