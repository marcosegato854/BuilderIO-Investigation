import { AxiosResponse } from 'axios'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import { call, put, take, takeLatest } from 'redux-saga/effects'
import {
  openDialogAction,
  closeDialogAction,
} from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/routing/api'
import {
  autocaptureAbortActions,
  autocaptureCurrentPathActions,
  routingStatusActions,
  autocaptureNeededActions,
  autocapturePolygonsActions,
  routingPolylineActions,
  autocaptureUpdatePolygonsActions,
  autocaptureStatusActions,
  autocaptureStatusUpdateActions,
  autocaptureTrackListActions,
} from 'store/features/routing/slice'
import {
  AutocaptureCurrentPathResponse,
  RoutingStatusResponse,
  AutocaptureNeededResponse,
  AutocapturePolygonsResponse,
  RoutingPolylineResponse,
  AutocaptureStatusResponse,
} from 'store/features/routing/types'
import { translateError } from 'utils/errors'
import { addSpeechText } from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'

/**
 * SAGAS
 */

/**
 * error in routing
 */

function* routingError(description?: string, error?: unknown) {
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
        title: t('acquisition.title', 'Acquisition'),
        text: message,
      } as IAlertProps,
    })
  )
  yield take(closeDialogAction)
}

function* routingStatus() {
  try {
    console.info('[ROUTING] checking status')
    const resp: AxiosResponse<RoutingStatusResponse> = yield call(
      api.routingStatus
    )
    if (resp) {
      console.info('[ROUTING] status retrieved')
      yield put(routingStatusActions.success(resp.data))
    } else {
      yield put(routingStatusActions.failure())
    }
  } catch (e) {
    yield put(routingStatusActions.failure())
    yield put(errorAction(e))
  }
}

function* autocaptureStatus() {
  try {
    console.info('[AUTOCAPTURE] checking status')
    const resp: AxiosResponse<AutocaptureStatusResponse> = yield call(
      api.autocaptureStatus
    )
    if (resp) {
      console.info('[AUTOCAPTURE] status retrieved')
      yield put(autocaptureStatusActions.success(resp.data))
    } else {
      yield put(autocaptureStatusActions.failure())
    }
  } catch (e) {
    yield put(autocaptureStatusActions.failure())
    yield put(errorAction(e))
  }
}

function* autocaptureUpdateStatus({
  payload,
}: ReturnType<typeof autocaptureStatusUpdateActions.request>) {
  try {
    console.info('[AUTOCAPTURE] updating status')
    const resp: AxiosResponse<AutocaptureStatusResponse> = yield call(
      api.autocaptureStatusUpdate,
      payload
    )
    if (resp) {
      console.info('[AUTOCAPTURE] status updated')
      yield put(autocaptureStatusActions.success(resp.data))
    } else {
      yield put(autocaptureStatusActions.failure())
    }
  } catch (e) {
    yield put(autocaptureStatusActions.failure())
    yield put(errorAction(e))
  }
}

function* autocaptureTrackList({
  payload,
}: ReturnType<typeof autocaptureTrackListActions.request>) {
  try {
    console.info('[AUTOCAPTURE] track list actions modified')
    const resp: AxiosResponse<AutocapturePolygonsResponse> = yield call(
      api.autocaptureTrackList,
      payload
    )
    if (resp) {
      console.info('[AUTOCAPTURE] status updated')
      yield put(autocaptureTrackListActions.success(resp.data))
    } else {
      yield put(autocaptureTrackListActions.failure())
    }
  } catch (e) {
    yield put(autocaptureTrackListActions.failure())
    yield put(errorAction(e))
  }
}

function* autocaptureNeeded() {
  try {
    console.info('[AUTOCAPTURE] checking needed')
    const resp: AxiosResponse<AutocaptureNeededResponse> = yield call(
      api.autocaptureNeeded
    )
    if (resp) {
      console.info('[AUTOCAPTURE] needed retrieved')
      yield put(autocaptureNeededActions.success(resp.data))
    } else {
      yield put(autocaptureNeededActions.failure())
    }
  } catch (e) {
    yield put(autocaptureNeededActions.failure())
    yield put(errorAction(e))
  }
}

