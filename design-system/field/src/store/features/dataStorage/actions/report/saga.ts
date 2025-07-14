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
import api from 'store/features/dataStorage/api'
import {
  jobReportActions,
  jobReportInfoActions,
} from 'store/features/dataStorage/slice'
import { JobReportInfoResponse } from 'store/features/dataStorage/types'

/**
 * SAGAS
 */

/**
 * error starting processing
 */
function* jobReportError(description?: string, error?: unknown) {
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
        title: t('job_browser.report.error.title', 'Job report'),
        text: message,
      } as IAlertProps,
    })
  )
  yield take(closeDialogAction)
}

/**
 * starts polling for start processing status
 */
function* jobReportPollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<JobReportInfoResponse> = yield call(
        api.jobReportInfo
      )
      console.info('[JOB_REPORT] polling', response.data.action.status)
      if (response.data.action.status === 'error') {
        yield call(
          jobReportError,
          composeErrorString('Job report failed', response.data.action.errors)
        )
        yield put(
          jobReportInfoActions.failure(
            new Error(
              composeErrorString(
                'Job report failed',
                response.data.action.errors
              )
            )
          )
        )
        break
      } else if (response.data.action.status === 'done') {
        // jobReport done
        yield put(jobReportInfoActions.success(response.data))
        break
      } else {
        // not yet, update progress
        yield put(jobReportInfoActions.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      // console.error(e)
      yield put(jobReportInfoActions.failure(e as Error))
      yield call(jobReportError, 'start job report polling error', e)
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* jobReportPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: JobReportInfoResponse
    } = yield take(jobReportActions.success)
    console.info('[JOB_REPORT] start jobReport status', action.status)
    if (action.status !== 'error') {
      console.info('[JOB_REPORT] start polling')
      // wait for successful jobReport
      yield race([
        call(jobReportPollSagaWorker),
        take('POLLING_JOB_REPORT_STOP'), // actually nobody dispatches this action
      ])
    } else {
      yield call(
        jobReportError,
        composeErrorString('Job report failed', action.errors)
      )
      console.info('[JOB_REPORT] no polling needed', action.status)
    }
  }
}

export function* jobReportPollSaga() {
  yield all([fork(jobReportPollSagaWatcher)])
  // yield takeLatest(jobReportPlanActions.request, jobReport)
}
