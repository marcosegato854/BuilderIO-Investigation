// eslint-disable-next-line import/no-extraneous-dependencies
import { EventChannel, eventChannel, Task } from '@redux-saga/core'
import { t } from 'i18n/config'
import {
  all,
  call,
  cancel,
  delay,
  fork,
  put,
  race,
  select,
  take,
  takeLatest,
} from 'redux-saga/effects'
import { selectPosition } from 'store/features/position/slice'
import { PositionNotification } from 'store/features/position/types'
import {
  logMessage,
  logWarning,
  selectSystemServiceState,
  StateAction,
  stateMessageAction,
  stateSocketConnectionAction,
  stateSubscribeAction,
  stateUnsubscribeAction,
} from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
  SystemState,
} from 'store/features/system/types'
import { initClient } from 'store/services/socketClientBackend'
import { SocketNotificationCodes } from 'store/features/system/notifications/notificationCodes'
import { toJson } from 'utils/strings'
import { selectToken } from 'store/features/auth/slice'

/**
 * SAGAS
 */
// https://github.com/Lemoncode/redux-sagas-typescript-by-example/blob/master/07_channels/frontend/src/sagas/socket.ts
const connect = (token:string) => initClient('/system/state',token)

function subscribe(socket: WebSocket): EventChannel<StateAction> {
  return eventChannel((emit) => {
    // eslint-disable-next-line no-param-reassign
    socket.onmessage = (msg: MessageEvent<string>) => {
      const messageString = msg.data
      const message: SystemState = toJson(messageString, 'SYSTEM')
      // console.info('[STATE]', message)
      emit(stateMessageAction(message))
    }

    // eslint-disable-next-line no-param-reassign
    socket.onclose = (event) => {
      console.info('[STATE] onclose', new Date())
      if (event.wasClean) {
        // console.info(
        //   `[close] Connection Notifications WS closed cleanly, code=${event.code} reason=${event.reason}`
        // )
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.warn('[close] Connection State WS died', new Date())
      }
      // emit(notificationsUnsubscribeAction()) // disabled, otherwise it won't retry
      emit(stateSocketConnectionAction(false))
    }
    return () => {}
  })
}

function* read(socket: WebSocket) {
  const channel: EventChannel<StateAction> = yield call(subscribe, socket)
  while (true) {
    const action: StateAction = yield take(channel)
    yield put(action)
  }
}

function* waitForSubscription() {
  while (true) {
    yield take(stateSubscribeAction)
    console.info('[STATE] subscribe to socket')
    const token: string = yield select(selectToken)
    const { socket, error }: { socket?: WebSocket; error?: Error } = yield call(
      connect,token
    )
    if (socket && !error) {
      console.info('[STATE] connected to socket')
      yield put(stateSocketConnectionAction(true))
      const ioTask: Task = yield fork(handleIO, socket)
      yield take(stateUnsubscribeAction)
      console.info('[STATE] unsubscribed')
      yield cancel(ioTask)
      socket.close(1000, 'Work complete')
      yield put(stateSocketConnectionAction(false))
    } else {
      console.error('[STATE] error connecting')
      yield put(stateSocketConnectionAction(false))
    }
  }
}

function* handleConnectionErrors() {
  while (true) {
    const { stateSocketConnected } = yield select(selectSystemServiceState)
    const { payload }: ReturnType<typeof stateSocketConnectionAction> =
      yield take(stateSocketConnectionAction)
    if (payload !== stateSocketConnected) {
      const positionState: PositionNotification | null = yield select(
        selectPosition
      )
      const position = positionState?.position?.map || undefined
      const notification: SystemNotification = {
        code: SocketNotificationCodes.SYSTE_STATE_SOCKET_DISCONNECTED,
        description: payload
          ? t('errors.status_socket_connected', 'status socket resumed')
          : t('errors.status_socket', 'status socket disconnected'),
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

function* keepAlive() {
  while (true) {
    const [connectionResult, unsubscribeResult]: [
      ReturnType<typeof stateSocketConnectionAction> | undefined,
      ReturnType<typeof stateUnsubscribeAction> | undefined
    ] = yield race([
      take(stateSocketConnectionAction),
      take(stateUnsubscribeAction),
    ])
    if (connectionResult && !connectionResult.payload) {
      console.info('[STATE] should retry in 1sec')
      yield delay(1000)
      console.info('[STATE] retry')
      yield put(stateUnsubscribeAction()) // need to unsubscribe to unlock waitForSubscription
      yield put(stateSubscribeAction())
    } else if (unsubscribeResult) {
      console.info('[STATE] unsubscribe, stop trying')
      break
    }
  }
}

function* handleIO(socket: WebSocket) {
  yield fork(read, socket)
}

export function* systemStateSocketsSaga() {
  yield all([fork(waitForSubscription)])
  yield all([fork(handleConnectionErrors)])
  yield takeLatest(stateSubscribeAction, keepAlive)
}