function* autocaptureCurrentPath() {
  try {
    console.info('[AUTOCAPTURE] loading current path')
    const resp: AxiosResponse<AutocaptureCurrentPathResponse> = yield call(
      api.currentPath
    )
    if (resp) {
      console.info('[AUTOCAPTURE] current path loaded')
      yield put(autocaptureCurrentPathActions.success(resp.data))
    } else {
      yield put(autocaptureCurrentPathActions.failure())
    }
  } catch (e) {
    yield put(autocaptureCurrentPathActions.failure())
    yield put(errorAction(e))
  }
}

function* routingPolyline() {
  try {
    console.info('[ROUTING] loading polyline')
    const resp: AxiosResponse<RoutingPolylineResponse> = yield call(
      api.polyline
    )
    if (resp) {
      console.info('[ROUTING] polyline loaded')
      yield put(routingPolylineActions.success(resp.data))
    } else {
      yield put(routingPolylineActions.failure())
    }
  } catch (e) {
    yield put(routingPolylineActions.failure())
    yield put(errorAction(e))
  }
}

function* autocapturePolygons() {
  try {
    console.info('[AUTOCAPTURE] loading polygons')
    const resp: AxiosResponse<AutocapturePolygonsResponse> = yield call(
      api.autocapturePolygons
    )
    if (resp) {
      console.info('[AUTOCAPTURE] polygons loaded')
      yield put(autocapturePolygonsActions.success(resp.data))
    } else {
      yield put(autocapturePolygonsActions.failure())
      yield call(routingError, 'autocapture polygons failure')
    }
  } catch (e) {
    yield put(autocapturePolygonsActions.failure())
    yield put(errorAction(e))
  }
}

function* autocaptureUpdateTracks({
  payload,
}: ReturnType<typeof autocaptureUpdatePolygonsActions.request>) {
  try {
    console.info('[AUTOCAPTURE] updating tracks')
    const resp: AxiosResponse<AutocapturePolygonsResponse> = yield call(
      api.autocaptureUpdatePolygons,
      payload
    )
    if (resp) {
      console.info('[AUTOCAPTURE] tracks updated')
      yield put(autocaptureUpdatePolygonsActions.success(resp.data))
    } else {
      yield put(autocaptureUpdatePolygonsActions.failure())
      yield call(routingError, 'autocapture update tracks failure')
    }
  } catch (e) {
    yield put(autocaptureUpdatePolygonsActions.failure())
    yield put(errorAction(e))
  }
}

function* autocaptureAbort() {
  try {
    console.info('[AUTOCAPTURE] aborting')
    const resp: AxiosResponse<AutocapturePolygonsResponse> = yield call(
      api.autocaptureStatusUpdate,
      { enabled: false }
    )
    if (resp) {
      console.info('[AUTOCAPTURE] aborted')
      yield put(autocaptureAbortActions.success())
    } else {
      yield put(autocaptureAbortActions.failure())
      yield call(routingError, 'autocapture abort failure')
    }
  } catch (e) {
    yield put(autocaptureAbortActions.failure())
    yield put(errorAction(e))
  }
}

export function* routingBackendSaga() {
  yield takeLatest(routingStatusActions.request, routingStatus)
  yield takeLatest(autocaptureStatusActions.request, autocaptureStatus)
  yield takeLatest(
    autocaptureStatusUpdateActions.request,
    autocaptureUpdateStatus
  )
  yield takeLatest(autocaptureTrackListActions.request, autocaptureTrackList)
  yield takeLatest(autocaptureNeededActions.request, autocaptureNeeded)
  yield takeLatest(
    autocaptureCurrentPathActions.request,
    autocaptureCurrentPath
  )
  yield takeLatest(routingPolylineActions.request, routingPolyline)
  yield takeLatest(autocapturePolygonsActions.request, autocapturePolygons)
  yield takeLatest(
    autocaptureUpdatePolygonsActions.request,
    autocaptureUpdateTracks
  )
  yield takeLatest(autocaptureAbortActions.request, autocaptureAbort)
}
