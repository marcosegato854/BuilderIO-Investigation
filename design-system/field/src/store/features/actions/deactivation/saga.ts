// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { push } from 'connected-react-router'
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
import { Routes } from 'Routes'
import api from 'store/features/actions/api'
import {
  actionsServiceAcquisitionReady,
  actionsServiceDeactivateSystemAction,
  actionsServiceDeactivating,
  actionsServiceDeactivationInfoActions,
  actionsServiceDeactivationStartActions,
  actionsServiceExitAcquisition,
} from 'store/features/actions/slice'
import {
  ActionsServiceDeactivationInfoResponse,
  ActionsServiceDeactivationStartResponse,
} from 'store/features/actions/types'
import apiDataStorage from 'store/features/dataStorage/api'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'
import { DataStorageInfoResponse } from 'store/features/dataStorage/types'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import { addSpeechText } from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'
import { systemStateActions } from 'store/features/system/slice'
import { composeErrorString, translateError } from 'utils/errors'

/**
 * SAGAS
 */

/**
 * error deactivating
 */
function* deactivationError(description?: string, error?: unknown) {
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
        title: t('acquisition.deactivate', 'deactivate'),
        text: message,
      } as IAlertProps,
    })
  )
  yield take(closeDialogAction)
  const currentProject: IProject | null = yield select(
    selectDataStorageCurrentProject
  )
  if (currentProject) {
    yield put(
      push(
        Routes.JOBS.replace(':diskName', currentProject.disk || '').replace(
          ':projectName',
          currentProject.name
        )
      )
    )
  } else {
    yield put(push(Routes.PROJECTS))
  }
}

/**
 * if deactivation is successful, do the next steps
 */
/* function* afterDeactivation({
  payload,
}: ReturnType<typeof actionsServiceDeactivationInfoActions.success>) {
  if (payload.action.progress < 100) return
  yield call(redirectToJobs)
} */

/**
 * redirect to jobs or projects as fallback
 */
function* redirectToJobs() {
  yield put(actionsServiceDeactivating(false))
  /** reset ready status */
  yield put(actionsServiceAcquisitionReady(false))
  /** update systemState */
  yield put(systemStateActions.request()) // load system state
  console.info("[DEACTIVATION] everything ok, redirect to project's jobs")
  try {
    // get current job info
    const response: AxiosResponse<DataStorageInfoResponse> = yield call(
      apiDataStorage.dataStorageInfo
    )
    console.info('[DEACTIVATION] current project', response.data.project)
    console.info('[DEACTIVATION] current job', response.data.job)
    const jobRoute = `${Routes.JOBS.replace(
      ':diskName',
      response.data.disk
    ).replace(':projectName', response.data.project)}/${response.data.job}`
    yield put(push(jobRoute))
  } catch (error) {
    console.error('[DEACTIVATION] error while redirecting to job', error)
    yield put(push(Routes.PROJECTS))
  }
}

/**
 * failure deactivating, redirect
 */
function* redirectAfterFailure() {
  yield call(redirectToJobs)
}

/**
 * do the steps to deactivate the system
 */
function* deactivateSystem() {
  console.info('[DEACTIVATION] deactivate system')
  yield put(actionsServiceDeactivating(true))
  // get system state
  try {
    const response: AxiosResponse<ActionsServiceDeactivationInfoResponse> =
      yield call(api.actionsDeactivationInfo)
    console.info('[DEACTIVATION] status', response.data.action.status)
    if (response.data.action.status === 'done') {
      console.info('[DEACTIVATION] already deactivated')
      yield put(actionsServiceDeactivating(false))
      yield call(deactivationError, 'alerady deactivated')
      // seems to return an error the first time, so ignore it for now, just log
    } else if (response.data.action.status === 'error') {
      console.warn('[DEACTIVATION] deactivation info failure')
      yield put(actionsServiceDeactivationStartActions.request())
      // no error display here, false negative
    } else {
      console.info('[DEACTIVATION] active, start deactivation')
      yield put(actionsServiceDeactivationStartActions.request())
    }
  } catch (error) {
    console.error('[DEACTIVATION] error while deactivating the system')
    yield put(actionsServiceDeactivationStartActions.request())
  }
}

/**
 * starts polling for mountpoints load
 * after successful authentication
 */
function* deactivationPollSagaWorker() {
  // wait for successful mountpoints load
  while (true) {
    try {
      const response: AxiosResponse<ActionsServiceDeactivationInfoResponse> =
        yield call(api.actionsDeactivationInfo)
      console.info('[DEACTIVATION] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        yield put(actionsServiceDeactivationInfoActions.failure())
        yield call(
          deactivationError,
          composeErrorString(
            t('acquisition.deactivate_failure', 'Deactivate failed'),
            response.data.action.errors
          )
        )
        break
      } else if (response.data?.action?.status === 'done') {
        // deactivation done
        yield put(actionsServiceDeactivating(false))
        yield put(actionsServiceDeactivationInfoActions.success(response.data))
        break
      } else {
        // not yet, update progress
        yield put(actionsServiceDeactivationInfoActions.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(actionsServiceDeactivating(false))
      yield put(actionsServiceDeactivationInfoActions.failure())
      yield call(deactivationError, 'deactivation polling failure', e)
      yield put(errorAction(e))
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* deactivationPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: ActionsServiceDeactivationStartResponse
    } = yield take(actionsServiceDeactivationStartActions.success)
    console.info('[DEACTIVATION] start deactivation status', action.status)
    if (action.status !== 'error') {
      console.info('[DEACTIVATION] start polling')
      // wait for successful deactivation
      yield race([
        call(deactivationPollSagaWorker),
        take('POLLING_DEACTIVATION_STOP'), // actually nobody dispatches this action
      ])
    } else {
      yield call(
        deactivationError,
        composeErrorString(
          t('acquisition.deactivate_failure', 'Deactivate failed'),
          action.errors
        )
      )
      yield put(push(Routes.PROJECTS))
      console.info('[DEACTIVATION] error, no polling needed', action.status)
    }
  }
}

export function* deactivationPollSaga() {
  yield all([fork(deactivationPollSagaWatcher)])
  yield takeLatest(actionsServiceDeactivateSystemAction, deactivateSystem)
  yield takeLatest(actionsServiceExitAcquisition, redirectToJobs)
  /* yield takeLatest(
    [
      actionsServiceDeactivationStartActions.success,
      actionsServiceDeactivationInfoActions.success,
    ],
    afterDeactivation
  ) */
  yield takeLatest(
    actionsServiceDeactivationStartActions.failure,
    redirectAfterFailure
  )
}
