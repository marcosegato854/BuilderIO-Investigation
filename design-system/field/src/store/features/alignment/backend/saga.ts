import { AxiosResponse } from 'axios'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import { call, put, race, select, take, takeLatest } from 'redux-saga/effects'
import { store } from 'store'
import api from 'store/features/alignment/api'
import {
  alignmentCommandActions,
  alignmentStatusActions,
  selectPhase,
} from 'store/features/alignment/slice'
import {
  AlignmentCommand,
  AlignmentCommandResponse,
  AlignmentPhase,
  AlignmentStatusResponse,
} from 'store/features/alignment/types'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import {
  addSpeechText,
  clearSpeechNavigationQueue,
} from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'
import { selectSystemState } from 'store/features/system/slice'
import { ActivationStatus, SystemState } from 'store/features/system/types'
import { translateError } from 'utils/errors'

const resolveTitle = (state: ActivationStatus | undefined): string => {
  if (state === 'InitialAlignment')
    return t(
      'acquisition.activation.state.initialalignment',
      'initial alignment'
    )
  if (state === 'StartingInitialAlignment')
    return t(
      'acquisition.activation.state.initialalignment',
      'initial alignment'
    )
  if (state === 'FinalAlignment')
    return t('acquisition.activation.state.finalalignment', 'initial alignment')
  if (state === 'StartingFinalAlignment')
    return t('acquisition.activation.state.finalalignment', 'initial alignment')
  return t('acquisition.title', 'Acquisition')
}

/**
 * SAGAS
 */

/**
 * error activating
 */

function* alignmentError(
  description?: string,
  error?: unknown,
  type?: IAlertProps['type']
) {
  const state: SystemState | null = yield select(selectSystemState)
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
        type: type || 'error',
        variant: 'colored',
        okButtonLabel: 'OK',
        title: resolveTitle(state?.state),
        text: message,
      } as IAlertProps,
    })
  )
  yield take(closeDialogAction)
  // const currentProject: IProject | null = yield select(
  //   selectDataStorageCurrentProject
  // )
  // if (currentProject) {
  //   yield put(push(Routes.JOBS.replace(':projectName', currentProject.name)))
  // } else {
  //   yield put(push(Routes.PROJECTS))
  // }
}

function* skipConfirmation() {
  const phase: AlignmentPhase = yield select(selectPhase)
  const text =
    phase === AlignmentPhase.INITIAL
      ? t('acquisition.alignment.skip_alert.text', 'are you sure?')
      : t('acquisition.alignment.skip_alert.text_final', 'are you sure?')
  yield put(
    addSpeechText({
      content: { text, type: SpeechTextType.ERROR },
      priority: true,
    })
  )
  yield put(
    openDialogAction({
      component: DialogNames.Alert,
      componentProps: {
        type: 'warning',
        variant: 'colored',
        cancelButtonLabel: t('acquisition.alignment.skip_alert.ko', 'cancel'),
        okButtonCallback: () => {
          store.dispatch(closeDialogAction())
          store.dispatch(clearSpeechNavigationQueue())
          store.dispatch({ type: '@ALIGNMENT_SKIP_OK' })
        },
        cancelButtonCallback: () => {
          store.dispatch(closeDialogAction())
          store.dispatch({ type: '@ALIGNMENT_SKIP_KO' })
        },
        okButtonLabel: t('acquisition.alignment.skip_alert.ok', 'yes'),
        text,
        title: t('acquisition.alignment.skip_alert.title', 'skipping'),
      } as IAlertProps,
    })
  )
  // wait for cancel or confirm
  const confirmationResults: unknown[] = yield race([
    take('@ALIGNMENT_SKIP_OK'),
    take('@ALIGNMENT_SKIP_KO'),
  ])
  if (confirmationResults[0]) return true
  return false
}

function* alignmentCommand({
  payload,
}: ReturnType<typeof alignmentCommandActions.request>) {
  try {
    const isSkip = payload.action === AlignmentCommand.SKIP
    if (isSkip) {
      const canProceed: boolean = yield call(skipConfirmation)
      if (!canProceed) {
        console.info(
          '[ALIGNMENT] [USER_ACTION] command not sent, user canceled'
        )
        return
      }
      console.info(
        '[ALIGNMENT] [USER_ACTION] user confirmed, sending skip command'
      )
    }
    const resp: AxiosResponse<AlignmentCommandResponse> = yield call(
      api.alignmentCommand,
      payload
    )
    if (resp) {
      yield put(alignmentCommandActions.success(resp.data))
    } else {
      yield put(alignmentCommandActions.failure())
      const pathname: string = yield select(
        (state) => state.router.location.pathname
      )
      const section = pathname.split('/')[1]
      if (['acquisition'].includes(section)) {
        console.error('[ALIGNMENT] command failure')
        yield call(alignmentError, t('api.unexpectedError', 'unexpected'))
      }
    }
  } catch (e) {
    yield put(alignmentCommandActions.failure())
    yield put(errorAction(e))
  }
}

function* alignmentStatus() {
  try {
    const resp: AxiosResponse<AlignmentStatusResponse> = yield call(
      api.alignmentStatus
    )
    if (resp) {
      yield put(alignmentStatusActions.success(resp.data))
    } else {
      yield put(alignmentStatusActions.failure())
      const pathname: string = yield select(
        (state) => state.router.location.pathname
      )
      const section = pathname.split('/')[1]
      if (['acquisition'].includes(section)) {
        console.error('[ALIGNMENT] status failure')
        yield call(alignmentError, t('api.unexpectedError', 'unexpected'))
      }
    }
  } catch (e) {
    yield put(alignmentStatusActions.failure())
    yield put(errorAction(e))
  }
}

export function* alignmentBackendSaga() {
  yield takeLatest(alignmentCommandActions.request, alignmentCommand)
  yield takeLatest(alignmentStatusActions.request, alignmentStatus)
}
