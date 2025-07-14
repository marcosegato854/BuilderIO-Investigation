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
  actionsServiceInitialAlignmentAction,
  actionsServiceInitialAlignmentInfoActions,
  actionsServiceInitialAlignmentStartActions,
} from 'store/features/actions/slice'
import { ActionsServiceInitialAlignmentInfoResponse } from 'store/features/actions/types'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { selectSystemState } from 'store/features/system/slice'
import { SystemState } from 'store/features/system/types'
import { composeErrorString, translateError } from 'utils/errors'

/**
 * SAGAS
 */

/**
 * error starting initialAlignment
 */
function* initialAlignmentError(description?: string, error?: unknown) {
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
        title: t(
          'acquisition.activation.state.initialalignment',
          'initial alignment'
        ),
        text: message,
      } as IAlertProps,
    })
  )
  yield take(closeDialogAction)
}

/**
 * do the steps to start initialAlignment
 */
function* initialAlignment() {
  console.info('[ALIGNMENT] start initialAlignment')
  // get system info
  yield put(actionsServiceInitialAlignmentInfoActions.request())
  yield race([
    take(actionsServiceInitialAlignmentInfoActions.success),
    take(actionsServiceInitialAlignmentInfoActions.failure),
  ])
  // get system state
  const systemState: SystemState = yield select(selectSystemState)
  console.info('[ALIGNMENT] status', systemState?.state)
  if (systemState?.state === 'InitialAlignment') {
    console.info('[ALIGNMENT] already initialAlignment')
    // seems to return an error the first time, so I ignore it, just log
  } else {
    console.info('[ALIGNMENT] not initialAlignment')
    // start initialAlignment
    yield put(actionsServiceInitialAlignmentStartActions.request())
  }
}

/**
 * starts polling for start initialAlignment status
 */
function* initialAlignmentPollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<ActionsServiceInitialAlignmentInfoResponse> =
        yield call(api.actionsInitialAlignmentInfo)
      console.info('[ALIGNMENT] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        yield put(actionsServiceInitialAlignmentInfoActions.failure())
        yield call(
          initialAlignmentError,
          composeErrorString(
            'Initial Alignment failed',
            response.data.action.errors
          )
        )
        break
      } else if (response.data?.action?.status === 'done') {
        // initialAlignment done
        yield put(
          actionsServiceInitialAlignmentInfoActions.success(response.data)
        )
        break
      } else {
        // not yet, update progress
        yield put(
          actionsServiceInitialAlignmentInfoActions.success(response.data)
        )
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(actionsServiceInitialAlignmentInfoActions.failure())
      yield call(
        initialAlignmentError,
        'start initialAlignment polling error',
        e
      )
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* initialAlignmentPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: ActionsServiceInitialAlignmentInfoResponse
    } = yield take(actionsServiceInitialAlignmentStartActions.success)
    console.info('[ALIGNMENT] start initialAlignment status', action.status)
    if (action.status !== 'error') {
      console.info('[ALIGNMENT] start polling')
      // wait for successful initialAlignment
      yield race([
        call(initialAlignmentPollSagaWorker),
        take('ALIGNMENT_STOP'), // actually nobody dispatches this action
      ])
    } else {
      yield call(
        initialAlignmentError,
        composeErrorString('Initial Alignment failed', action.errors)
      )
      console.info('[ALIGNMENT] no polling needed', action.status)
    }
  }
}

export function* initialAlignmentPollSaga() {
  yield all([fork(initialAlignmentPollSagaWatcher)])
  yield takeLatest(actionsServiceInitialAlignmentAction, initialAlignment)
}
