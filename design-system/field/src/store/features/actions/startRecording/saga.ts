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
import api from 'store/features/actions/api'
import {
  actionsServiceStartRecordingAction,
  actionsServiceStartRecordingInfoActions,
  actionsServiceStartRecordingStartActions,
  selectRecordingStatus,
} from 'store/features/actions/slice'
import {
  ActionsServiceStartRecordingInfoResponse,
  ActionStatus,
} from 'store/features/actions/types'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { addSpeechText } from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'
import { composeErrorString, translateError } from 'utils/errors'

/**
 * SAGAS
 */

/**
 * error starting recording
 */
function* startRecordingError(description?: string, error?: unknown) {
  const messages = [description]
  if (error) messages.push(translateError(error))
  const message = messages.join(' - ')
  yield put(
    addSpeechText({
      content: { text: message, type: SpeechTextType.ERROR },
      priority: true,
    })
  )
  yield put(
    openDialogAction({
      component: DialogNames.Alert,
      componentProps: {
        type: 'error',
        variant: 'colored',
        okButtonLabel: 'OK',
        title: t('acquisition.title', 'start recording'),
        text: message,
      } as IAlertProps,
    })
  )
  yield take(closeDialogAction)
}

/**
 * do the steps to start recording
 */
function* startRecording() {
  console.info('[RECORDING] start recording')
  // get system info
  yield put(actionsServiceStartRecordingInfoActions.request())
  yield race([
    take(actionsServiceStartRecordingInfoActions.success),
    take(actionsServiceStartRecordingInfoActions.failure),
  ])
  // get system state
  const recordingStatus: ActionStatus = yield select(selectRecordingStatus)
  console.info('[RECORDING] status', recordingStatus)
  if (recordingStatus === 'done') {
    console.info('[RECORDING] already recording')
    // seems to return an error the first time, so I ignore it, just log
  } else if (recordingStatus === 'error') {
    console.error('[RECORDING] start recording error')
    // start startRecording
    yield put(actionsServiceStartRecordingStartActions.request())
  } else {
    console.info('[RECORDING] not recording')
    // start startRecording
    yield put(actionsServiceStartRecordingStartActions.request())
  }
}

/**
 * starts polling for start recording status
 */
function* startRecordingPollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<ActionsServiceStartRecordingInfoResponse> =
        yield call(api.actionsStartRecordingInfo)
      console.info('[RECORDING] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        yield put(actionsServiceStartRecordingInfoActions.failure())
        console.error('[RECORDING] start errors', response.data.action.errors)
        yield call(
          startRecordingError,
          composeErrorString(
            t('acquisition.camera_failure.recording', 'Recording failed'),
            response.data.action.errors
          )
        )
        break
      } else if (response.data?.action?.status === 'done') {
        // startRecording done
        yield put(
          actionsServiceStartRecordingInfoActions.success(response.data)
        )
        break
      } else if (response.data?.action?.status === 'abort') {
        console.info('[RECORDING] was aborted')
        yield put({ type: 'POLLING_START_RECORDING_STOP' })
        break
      } else {
        // not yet, update progress
        yield put(
          actionsServiceStartRecordingInfoActions.success(response.data)
        )
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(actionsServiceStartRecordingInfoActions.failure())
      yield call(startRecordingError, 'start recording polling error', e)
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* startRecordingPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: ActionsServiceStartRecordingInfoResponse
    } = yield take(actionsServiceStartRecordingStartActions.success)
    console.info('[RECORDING] start startRecording status', action.status)
    if (action.status !== 'error') {
      console.info('[RECORDING] start polling')
      // wait for successful startRecording
      yield race([
        call(startRecordingPollSagaWorker),
        take('POLLING_START_RECORDING_STOP'),
      ])
    } else {
      yield call(
        startRecordingError,
        composeErrorString(
          t('acquisition.camera_failure.recording', 'Recording failed'),
          action.errors
        )
      )
      console.info('[RECORDING] no polling needed', action.status)
    }
  }
}

export function* startRecordingPollSaga() {
  yield all([fork(startRecordingPollSagaWatcher)])
  yield takeLatest(actionsServiceStartRecordingAction, startRecording)
}
