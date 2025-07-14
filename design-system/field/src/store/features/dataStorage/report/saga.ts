// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import {
  all,
  call,
  fork,
  put,
  race,
  take,
  takeLatest,
} from 'redux-saga/effects'
import api from 'store/features/dataStorage/api'
import {
  jobReportActions,
  jobReportInfoActions,
} from 'store/features/dataStorage/slice'
import { JobReportRequest } from 'store/features/dataStorage/types'
import { openDialogAction } from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'

/**
 * SAGAS
 */
function* monitorReportStatus({
  payload,
}: ReturnType<typeof jobReportActions.success>) {
  if (payload.action.status === 'done') {
    yield put({ type: 'REPORT_READY' })
  }
}

function* downloadReportWatcher() {
  while (true) {
    const {
      payload: originalRequest,
    }: {
      payload: JobReportRequest
    } = yield take(jobReportActions.request)
    console.info('[JOB_REPORT] request', originalRequest)
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const [requestFailure, infoFailure, ready]: [
      ReturnType<typeof jobReportActions.failure> | undefined,
      ReturnType<typeof jobReportInfoActions.failure> | undefined,
      unknown | undefined
    ] = yield race([
      take(jobReportActions.failure),
      take(jobReportInfoActions.failure),
      take('REPORT_READY'),
    ])
    if (ready) {
      console.info('[JOB_REPORT] ready')
      try {
        const resp: AxiosResponse<Blob> = yield call(
          api.jobReportDownload,
          originalRequest
        )
        const blobURL = URL.createObjectURL(
          new Blob([resp.data], {
            type: 'application/pdf;charset=utf-8;',
          })
        )
        yield put(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: {
              type: 'message',
              title: t('job_browser.report.ready.title', 'report'),
              text: t('job_browser.report.ready.text', 'ready'),
              okButtonLabel: t('job_browser.report.ready.ok', 'ok'),
              cancelButtonLabel: t('job_browser.report.ready.ko', 'ko'),
              okButtonCallback: () => {
                window.open(blobURL)
              },
            } as IAlertProps,
          })
        )
      } catch (e) {
        console.warn('[JOB_REPORT] download failed', e)
        yield put(errorAction(e))
      }
    } else {
      console.warn('[JOB_REPORT] failed')
    }
  }
}

// prettier-ignore
export function* dataStorageReportSaga() {
  yield takeLatest(
    [jobReportActions.success, jobReportInfoActions.success],
    monitorReportStatus
  )
  yield all([fork(downloadReportWatcher)])
}
