// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { call, put, takeLatest } from 'redux-saga/effects'
import api from 'store/features/actions/api'
import { t } from 'i18n/config'
import {
  actionsServiceActivationAbortActions,
  actionsServiceActivationInfoActions,
  actionsServiceActivationStartActions,
  actionsServiceDeactivationStartActions,
  actionsServiceFinalAlignmentInfoActions,
  actionsServiceFinalAlignmentStartActions,
  actionsServiceInitialAlignmentInfoActions,
  actionsServiceInitialAlignmentStartActions,
  actionsServiceStartRecordingAbortActions,
  actionsServiceStartRecordingInfoActions,
  actionsServiceStartRecordingStartActions,
  actionsServiceStopRecordingInfoActions,
  actionsServiceStopRecordingStartActions,
} from 'store/features/actions/slice'
import {
  ActionsServiceActivationAbortResponse,
  ActionsServiceActivationInfoResponse,
  ActionsServiceActivationStartResponse,
  ActionsServiceDeactivationStartResponse,
  ActionsServiceFinalAlignmentInfoResponse,
  ActionsServiceFinalAlignmentStartResponse,
  ActionsServiceInitialAlignmentInfoResponse,
  ActionsServiceInitialAlignmentStartResponse,
  ActionsServiceStartRecordingInfoResponse,
  ActionsServiceStartRecordingStartResponse,
  ActionsServiceStopRecordingInfoResponse,
  ActionsServiceStopRecordingStartResponse,
} from 'store/features/actions/types'
import { errorAction } from 'store/features/errors/slice'
import { composeError } from 'utils/errors'
// import { push } from 'connected-react-router'

// import { rootPath } from 'config'

/**
 * SAGAS
 */

