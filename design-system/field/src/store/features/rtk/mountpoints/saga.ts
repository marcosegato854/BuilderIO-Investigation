// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { all, call, delay, fork, put, race, take } from 'redux-saga/effects'
import api from 'store/features/rtk/api'
import {
  rtkServiceAuthenticateServerActions,
  rtkServiceGetMountpointsAction,
  rtkServiceLoadMountpointsAction,
  rtkServiceServerError,
} from 'store/features/rtk/slice'
import {
  RtkServerError,
  RtkServiceLoadMountpointsResponse,
  RtkServiceServerAuthenticateResponse,
} from 'store/features/rtk/types'

const mountPointError: RtkServerError = {
  code: 'POS-010',
  description: 'Mount point unavailable',
}
/**
 * SAGAS
 */
/**
 * starts polling for mountpoints load
 * after successful authentication
 */
function* mountpointsPollSagaWorker() {
  // wait for successful mountpoints load
  while (true) {
    try {
      const respLoad: AxiosResponse<RtkServiceLoadMountpointsResponse> =
        yield call(api.rtkLoadMountpoints)
      console.info('[MOUNTPOINTS] polling', respLoad.data?.action?.status)
      if (respLoad.data?.action?.status === 'error') {
        yield put(rtkServiceAuthenticateServerActions.failure())
        const error = respLoad.data.action.errors![0] as RtkServerError
        console.error(error)
        yield put(
          rtkServiceServerError({
            code: error.code || '',
            description: error.description || undefined,
          })
        )
        break
      }
      if (respLoad.data?.action?.status !== 'done') {
        console.info('[MOUNTPOINTS] info progress', respLoad.data)
        // not yet, update progress
        yield put(rtkServiceLoadMountpointsAction(respLoad.data))
        yield delay(1000)
      } else {
        if (respLoad.data) {
          yield put(rtkServiceLoadMountpointsAction(respLoad.data))
          const { mountpoints } = respLoad.data.result || {}
          if (mountpoints) {
            console.info('[MOUNTPOINTS] mountpoints retrieved')
            yield put(rtkServiceGetMountpointsAction(mountpoints))
          } else {
            console.warn('[MOUNTPOINTS] no mountpoints found')
            yield put(rtkServiceAuthenticateServerActions.failure())
            yield put(rtkServiceServerError(mountPointError))
          }
        } else {
          console.warn('[MOUNTPOINTS] mountpoints without data')
          yield put(rtkServiceAuthenticateServerActions.failure())
          yield put(rtkServiceServerError(mountPointError))
        }
        break
      }
    } catch (e) {
      // remove loading
      console.error('[MOUNTPOINTS] info error', e)
      yield put(rtkServiceAuthenticateServerActions.failure())

      const error = e as RtkServerError
      yield put(
        rtkServiceServerError({
          code: error.code || '',
          description: error.description || undefined,
        })
      )
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* mountpointsPollSagaWatcher() {
  while (true) {
    // wait for successful authentication
    const {
      payload,
    }: {
      payload: RtkServiceServerAuthenticateResponse
    } = yield take(rtkServiceAuthenticateServerActions.success)
    const { action } = payload
    console.info('[MOUNTPOINTS] start mountpoints status', action!.status)
    yield put(rtkServiceLoadMountpointsAction(payload))
    if (action.status === 'accepted') {
      console.info('[MOUNTPOINTS] start polling')
      // wait for successful mountpoints load
      yield race([
        call(mountpointsPollSagaWorker),
        take('POLLING_MOUNTPOINTS_STOP'),
      ])
    }
  }
}

export function* mountpointsPollSaga() {
  yield all([fork(mountpointsPollSagaWatcher)])
}
