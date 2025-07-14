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
  select,
  take,
  takeLatest,
} from 'redux-saga/effects'
import api from 'store/features/coordsys/api'
import {
  deleteCoordinateSystemWktActions,
  getCoordinateSystemActions,
  getCoordinateSystemWktActions,
  importCoordinateSystemWktInfoActions,
  importCoordinateSystemWktStartActions,
  importWktFileDone,
  listCoordinateSystemWktInfoActions,
  listCoordinateSystemWktStartActions,
  listWktFilesDone,
  selectCurrentSystem,
} from 'store/features/coordsys/slice'
import {
  CoordinateSystemWktDeleteResponse,
  CoordinateSystemWktImportResponse,
  CoordinateSystemWktListResponse,
  CoordinateSystemWktResponse,
} from 'store/features/coordsys/types'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import { composeErrorString, translateError } from 'utils/errors'

/**
 * SAGAS
 */

/**
 * get wkt information
 */
function* getWktInformation({
  payload,
}: ReturnType<typeof getCoordinateSystemWktActions.request>) {
  try {
    const resp: AxiosResponse<CoordinateSystemWktResponse> = yield call(
      api.coordsysGetWkt,
      payload
    )
    yield put(getCoordinateSystemWktActions.success(resp.data))
  } catch (error) {
    yield put(getCoordinateSystemWktActions.failure())
  }
}

/**
 * delete wkt file
 */
function* deleteWktFile({
  payload,
}: ReturnType<typeof deleteCoordinateSystemWktActions.request>) {
  try {
    const resp: AxiosResponse<CoordinateSystemWktDeleteResponse> = yield call(
      api.coordsysDeleteWkt,
      payload
    )
    yield put(deleteCoordinateSystemWktActions.success(resp.data))
    const { name } = yield select(selectCurrentSystem)
    yield put(getCoordinateSystemActions.request({ name: name }))
  } catch (error) {
    yield put(deleteCoordinateSystemWktActions.failure())
  }
}

/**
 * list wkt files start
 */
function* listWktFilesStart() {
  try {
    const resp: AxiosResponse<CoordinateSystemWktListResponse> = yield call(
      api.coordsysListWktStart
    )
    if (resp.data.action.status === 'error') {
      yield put(listCoordinateSystemWktStartActions.failure())
      // error here
      yield put(
        errorAction(
          new Error(
            composeErrorString(
              t('coordsys.errors.listWkt', 'list wkt files failed'),
              resp.data.action.errors
            )
          )
        )
      )
    } else {
      yield put(listCoordinateSystemWktStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(listCoordinateSystemWktStartActions.failure())
    yield put(errorAction(e))
  }
}

/**
 * list wkt files info
 */
function* listWktFilesInfo() {
  try {
    const resp: AxiosResponse<CoordinateSystemWktListResponse> = yield call(
      api.coordsysListWktInfo
    )
    if (resp.data.action.status === 'error') {
      yield put(listCoordinateSystemWktInfoActions.failure())
      yield put(
        errorAction(
          new Error(
            composeErrorString(
              t('coordsys.errors.listWkt', 'list wkt files failed'),
              resp.data.action.errors
            )
          )
        )
      )
    } else {
      yield put(listCoordinateSystemWktInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(listCoordinateSystemWktInfoActions.failure())
    yield put(errorAction(e))
  }
}

/**
 * error while processing wkt files
 */
function* wktFileError(description?: string, error?: unknown) {
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
        title: t('coordsys.dialog.title', 'coordinate system'),
        text: message,
      } as IAlertProps,
    })
  )
  yield take(closeDialogAction)
}

/**
 * starts polling for retriving wkt file list
 */
function* wktListPollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<CoordinateSystemWktListResponse> =
        yield call(api.coordsysListWktInfo)
      console.info('[WKT_LIST] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        yield call(
          wktFileError,
          composeErrorString(
            t('coordsys.errors.listWkt', 'list wkt files failed'),
            response.data.action.errors
          )
        )
        yield put(listCoordinateSystemWktInfoActions.failure())
        break
      } else if (response.data?.action?.status === 'done') {
        // startProcessing done
        yield put(listCoordinateSystemWktInfoActions.success(response.data))
        yield put(listWktFilesDone())
        break
      } else {
        // not yet, update progress
        yield put(listCoordinateSystemWktInfoActions.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(listCoordinateSystemWktInfoActions.failure())
      yield call(wktFileError, 'import wkt file polling error', e)
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * List wkt Saga watcher
 */
function* wktListPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: CoordinateSystemWktListResponse
    } = yield take(listCoordinateSystemWktStartActions.success)
    console.info('[WKT_LIST] status', action.status)
    if (action.status === 'done') {
      console.info('[WKT_LIST] already done, no polling necessary')
    } else if (action.status !== 'error') {
      console.info('[WKT_LIST] start polling')
      // wait for successful startProcessing
      yield call(wktListPollSagaWorker)
    } else {
      yield call(
        wktFileError,
        composeErrorString(
          t('coordsys.errors.listWkt', 'list wkt files failed'),
          action.errors
        )
      )
      console.info('[WKT_LIST] no polling needed', action.status)
    }
  }
}

