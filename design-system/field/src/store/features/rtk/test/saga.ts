// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import { composeErrorString, translateError } from 'utils/errors'
import {
  all,
  call,
  delay,
  fork,
  put,
  race,
  take,
  takeLatest,
} from 'redux-saga/effects'
import { openDialogAction } from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/rtk/api'
import { rtkServiceTestServerActions } from 'store/features/rtk/slice'
import { RtkServiceServerTestResponse } from 'store/features/rtk/types'

/**
 * SAGAS
 */
function* rtkTestServer({
  payload,
}: ReturnType<typeof rtkServiceTestServerActions.request>) {
  try {
    const resp: AxiosResponse<RtkServiceServerTestResponse> = yield call(
      api.rtkServerTest,
      payload
    )
    yield put(rtkServiceTestServerActions.success(resp.data))
  } catch (e) {
    yield put(rtkServiceTestServerActions.failure())
    yield put(errorAction(e))
  }
}

/**
 * error testing server
 */
function* testserverError(description?: string, error?: unknown) {
  const messages = [description]
  if (error) messages.push(translateError(error))
  const message = messages.join('<br />')
  yield put(
    openDialogAction({
      component: DialogNames.Alert,
      componentProps: {
        type: 'error',
        okButtonLabel: 'OK',
        title: t('rtk.test.title', 'RTK Server Test'),
        text: message,
      } as IAlertProps,
    })
  )
}

/**
 * starts polling for rtk testing
 * after successful authentication
 */
function* testServerPollSagaWorker() {
  // wait for successful rtk test
  while (true) {
    try {
      const response: AxiosResponse<RtkServiceServerTestResponse> = yield call(
        api.rtkServerTestInfo
      )
      console.info('[TESTSERVER] polling', response.data?.action?.status)
      if (!response.data.action || response.data?.action?.status === 'error') {
        // error
        console.info('[TESTSERVER] info failure')
        yield put(rtkServiceTestServerActions.failure())
        yield call(
          testserverError,
          composeErrorString(
            'Test failed',
            response.data.action?.errors,
            '<br />'
          )
        )
        break
      } else if (response.data?.action?.status === 'done') {
        // testserver done
        console.info('[TESTSERVER] info done')
        yield put(rtkServiceTestServerActions.success(response.data))
        break
      } else {
        // not yet, update progress
        console.info('[TESTSERVER] info progress', response.data)
        yield put(rtkServiceTestServerActions.success(response.data))
        yield delay(1000)
        // yield call(actionsTestServerInfo)
      }
    } catch (e) {
      console.error(e)
      yield put(rtkServiceTestServerActions.failure())
      console.error('[TESTSERVER] info error')
      yield call(testserverError, 'testserver polling failure', e)
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* testServerPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: RtkServiceServerTestResponse
    } = yield take(rtkServiceTestServerActions.success)
    console.info('[TESTSERVER] start testserver status', action!.status)
    if (action!.status !== 'error') {
      console.info('[TESTSERVER] start polling')
      // wait for successful testserver
      yield race([
        call(testServerPollSagaWorker),
        take('POLLING_TEST_SERVER_STOP'),
      ])
      console.info('[TESTSERVER] polling ended')
    } else {
      yield call(
        testserverError,
        composeErrorString('Test failed', action?.errors, '<br />')
      )
      console.info('[TESTSERVER] no polling needed', action!.status)
    }
  }
}

export function* testServerPollSaga() {
  yield all([fork(testServerPollSagaWatcher)])
  yield takeLatest(rtkServiceTestServerActions.request, rtkTestServer)
}
