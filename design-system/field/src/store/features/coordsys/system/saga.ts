import { AxiosResponse } from 'axios'
import {
  all,
  call,
  delay,
  fork,
  put,
  take,
  takeLatest,
} from 'redux-saga/effects'
import api from 'store/features/coordsys/api'
import {
  deleteCoordinateSystemActions,
  getCoordinateSystemActions,
  getLastImportedCoordinateSystemActions,
  importCoordinateSystemDone,
  importCoordinateSystemInfoActions,
  importCoordinateSystemStartActions,
  listCoordinateSystemsInfoActions,
  listCoordinateSystemsStartActions,
  setCurrentCoordinateSystem,
} from 'store/features/coordsys/slice'
import {
  CoordinateSystemLastImported,
  CoordinateSystemDeleteResponse,
  CoordinateSystemGetResponse,
  CoordinateSystemImportSystemResponse,
  CoordinateSystemListSystemsResponse,
} from 'store/features/coordsys/types'
import { errorAction } from 'store/features/errors/slice'
import { composeErrorString, translateError } from 'utils/errors'
import { t } from 'i18n/config'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { DialogNames } from 'components/dialogs/dialogNames'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { store } from 'store'
import { ActionError } from 'store/features/actions/types'

/**
 * SAGAS
 */

/**
 * get coordinate system
 */

function* getCoordinateSystem({
  payload,
}: ReturnType<typeof getCoordinateSystemActions.request>) {
  try {
    const resp: AxiosResponse<CoordinateSystemGetResponse> = yield call(
      api.coordsysGetSystem,
      payload
    )
    yield put(getCoordinateSystemActions.success(resp.data))
  } catch (error) {
    yield put(getCoordinateSystemActions.failure())
  }
}

/**
 * delete coordinate system
 */

function* deleteCoordinateSystem({
  payload,
}: ReturnType<typeof deleteCoordinateSystemActions.request>) {
  try {
    const resp: AxiosResponse<CoordinateSystemDeleteResponse> = yield call(
      api.coordsysDeleteSystem,
      payload
    )
    yield put(deleteCoordinateSystemActions.success(resp.data))
    yield put(getLastImportedCoordinateSystemActions.request())
  } catch (error) {
    yield put(deleteCoordinateSystemActions.failure())
  }
}

/**
 * get last immported coordinate system
 */
function* getLastImportedCoordinateSystem() {
  try {
    const resp: AxiosResponse<CoordinateSystemLastImported> = yield call(
      api.coordsysLastImported
    )
    yield put(getLastImportedCoordinateSystemActions.success(resp.data))
  } catch (error) {
    yield put(getLastImportedCoordinateSystemActions.failure())
  }
}

/**
 * list coordinate system start
 */