function* actionsActivationStart() {
  try {
    // yield put({ type: 'POLLING_ACTIVATION_STOP' }) // stop polling
    const resp: AxiosResponse<ActionsServiceActivationStartResponse> =
      yield call(api.actionsActivationStart)
    if (resp.data.action.status === 'error') {
      yield put(actionsServiceActivationStartActions.failure())
      yield put(
        errorAction(
          composeError(
            t('acquisition.activation.failure', 'Activation failed'),
            resp.data.action.errors
          )
        )
      )
    } else {
      yield put(actionsServiceActivationStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(actionsServiceActivationStartActions.failure())
    yield put(errorAction(e))
  }
}

function* actionsActivationInfo() {
  try {
    const resp: AxiosResponse<ActionsServiceActivationInfoResponse> =
      yield call(api.actionsActivationInfo)
    if (resp.data.action.status === 'error') {
      yield put(actionsServiceActivationInfoActions.failure())
      // no error display here, used to check before activating
    } else {
      yield put(actionsServiceActivationInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(actionsServiceActivationInfoActions.failure())
    yield put(errorAction(e))
  }
}

function* actionsActivationAbort() {
  try {
    const resp: AxiosResponse<ActionsServiceActivationAbortResponse> =
      yield call(api.actionsActivationAbort)
    yield put(actionsServiceActivationAbortActions.success(resp.data))
  } catch (e) {
    yield put(actionsServiceActivationAbortActions.failure())
    yield put(errorAction(e))
  }
}

function* actionsInitialAlignmentStart() {
  try {
    // yield put({ type: 'POLLING_INITIAL_ALIGNMENT_STOP' }) // stop polling
    const resp: AxiosResponse<ActionsServiceInitialAlignmentStartResponse> =
      yield call(api.actionsInitialAlignmentStart)
    if (resp.data.action.status === 'error') {
      yield put(actionsServiceInitialAlignmentStartActions.failure())
      yield put(
        errorAction(composeError('Recording failed', resp.data.action.errors))
      )
    } else {
      yield put(actionsServiceInitialAlignmentStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(actionsServiceInitialAlignmentStartActions.failure())
    yield put(errorAction(e))
  }
}

function* actionsInitialAlignmentInfo() {
  try {
    const resp: AxiosResponse<ActionsServiceInitialAlignmentInfoResponse> =
      yield call(api.actionsInitialAlignmentInfo)
    if (resp.data.action.status === 'error') {
      yield put(actionsServiceInitialAlignmentInfoActions.failure())
      // no error display here, false negative
    } else {
      yield put(actionsServiceInitialAlignmentInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(actionsServiceInitialAlignmentInfoActions.failure())
    yield put(errorAction(e))
  }
}

function* actionsFinalAlignmentStart() {
  try {
    // yield put({ type: 'POLLING_FINAL_ALIGNMENT_STOP' }) // stop polling
    const resp: AxiosResponse<ActionsServiceFinalAlignmentStartResponse> =
      yield call(api.actionsFinalAlignmentStart)
    if (resp.data.action.status === 'error') {
      yield put(actionsServiceFinalAlignmentStartActions.failure())
      yield put(
        errorAction(composeError('Recording failed', resp.data.action.errors))
      )
    } else {
      yield put(actionsServiceFinalAlignmentStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(actionsServiceFinalAlignmentStartActions.failure())
    yield put(errorAction(e))
  }
}

function* actionsFinalAlignmentInfo() {
  try {
    const resp: AxiosResponse<ActionsServiceFinalAlignmentInfoResponse> =
      yield call(api.actionsFinalAlignmentInfo)
    if (resp.data.action.status === 'error') {
      yield put(actionsServiceFinalAlignmentInfoActions.failure())
      // no error display here, false negative
    } else {
      yield put(actionsServiceFinalAlignmentInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(actionsServiceFinalAlignmentInfoActions.failure())
    yield put(errorAction(e))
  }
}

function* actionsStartRecordingStart() {
  try {
    // yield put({ type: 'POLLING_START_RECORDING_STOP' }) // stop polling
    const resp: AxiosResponse<ActionsServiceStartRecordingStartResponse> =
      yield call(api.actionsStartRecordingStart)
    if (resp.data.action.status === 'error') {
      yield put(actionsServiceStartRecordingStartActions.failure())
      yield put(
        errorAction(
          composeError(
            t('acquisition.camera_failure.recording', 'Recording failed'),
            resp.data.action.errors
          )
        )
      )
    } else {
      yield put(actionsServiceStartRecordingStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(actionsServiceStartRecordingStartActions.failure())
    yield put(errorAction(e))
  }
}

function* actionsStartRecordingInfo() {
  try {
    const resp: AxiosResponse<ActionsServiceStartRecordingInfoResponse> =
      yield call(api.actionsStartRecordingInfo)
    if (resp.data.action.status === 'error') {
      yield put(actionsServiceStartRecordingInfoActions.failure())
      // no error display here, false negative
    } else {
      yield put(actionsServiceStartRecordingInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(actionsServiceStartRecordingInfoActions.failure())
    yield put(errorAction(e))
  }
}

function* actionsStartRecordingAbort() {
  try {
    console.warn('[ACTIONS] [USER_ACTION] user wants to abort start recording')
    yield call(api.actionsStartRecordingAbort)
    yield put(actionsServiceStartRecordingAbortActions.success())
  } catch (e) {
    yield put(actionsServiceStartRecordingAbortActions.failure())
    yield put(errorAction(e))
  }
}

function* actionsStopRecordingStart() {
  try {
    // yield put({ type: 'POLLING_STOP_RECORDING_STOP' }) // stop polling
    const resp: AxiosResponse<ActionsServiceStopRecordingStartResponse> =
      yield call(api.actionsStopRecordingStart)
    if (resp.data.action.status === 'error') {
      yield put(actionsServiceStopRecordingStartActions.failure())
      yield put(
        errorAction(
          composeError(
            t('acquisition.camera_failure.stop', 'Stop failed'),
            resp.data.action.errors
          )
        )
      )
    } else {
      yield put(actionsServiceStopRecordingStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(actionsServiceStopRecordingStartActions.failure())
    yield put(errorAction(e))
  }
}

function* actionsStopRecordingInfo() {
  try {
    const resp: AxiosResponse<ActionsServiceStopRecordingInfoResponse> =
      yield call(api.actionsStopRecordingInfo)
    if (resp.data.action.status === 'error') {
      yield put(actionsServiceStopRecordingInfoActions.failure())
      // no error display here, false negative
    } else {
      yield put(actionsServiceStopRecordingInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(actionsServiceStopRecordingInfoActions.failure())
    yield put(errorAction(e))
  }
}

function* actionsDeactivationStart() {
  try {
    // yield put({ type: 'POLLING_DEACTIVATION_STOP' }) // stop polling
    const resp: AxiosResponse<ActionsServiceDeactivationStartResponse> =
      yield call(api.actionsDeactivationStart)
    if (resp.data.action.status === 'error') {
      yield put(actionsServiceDeactivationStartActions.failure())
      yield put(
        errorAction(
          composeError(
            t('acquisition.deactivate_failure', 'Deactivate failed'),
            resp.data.action.errors
          )
        )
      )
    } else {
      yield put(actionsServiceDeactivationStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(actionsServiceDeactivationStartActions.failure())
    yield put(errorAction(e))
  }
}

export function* actionsBackendsSaga() {
  yield takeLatest(
    actionsServiceActivationInfoActions.request,
    actionsActivationInfo
  )
  yield takeLatest(
    actionsServiceActivationStartActions.request,
    actionsActivationStart
  )
  yield takeLatest(
    actionsServiceInitialAlignmentStartActions.request,
    actionsInitialAlignmentStart
  )
  yield takeLatest(
    actionsServiceInitialAlignmentInfoActions.request,
    actionsInitialAlignmentInfo
  )
  yield takeLatest(
    actionsServiceFinalAlignmentStartActions.request,
    actionsFinalAlignmentStart
  )
  yield takeLatest(
    actionsServiceFinalAlignmentInfoActions.request,
    actionsFinalAlignmentInfo
  )
  yield takeLatest(
    actionsServiceStartRecordingStartActions.request,
    actionsStartRecordingStart
  )
  yield takeLatest(
    actionsServiceStartRecordingInfoActions.request,
    actionsStartRecordingInfo
  )
  yield takeLatest(
    actionsServiceStartRecordingAbortActions.request,
    actionsStartRecordingAbort
  )
  yield takeLatest(
    actionsServiceActivationAbortActions.request,
    actionsActivationAbort
  )
  yield takeLatest(
    actionsServiceStopRecordingStartActions.request,
    actionsStopRecordingStart
  )
  yield takeLatest(
    actionsServiceStopRecordingInfoActions.request,
    actionsStopRecordingInfo
  )
  yield takeLatest(
    actionsServiceDeactivationStartActions.request,
    actionsDeactivationStart
  )
}
