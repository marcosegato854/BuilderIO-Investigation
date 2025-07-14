// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosError, AxiosResponse } from 'axios'
import { call, put, takeLatest } from 'redux-saga/effects'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/rtk/api'
import {
  rtkServiceAuthenticateServerActions,
  rtkServiceDeleteServerActions,
  rtkServiceGetMountpointsAction,
  rtkServiceInfoActions,
  rtkServiceInterfaceModesActions,
  rtkServiceServerError,
  rtkServiceServersActions,
  rtkServiceSetCurrentServer,
  rtkServiceSubmitServerActions,
  rtkServiceUpdateServerActions,
} from 'store/features/rtk/slice'
import {
  RtkServerError,
  RtkServiceGetInfoResponse,
  RtkServiceInterfaceModesResponse,
  RtkServiceServerAuthenticateResponse,
  RtkServiceServersResponse,
  RtkServiceServerSubmitResponse,
} from 'store/features/rtk/types'
import { extractErrorData } from 'utils/errors'

/**
 * SAGAS
 */
function* rtkInterfaceModes() {
  try {
    const resp: AxiosResponse<RtkServiceInterfaceModesResponse> = yield call(
      api.rtkInterfaceModes
    )
    yield put(rtkServiceInterfaceModesActions.success(resp.data))
  } catch {
    yield put(rtkServiceInterfaceModesActions.failure())
  }
}

function* rtkServers() {
  try {
    const resp: AxiosResponse<RtkServiceServersResponse> = yield call(
      api.rtkServers
    )
    yield put(rtkServiceServersActions.success(resp.data))
  } catch {
    yield put(rtkServiceServersActions.failure())
  }
}

function* rtkDeleteServer({
  payload,
}: ReturnType<typeof rtkServiceDeleteServerActions.request>) {
  try {
    const resp: AxiosResponse<RtkServiceServerSubmitResponse> = yield call(
      api.rtkServerDelete,
      payload
    )
    yield put(rtkServiceDeleteServerActions.success(resp.data))
  } catch (e) {
    yield put(rtkServiceDeleteServerActions.failure())
    yield put(errorAction(e))
  }
}

function* rtkInfo() {
  try {
    const resp: AxiosResponse<RtkServiceGetInfoResponse> = yield call(
      api.rtkServerInfo
    )
    yield put(rtkServiceInfoActions.success(resp.data))
  } catch (e) {
    yield put(rtkServiceInfoActions.failure())
    yield put(errorAction(e))
  }
}

function* rtkAuthenticateServer({
  payload,
}: ReturnType<typeof rtkServiceAuthenticateServerActions.request>) {
  try {
    console.info('[RTK] authenticating')
    yield put(rtkServiceGetMountpointsAction([]))
    const resp: AxiosResponse<RtkServiceServerAuthenticateResponse> =
      yield call(api.rtkServerAuthenticate, payload)
    yield put(rtkServiceAuthenticateServerActions.success(resp.data))
    console.info('[RTK] logged in')
    // needed here otherwise server data could be not in sync
    yield put(rtkServiceSetCurrentServer({ ...payload, connected: true }))
  } catch (e) {
    yield put(rtkServiceAuthenticateServerActions.failure())
    const error = extractErrorData(e as AxiosError)
    yield put(
      rtkServiceServerError({
        code: error?.code || '',
        description: error?.description || undefined,
      })
    )
    // reset should happen only when user clicks 'cancel'
    // yield put(rtkServiceResetCurrentServerConnection())
  }
}

function* rtkSubmitServer({
  payload,
}: ReturnType<typeof rtkServiceSubmitServerActions.request>) {
  try {
    const resp: AxiosResponse<RtkServiceServerSubmitResponse> = yield call(
      api.rtkServerSubmit,
      payload
    )
    yield put(rtkServiceSubmitServerActions.success(resp.data))
    yield put(rtkServiceSetCurrentServer(resp.data))
  } catch (e) {
    yield put(rtkServiceSubmitServerActions.failure())
    // yield put(errorAction(e))
    const error = e as RtkServerError
    yield put(
      rtkServiceServerError({
        code: error.code || '',
        description: error.description || undefined,
      })
    )
    // reset should happen only when user clicks 'cancel'
    // yield put(rtkServiceResetCurrentServerConnection())
  }
}

function* rtkUpdateServer({
  payload,
}: ReturnType<typeof rtkServiceUpdateServerActions.request>) {
  try {
    const resp: AxiosResponse<RtkServiceServerSubmitResponse> = yield call(
      api.rtkServerUpdate,
      payload
    )
    yield put(rtkServiceUpdateServerActions.success(resp.data))
    yield put(rtkServiceSetCurrentServer(resp.data))
  } catch (e) {
    yield put(rtkServiceUpdateServerActions.failure())
    yield put(errorAction(e))
  }
}

export function* rtkBackendSaga() {
  yield takeLatest(rtkServiceServersActions.request, rtkServers)
  yield takeLatest(rtkServiceDeleteServerActions.request, rtkDeleteServer)
  yield takeLatest(rtkServiceInfoActions.request, rtkInfo)
  yield takeLatest(rtkServiceInterfaceModesActions.request, rtkInterfaceModes)
  yield takeLatest(
    rtkServiceAuthenticateServerActions.request,
    rtkAuthenticateServer
  )
  yield takeLatest(rtkServiceSubmitServerActions.request, rtkSubmitServer)
  yield takeLatest(rtkServiceUpdateServerActions.request, rtkUpdateServer)
}