function* listCoordinateSystemStart() {
  try {
    const resp: AxiosResponse<CoordinateSystemListSystemsResponse> = yield call(
      api.coordsysListSystemsStart
    )
    if (resp.data.action.status === 'error') {
      yield put(listCoordinateSystemsStartActions.failure())
      // error here
      yield put(
        errorAction(
          new Error(
            composeErrorString(
              t(
                'coordsys.errors.listSystems',
                'list coordinate systems failed'
              ),
              resp.data.action.errors
            )
          )
        )
      )
    } else {
      yield put(listCoordinateSystemsStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(listCoordinateSystemsStartActions.failure())
    yield put(errorAction(e))
  }
}

/**
 * list coordinate system info
 */
function* listCoordinateSystemInfo() {
  try {
    const resp: AxiosResponse<CoordinateSystemListSystemsResponse> = yield call(
      api.coordsysListSystemsInfo
    )
    if (resp.data.action.status === 'error') {
      yield put(listCoordinateSystemsInfoActions.failure())
      yield put(
        errorAction(
          new Error(
            composeErrorString(
              t('planning.errors.shp_list_failed', 'list SHP failed'),
              resp.data.action.errors
            )
          )
        )
      )
    } else {
      yield put(listCoordinateSystemsInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(listCoordinateSystemsInfoActions.failure())
    yield put(errorAction(e))
  }
}

/**
 * error while processing coordinate systems
 */
function* coordinateSystemError(description?: string, error?: unknown) {
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
  /* wait for the closure and call again for closing the import dialog */
  yield take(closeDialogAction)
  yield put(closeDialogAction())
}

/**
 * handle overwrite error dialog
 */
function* handleOverwriteError(error: ActionError) {
  const systemName = error.p2
  yield put(
    openDialogAction({
      component: DialogNames.Alert,
      componentProps: {
        type: 'warning',
        title: t('coordsys.overwriteDialog.title', {
          p2: systemName,
        }),
        text: t(
          'coordsys.overwriteDialog.text',
          'system already exists, use the stored one?'
        ),
        okButtonLabel: t('coordsys.overwriteDialog.okButton', 'proceed'),
        okButtonCallback: () => {
          store.dispatch(
            setCurrentCoordinateSystem({
              name: systemName || '',
              isAutomatic: false,
            })
          )
          store.dispatch(closeDialogAction())
        },
        cancelButtonLabel: t('coordsys.overwriteDialog.cancelButton', 'cancel'),
        cancelButtonCallback: () => {
          store.dispatch(closeDialogAction())
        },
      } as IAlertProps,
    })
  )
}

/**
 * starts polling for retriving coordinate system list
 */
function* coordinateSystemListPollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<CoordinateSystemListSystemsResponse> =
        yield call(api.coordsysListSystemsInfo)
      console.info('[COORDSYS_LIST] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        yield call(
          coordinateSystemError,
          composeErrorString(
            t('coordsys.errors.listSystems', 'list coordinate systems failed'),
            response.data.action.errors
          )
        )
        yield put(listCoordinateSystemsInfoActions.failure())
        break
      } else if (response.data?.action?.status === 'done') {
        // startProcessing done
        yield put(listCoordinateSystemsInfoActions.success(response.data))
        break
      } else {
        // not yet, update progress
        yield put(listCoordinateSystemsInfoActions.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(listCoordinateSystemsInfoActions.failure())
      yield call(
        coordinateSystemError,
        'import coordinate system polling error',
        e
      )
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * List Saga watcher
 */
function* coordinateSystemListPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: CoordinateSystemListSystemsResponse
    } = yield take(listCoordinateSystemsStartActions.success)
    console.info('[COORDSYS_LIST] status', action.status)
    if (action.status === 'done') {
      console.info('[COORDSYS_LIST] already done, no polling necessary')
    } else if (action.status !== 'error') {
      console.info('[COORDSYS_LIST] start polling')
      // wait for successful startProcessing
      yield call(coordinateSystemListPollSagaWorker)
    } else {
      yield call(
        coordinateSystemError,
        composeErrorString(
          t('coordsys.errors.listSystems', 'list coordinate systems failed'),
          action.errors
        )
      )
      console.info('[COORDSYS_LIST] no polling needed', action.status)
    }
  }
}

/**
 * import coordinate system start
 */
function* coordinateSystemImportStart({
  payload,
}: ReturnType<typeof importCoordinateSystemStartActions.request>) {
  try {
    // yield put({ type: 'POLLING_START_RECORDING_STOP' }) // stop polling
    const resp: AxiosResponse<CoordinateSystemImportSystemResponse> =
      yield call(api.coordsysImportSystemStart, payload)
    if (resp.data.action.status === 'error') {
      const nameError = resp.data.action.errors?.find(
        (error) => error.code === 'CS-001'
      )
      if (nameError) {
        yield call(handleOverwriteError, nameError)
      } else {
        yield call(
          coordinateSystemError,
          composeErrorString(
            t(
              'coordsys.errors.importSystem',
              'import coordinate system failed'
            ),
            resp.data.action.errors
          )
        )
      }
      yield put(importCoordinateSystemStartActions.failure())
    } else {
      yield put(importCoordinateSystemStartActions.success(resp.data))
    }
  } catch (e) {
    yield put(importCoordinateSystemStartActions.failure())
    yield put(errorAction(e))
  }
}

/**
 * import coordinate system info
 */
function* coordinateSystemImportInfo() {
  try {
    const resp: AxiosResponse<CoordinateSystemImportSystemResponse> =
      yield call(api.coordsysImportSystemInfo)
    if (resp.data.action.status === 'error') {
      const nameError = resp.data.action.errors?.find(
        (error) => error.code === 'CS-001'
      )
      if (nameError) {
        yield call(handleOverwriteError, nameError)
      } else {
        yield call(
          coordinateSystemError,
          composeErrorString(
            t(
              'coordsys.errors.importSystem',
              'import coordinate system failed'
            ),
            resp.data.action.errors
          )
        )
      }
      yield put(importCoordinateSystemInfoActions.failure())
    } else {
      yield put(importCoordinateSystemInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(importCoordinateSystemInfoActions.failure())
    yield put(errorAction(e))
  }
}

/**
 * starts polling for import coordinate system status
 */
function* coordinateSystemImportPollSagaWorker() {
  while (true) {
    try {
      const response: AxiosResponse<CoordinateSystemImportSystemResponse> =
        yield call(api.coordsysImportSystemInfo)
      console.info('[COORDSYS_IMPORT] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        const nameError = response.data.action.errors?.find(
          (error) => error.code === 'CS-001'
        )
        if (nameError) {
          yield call(handleOverwriteError, nameError)
        } else {
          yield call(
            coordinateSystemError,
            composeErrorString(
              t(
                'coordsys.errors.importSystem',
                'import coordinate system failed'
              ),
              response.data.action.errors
            )
          )
        }
        yield put(importCoordinateSystemInfoActions.failure())
        break
      } else if (response.data?.action?.status === 'done') {
        // startProcessing done
        yield put(importCoordinateSystemInfoActions.success(response.data))
        yield put(importCoordinateSystemDone())
        yield put(closeDialogAction())
        // open the info dialog for reviewing the coordinate system
        yield put(
          openDialogAction({
            component: DialogNames.CoordinateSystemInfo,
          })
        )
        break
      } else {
        // not yet, update progress
        yield put(importCoordinateSystemInfoActions.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(importCoordinateSystemInfoActions.failure())
      yield call(coordinateSystemError, 'import shp polling error', e)
      // yield put(errorAction(e))
      break
    }
  }
}

/**
 * Import saga watcher.
 */
function* coordinateSystemImportPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: CoordinateSystemImportSystemResponse
    } = yield take(importCoordinateSystemStartActions.success)
    console.info('[COORDSYS_IMPORT] status', action.status)
    if (action.status === 'done') {
      console.info('[COORDSYS_IMPORT] already done, no polling necessary')
    } else if (action.status !== 'error') {
      console.info('[COORDSYS_IMPORT] start polling')
      // wait for successful startProcessing
      yield call(coordinateSystemImportPollSagaWorker)
    } else {
      yield call(
        coordinateSystemError,
        composeErrorString(
          t('coordsys.errors.importSystem', 'import coordinate system failed'),
          action.errors
        )
      )
      console.info('[COORDSYS_IMPORT] no polling needed', action.status)
    }
  }
}

export function* coordsysSystemSaga() {
  yield takeLatest(getCoordinateSystemActions.request, getCoordinateSystem)
  yield takeLatest(
    deleteCoordinateSystemActions.request,
    deleteCoordinateSystem
  )
  yield takeLatest(
    getLastImportedCoordinateSystemActions.request,
    getLastImportedCoordinateSystem
  )
  yield takeLatest(
    listCoordinateSystemsStartActions.request,
    listCoordinateSystemStart
  )
  yield takeLatest(
    listCoordinateSystemsInfoActions.request,
    listCoordinateSystemInfo
  )
  yield all([fork(coordinateSystemListPollSagaWatcher)])
  yield takeLatest(
    importCoordinateSystemStartActions.request,
    coordinateSystemImportStart
  )
  yield takeLatest(
    importCoordinateSystemInfoActions.request,
    coordinateSystemImportInfo
  )
  yield all([fork(coordinateSystemImportPollSagaWatcher)])
}
