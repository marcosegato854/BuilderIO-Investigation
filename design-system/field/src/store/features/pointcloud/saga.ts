// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import { all, call, fork, put, select, takeLatest } from 'redux-saga/effects'
import { actionsServiceAcquisitionReady } from 'store/features/actions/slice'
import { openDialogAction } from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/pointcloud/api'
import {
  pointCloudBufferSettinsAction,
  pointCloudConnected,
  pointCloudHspcListAction,
  pointCloudProj4Action,
  pointCloudProjectionAction,
  pointCloudSubscribeAction,
  pointCloudUnsubscribeAction,
  selectPointcloudModule,
} from 'store/features/pointcloud/slice'
import { pointCloudSocketsSaga } from 'store/features/pointcloud/socketSaga'
import {
  PointCloudHspcListResponse,
  PointCloudStateResponse,
} from 'store/features/pointcloud/types'
import { addSpeechText } from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'
import { logError } from 'store/features/system/slice'
import { translateError } from 'utils/errors'

/**
 * SAGAS
 */

/**
 * error activating
 */
function* pointcloudError(description?: string, error?: unknown) {
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
}

function* onPointCloudSocketConnected({
  payload,
}: ReturnType<typeof pointCloudConnected>) {
  if (payload) {
    try {
      const resp: AxiosResponse<PointCloudStateResponse> = yield call(
        api.pointCloudState
      )
      if (!resp) {
        yield call(pointcloudError, 'No reponse from pointcloud api')
        console.warn('[POINTCLOUD] No reponse from pointcloud api')
        return
      }
      if (!resp.data.coordinateSystem) {
        yield call(pointcloudError, 'Coordinate system missing')
        yield put(logError(new Error('Coordinate system missing')))
        console.warn('[POINTCLOUD] Coordinate system missing')
        return
      }
      if (!resp.data.coordinateSystem.epsg) {
        yield call(pointcloudError, 'EPSG missing')
        console.warn('[POINTCLOUD] EPSG missing')
        return
      }
      if (!resp.data.coordinateSystem.proj4) {
        yield call(pointcloudError, 'proj4 missing')
        console.warn('[POINTCLOUD] proj4 missing')
        return
      }
      console.info(`[POINTCLOUD] EPSG ${resp.data.coordinateSystem.epsg}`)
      console.info(`[POINTCLOUD] proj4 ${resp.data.coordinateSystem.proj4}`)
      yield put(pointCloudProjectionAction(resp.data.coordinateSystem.epsg))
      yield put(pointCloudProj4Action(resp.data.coordinateSystem.proj4))
      yield put(pointCloudBufferSettinsAction(resp.data.hspc))
    } catch (e) {
      yield put(pointCloudProjectionAction(null))
      yield put(pointCloudProj4Action(null))
      yield put(pointCloudBufferSettinsAction(null))
      yield call(pointcloudError, 'Error calling pointcloud api', e)
      yield put(logError(e as Error))
      console.error('[POINTCLOUD] Error calling pointcloud api', e)
    }
  }
}

/**
 * subscribe to pointcloud socket if activation is ok, unsubscribe if it's not
 * */
function* onActionsServiceAcquisitionReady({
  payload,
}: ReturnType<typeof actionsServiceAcquisitionReady>) {
  const pointcloudModule: boolean = yield select(selectPointcloudModule)
  if (!pointcloudModule) return
  if (payload) {
    console.info('[POINTCLOUD] acquisition ready with payload, subscribing ...')
    yield put(pointCloudSubscribeAction())
  }
  if (!payload) {
    console.warn(
      '[POINTCLOUD] acquisition ready without payload, unsubscribing ...'
    )
    yield put(pointCloudUnsubscribeAction())
  }
}

function* pointCloudHspcList() {
  const pointcloudModule: boolean = yield select(selectPointcloudModule)
  if (!pointcloudModule) return
  try {
    const resp: AxiosResponse<PointCloudHspcListResponse> = yield call(
      api.hspcList
    )
    yield put(pointCloudHspcListAction.success(resp.data))
  } catch (e) {
    yield put(pointCloudHspcListAction.failure())
    yield put(errorAction(e))
  }
}

/**
 * Automatically close dialogs on specific actions dispatches
 */

export function* pointCloudSaga() {
  yield takeLatest(pointCloudConnected, onPointCloudSocketConnected)
  yield takeLatest(
    actionsServiceAcquisitionReady,
    onActionsServiceAcquisitionReady
  )
  //
  yield all([fork(pointCloudSocketsSaga)])
  //
  yield takeLatest(pointCloudHspcListAction.request, pointCloudHspcList)
}
