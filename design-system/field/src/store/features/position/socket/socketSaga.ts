// eslint-disable-next-line import/no-extraneous-dependencies
import { EventChannel, eventChannel, Task } from '@redux-saga/core'
import {
  call,
  put,
  fork,
  take,
  all,
  cancel,
  takeLatest,
  delay,
  race,
  select,
  debounce,
} from 'redux-saga/effects'
import { initClient } from 'store/services/socketClientBackend'
import { t } from 'i18n/config'
import { actionsServiceDeactivateSystemAction } from 'store/features/actions/slice'
import {
  PositionAction,
  positionMessageAction,
  positionSocketConnectionAction,
  statusSubscribeAction,
  statusUnsubscribeAction,
  selectPositionServiceState,
  selectPosition,
} from 'store/features/position/slice'
import { PositionNotification } from 'store/features/position/types'
import {
  logError,
  logMessage,
  logWarning,
  systemResponsivenessActions,
} from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
import { SocketNotificationCodes } from 'store/features/system/notifications/notificationCodes'
import { resetSocketsAction } from 'store/features/global/slice'
import { toJson } from 'utils/strings'
import { IS_TESTING } from 'utils/capabilities'
import { selectToken } from 'store/features/auth/slice'

/**
 * SAGAS
 */
// https://github.com/Lemoncode/redux-sagas-typescript-by-example/blob/master/07_channels/frontend/src/sagas/socket.ts
const connect = (token:string) => initClient('/position/state',token)

function subscribe(socket: WebSocket): EventChannel<PositionAction> {
  return eventChannel((emit) => {
    // eslint-disable-next-line no-param-reassign
    socket.onmessage = (msg: MessageEvent<string>) => {
      const statusString = msg.data
      const status: PositionNotification = toJson(statusString, 'POSITION')
      // console.info('[POSITION] message', status)
      emit(positionMessageAction(status))
    }

    // eslint-disable-next-line no-param-reassign
    socket.onclose = (event) => {
      if (event.wasClean) {
        // console.info(
        //   `[close] Connection Notifications WS closed cleanly, code=${event.code} reason=${event.reason}`
        // )
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.warn('[POSITION] [close] Connection Status WS died', new Date())
      }
      emit(positionSocketConnectionAction(false))
    }
    return () => {}
  })
}

function* read(socket: WebSocket) {
  const channel: EventChannel<PositionAction> = yield call(subscribe, socket)
  while (true) {
    const action: PositionAction = yield take(channel)
    yield put(action)
  }
}

function* waitForSubscription() {
  while (true) {
    yield take(statusSubscribeAction)
    console.info('[POSITION] subscribe to socket')
    const token: string = yield select(selectToken)
    const { socket, error }: { socket?: WebSocket; error?: Error } = yield call(
      connect,token
    )
    if (socket && !error) {
      console.info('[POSITION] connected to socket')
      yield put(positionSocketConnectionAction(true))
      const ioTask: Task = yield fork(handleIO, socket)
      yield take(statusUnsubscribeAction)
      yield cancel(ioTask)
      socket.close(1000, 'Work complete')
      yield put(positionSocketConnectionAction(false))
    } else {
      if (!IS_TESTING) console.error('[POSITION] error connecting')
      yield put(positionSocketConnectionAction(false))
    }
  }
}

function* restartSocket() {
  const pathname: string = yield select(
    (state) => state.router.location.pathname
  )
  const section = pathname.split('/')[1]
  if (section !== 'acquisition') return
  const errorMessage = `[POSITION] no position received for at least 5 seconds`
  yield put(logError(new Error(errorMessage)))
  yield put(resetSocketsAction())
  yield put(systemResponsivenessActions.request())
}

function* keepAlive() {
  const errorHandlerTask: Task = yield fork(handleConnectionErrors)
  while (true) {
    const [connectionResult, unsubscribeResult, locationChange]: [
      ReturnType<typeof positionSocketConnectionAction> | undefined,
      ReturnType<typeof statusUnsubscribeAction> | undefined,
      unknown | undefined
    ] = yield race([
      take(positionSocketConnectionAction),
      take(statusUnsubscribeAction),
      take('@@router/LOCATION_CHANGE'),
    ])
    if (connectionResult && !connectionResult.payload) {
      console.info('[POSITION] should retry in 1sec')
      yield delay(1000)
      console.info('[POSITION] retry')
      yield put(statusUnsubscribeAction()) // need to unsubscribe to unlock waitForSubscription
      yield put(statusSubscribeAction())
    } else if (unsubscribeResult) {
      console.info('[POSITION] unsubscribe, stop trying')
      yield cancel(errorHandlerTask)
    } else if (locationChange) {
      console.info('[POSITION] location change, stop trying')
      yield cancel(errorHandlerTask)
      break
    }
  }
}

function* handleConnectionErrors() {
  while (true) {
    const { positionSocketConnected } = yield select(selectPositionServiceState)
    const { payload }: ReturnType<typeof positionSocketConnectionAction> =
      yield take(positionSocketConnectionAction)
    if (payload !== positionSocketConnected) {
      const positionState: PositionNotification | null = yield select(
        selectPosition
      )
      const position = positionState?.position?.map || undefined
      const notification: SystemNotification = {
        code: SocketNotificationCodes.POSITION_SOCKET_DISCONNECTED,
        description: payload
          ? t('errors.position_socket_connected', 'position socket resumed')
          : t('errors.position_socket', 'position socket disconnected'),
        type: payload
          ? SystemNotificationType.REMOVE
          : SystemNotificationType.WARNING,
        mapPosition: position,
      }
      yield put(
        payload
          ? logMessage(notification.description)
          : logWarning(notification.description)
      )
    }
  }
}

/**
 *
 * @returns unsubscribe at deactivate system
 */
function* stopKeepAlive() {
  yield put(statusUnsubscribeAction())
}

function* handleIO(socket: WebSocket) {
  yield fork(read, socket)
}

export function* positionSocketsSaga() {
  yield all([fork(waitForSubscription)])
  yield takeLatest(statusSubscribeAction, keepAlive)
  yield takeLatest(actionsServiceDeactivateSystemAction, stopKeepAlive)
  yield debounce(5000, positionMessageAction, restartSocket)
}