/**
 * import wkt file start
 */
function* wktImportStart({
  payload,
}: ReturnType<typeof importCoordinateSystemWktStartActions.request>) {
  try {
    // yield put({ type: 'POLLING_START_RECORDING_STOP' }) // stop polling
    const resp: AxiosResponse<CoordinateSystemWktImportResponse> = yield call(
      api.coordsysWktImportStart,
      payload
    )
    if (resp.data.action.status === 'error') {
      yield put(importCoordinateSystemWktStartActions.failure())
      yield put(
        errorAction(
          new Error(
            composeErrorString(
              t('coordsys.errors.importWkt', 'import wkt failed'),
              resp.data.action.errors
            )
          )
        )
      )
    } else {
      yield put(importCoordinateSystemWktStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(importCoordinateSystemWktStartActions.failure())
    yield put(errorAction(e))
  }
}

/**
 * import wkt file info
 */
function* wktImportInfo({
  payload,
}: ReturnType<typeof importCoordinateSystemWktInfoActions.request>) {
  try {
    const resp: AxiosResponse<CoordinateSystemWktImportResponse> = yield call(
      api.coordsysWktImportInfo,
      payload
    )
    if (resp.data.action.status === 'error') {
      yield put(importCoordinateSystemWktInfoActions.failure())
      yield put(
        errorAction(
          new Error(
            composeErrorString(
              t('coordsys.errors.importWkt', 'import wkt failed'),
              resp.data.action.errors
            )
          )
        )
      )
    } else {
      yield put(importCoordinateSystemWktInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(importCoordinateSystemWktInfoActions.failure())
    yield put(errorAction(e))
  }
}

/**
 * starts polling for import wkt file status
 */
function* wktImportPollSagaWorker() {
  while (true) {
    try {
      const systemName: string = yield select(selectCurrentSystem)
      const response: AxiosResponse<CoordinateSystemWktImportResponse> =
        yield call(api.coordsysWktImportInfo, { name: systemName })
      console.info('[WKT_IMPORT] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        yield call(
          wktFileError,
          composeErrorString(
            t('coordsys.errors.importWkt', 'import wkt file failed'),
            response.data.action.errors
          )
        )
        yield put(importCoordinateSystemWktInfoActions.failure())
        break
      } else if (response.data?.action?.status === 'done') {
        // startProcessing done
        yield put(importCoordinateSystemWktInfoActions.success(response.data))
        yield put(importWktFileDone())
        const { name } = yield select(selectCurrentSystem)
        yield put(getCoordinateSystemActions.request({ name: name }))
        yield put(closeDialogAction())
        break
      } else {
        // not yet, update progress
        yield put(importCoordinateSystemWktInfoActions.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(importCoordinateSystemWktInfoActions.failure())
      yield call(wktFileError, 'import wkt file error', e)
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * Import saga watcher.
 */
function* wktImportPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: CoordinateSystemWktImportResponse
    } = yield take(importCoordinateSystemWktStartActions.success)
    console.info('[WKT_IMPORT] status', action.status)
    if (action.status === 'done') {
      console.info('[WKT_IMPORT] already done, no polling necessary')
    } else if (action.status !== 'error') {
      console.info('[WKT_IMPORT] start polling')
      // wait for successful startProcessing
      yield call(wktImportPollSagaWorker)
    } else {
      yield call(
        wktFileError,
        composeErrorString(
          t('coordsys.errors.importWkt', 'import wkt file failed'),
          action.errors
        )
      )
      console.info('[WKT_IMPORT] no polling needed', action.status)
    }
  }
}

export function* coordsysWktSaga() {
  yield takeLatest(getCoordinateSystemWktActions.request, getWktInformation)
  yield takeLatest(deleteCoordinateSystemWktActions.request, deleteWktFile)
  yield takeLatest(
    listCoordinateSystemWktStartActions.request,
    listWktFilesStart
  )
  yield takeLatest(listCoordinateSystemWktInfoActions.request, listWktFilesInfo)
  yield all([fork(wktListPollSagaWatcher)])
  yield takeLatest(
    importCoordinateSystemWktStartActions.request,
    wktImportStart
  )
  yield takeLatest(importCoordinateSystemWktInfoActions.request, wktImportInfo)
  yield all([fork(wktImportPollSagaWatcher)])
}
