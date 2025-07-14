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
import { composeErrorString, translateError } from 'utils/errors'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import {
  actionsServiceStopRecordingInfoActions,
  selectStopRecordingStatus,
  actionsServiceStopRecordingStartActions,
  actionsServiceStopRecordingAction,
} from 'store/features/actions/slice'
import {
  ActionStatus,
  ActionsServiceStopRecordingInfoResponse,
} from 'store/features/actions/types'
import api from 'store/features/actions/api'
import { addSpeechText } from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'

/**
 * SAGAS
 */

/**
 * error stopping recording
 */
function* stopRecordingError(description?: string, error?: unknown) {
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
        title: t('acquisition.title', 'stop secording'),
        text: message,
      } as IAlertProps,
    })
  )
  yield take(closeDialogAction)
}

/**
 * do the steps to stop recording
 */
function* stopRecording() {
  console.info('[STOP_RECORDING] stop recording')
  // retrieve the job
  // get system info
  yield put(actionsServiceStopRecordingInfoActions.request())
  yield race([
    take(actionsServiceStopRecordingInfoActions.success),
    take(actionsServiceStopRecordingInfoActions.failure),
  ])
  // get system state
  const stopRecordingStatus: ActionStatus = yield select(
    selectStopRecordingStatus
  )
  console.info('[STOP_RECORDING] status', stopRecordingStatus)
  if (stopRecordingStatus === 'done') {
    console.info('[STOP_RECORDING] already stopped')
    // seems to return an error the first time, so ignore it for now, just log
  } else if (stopRecordingStatus === 'error') {
    console.error('[STOP_RECORDING] stop recording status error')
    // start stopRecording
    yield put(actionsServiceStopRecordingStartActions.request())
  } else {
    console.info('[STOP_RECORDING] not recording')
    // start stopRecording
    yield put(actionsServiceStopRecordingStartActions.request())
  }
}

/**
 * starts polling for stop recording status
 */
function* stopRecordingPollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<ActionsServiceStopRecordingInfoResponse> =
        yield call(api.actionsStopRecordingInfo)
      console.info('[STOP_RECORDING] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        yield put(actionsServiceStopRecordingInfoActions.failure())
        yield call(
          stopRecordingError,
          composeErrorString(
            t('acquisition.camera_failure.stop', 'Stop failed'),
            response.data.action.errors
          )
        )
        break
      } else if (response.data?.action?.status === 'done') {
        // stopRecording done
        yield put(actionsServiceStopRecordingInfoActions.success(response.data))
        break
      } else {
        // not yet, update progress
        yield put(actionsServiceStopRecordingInfoActions.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(actionsServiceStopRecordingInfoActions.failure())
      yield call(stopRecordingError, 'stop recording polling error', e)
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* stopRecordingPollSagaWatcher() {
  while (true) {
    yield put({ type: 'POLLING_STOP_RECORDING_STOP' }) // in other actions we removed this one
    // wait for successful stopRecording
    const {
      payload: { action },
    }: {
      payload: ActionsServiceStopRecordingInfoResponse
    } = yield take(actionsServiceStopRecordingStartActions.success)
    console.info('[STOP_RECORDING] start stopRecording status', action.status)
    if (action.status !== 'error') {
      console.info('[STOP_RECORDING] start polling')
      // wait for successful stopRecording
      yield race([
        call(stopRecordingPollSagaWorker),
        take('POLLING_STOP_RECORDING_STOP'),
      ])
    } else {
      yield call(
        stopRecordingError,
        composeErrorString(
          t('acquisition.camera_failure.stop', 'Stop failed'),
          action.errors
        )
      )
      console.info('[STOP_RECORDING] no polling needed', action.status)
    }
  }
}

export function* stopRecordingPollSaga() {
  yield all([fork(stopRecordingPollSagaWatcher)])
  yield takeLatest(actionsServiceStopRecordingAction, stopRecording)
}
