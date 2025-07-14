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
  actionsServiceFinalAlignmentAction,
  actionsServiceFinalAlignmentInfoActions,
  actionsServiceFinalAlignmentStartActions,
} from 'store/features/actions/slice'
import { ActionsServiceFinalAlignmentInfoResponse } from 'store/features/actions/types'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { selectSystemState } from 'store/features/system/slice'
import { SystemState } from 'store/features/system/types'
import {
  composeErrorString,
  getDialogTypeFromErrors,
  translateError,
} from 'utils/errors'

/**
 * SAGAS
 */

/**
 * error starting finalAlignment
 */
function* finalAlignmentError(
  description?: string,
  error?: unknown,
  type?: IAlertProps['type']
) {
  const messages = []
  if (description) messages.push(description)
  if (error) messages.push(translateError(error))
  const message = messages.join(' - ')
  yield put(
    openDialogAction({
      component: DialogNames.Alert,
      componentProps: {
        type: type || 'error',
        variant: 'colored',
        okButtonLabel: 'OK',
        title: t(
          'acquisition.activation.state.finalalignment',
          'final alignment'
        ),
        text: message,
      } as IAlertProps,
    })
  )
  yield take(closeDialogAction)
}

/**
 * do the steps to start finalAlignment
 */
function* finalAlignment() {
  console.info('[ALIGNMENT] start finalAlignment')
  // get system info
  yield put(actionsServiceFinalAlignmentInfoActions.request())
  yield race([
    take(actionsServiceFinalAlignmentInfoActions.success),
    take(actionsServiceFinalAlignmentInfoActions.failure),
  ])
  // get system state
  const systemState: SystemState = yield select(selectSystemState)
  console.info('[ALIGNMENT] status', systemState?.state)
  if (systemState?.state === 'FinalAlignment') {
    console.info('[ALIGNMENT] already finalAlignment')
    // FIXME: seems to return an error the first time, so I ignore it, just log
  } else {
    console.info('[ALIGNMENT] not finalAlignment')
    // start finalAlignment
    yield put(actionsServiceFinalAlignmentStartActions.request())
  }
}

/**
 * starts polling for start finalAlignment status
 */
function* finalAlignmentPollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<ActionsServiceFinalAlignmentInfoResponse> =
        yield call(api.actionsFinalAlignmentInfo)
      console.info('[ALIGNMENT] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        yield put(actionsServiceFinalAlignmentInfoActions.failure())
        const type: IAlertProps['type'] = getDialogTypeFromErrors(
          response.data.action.errors
        )
        yield call(
          finalAlignmentError,
          composeErrorString('', response.data.action.errors),
          undefined,
          type
        )
        break
      } else if (response.data?.action?.status === 'done') {
        // finalAlignment done
        yield put(
          actionsServiceFinalAlignmentInfoActions.success(response.data)
        )
        break
      } else {
        // not yet, update progress
        yield put(
          actionsServiceFinalAlignmentInfoActions.success(response.data)
        )
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(actionsServiceFinalAlignmentInfoActions.failure())
      yield call(finalAlignmentError, t('api.unexpectedError', 'unexpected'), e)
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* finalAlignmentPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: ActionsServiceFinalAlignmentInfoResponse
    } = yield take(actionsServiceFinalAlignmentStartActions.success)
    console.info('[ALIGNMENT] start finalAlignment status', action.status)
    if (action.status !== 'error') {
      console.info('[ALIGNMENT] start polling')
      // wait for successful finalAlignment
      yield race([
        call(finalAlignmentPollSagaWorker),
        take('ALIGNMENT_STOP'), // TODO: actually nobody dispatches this action
      ])
    } else {
      yield call(finalAlignmentError, composeErrorString('', action.errors))
      console.info('[ALIGNMENT] no polling needed', action.status)
    }
  }
}

export function* finalAlignmentPollSaga() {
  yield all([fork(finalAlignmentPollSagaWatcher)])
  yield takeLatest(actionsServiceFinalAlignmentAction, finalAlignment)
}
