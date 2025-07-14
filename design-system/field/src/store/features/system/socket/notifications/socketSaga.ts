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
  notificationMessageAction,
  notificationRemovalAction,
  notificationsSocketConnectionAction,
  notificationsSubscribeAction,
  notificationsUnsubscribeAction,
  selectSystemServiceState,
  StateAction,
  systemNotificationsActions,
} from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
import { initClient } from 'store/services/socketClientBackend'
import { translateSystemNotification } from 'utils/notifications'
import { SocketNotificationCodes } from 'store/features/system/notifications/notificationCodes'
import { toJson } from 'utils/strings'
import { selectToken } from 'store/features/auth/slice'

/**
 * SAGAS
 */
// https://github.com/Lemoncode/redux-sagas-typescript-by-example/blob/master/07_channels/frontend/src/sagas/socket.ts
const connect = (token:string) => initClient('/notification',token)

function subscribe(socket: WebSocket): EventChannel<StateAction> {
  return eventChannel((emit) => {
    // eslint-disable-next-line no-param-reassign
    socket.onmessage = (msg: MessageEvent<string>) => {
      const notificationString = msg.data
      const notification: SystemNotification = toJson(
        notificationString,
        'SYSTEM'
      )
      const translatedNotification = translateSystemNotification(notification)
      console.info(
        `[NOTIFICATION] ${translatedNotification.type}`,
        translatedNotification
      )
      // TODO: if id is missing we could add a timestamp
      if (translatedNotification.type === SystemNotificationType.REMOVE) {
        emit(notificationRemovalAction(translatedNotification))
        return
      }
      emit(notificationMessageAction(translatedNotification))
    }

    // eslint-disable-next-line no-param-reassign
    socket.onclose = (event) => {
      console.info('[NOTIFICATION] onclose', new Date())
      if (event.wasClean) {
        // console.info(
        //   `[close] Connection Notifications WS closed cleanly, code=${event.code} reason=${event.reason}`
        // )
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.warn('[close] Connection Notification WS died', new Date())
        emit(systemNotificationsActions.failure())
      }
      // emit(notificationsUnsubscribeAction()) // disabled, otherwise it won't retry
      emit(notificationsSocketConnectionAction(false))
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
    yield take(notificationsSubscribeAction)
    console.info('[NOTIFICATION] subscribe to socket')
    const token: string = yield select(selectToken)
    const { socket, error }: { socket?: WebSocket; error?: Error } = yield call(
      connect,token
    )
    if (socket && !error) {
      console.info('[NOTIFICATION] connected to socket')
      yield put(notificationsSocketConnectionAction(true))
      const ioTask: Task = yield fork(handleIO, socket)
      yield take(notificationsUnsubscribeAction)
      console.info('[NOTIFICATION] unsubscribed')
      yield cancel(ioTask)
      socket.close(1000, 'Work complete')
      yield put(notificationsSocketConnectionAction(false))
    } else {
      console.error('[NOTIFICATION] error connecting')
      yield put(notificationsSocketConnectionAction(false))
    }
  }
}

function* handleConnectionErrors() {
  while (true) {
    const { notificationsSocketConnected } = yield select(
      selectSystemServiceState
    )
    const { payload }: ReturnType<typeof notificationsSocketConnectionAction> =
      yield take(notificationsSocketConnectionAction)
    if (payload !== notificationsSocketConnected) {
      const positionState: PositionNotification | null = yield select(
        selectPosition
      )
      const position = positionState?.position?.map || undefined
      const notification: SystemNotification = {
        code: SocketNotificationCodes.NOTIFICATIONS_SOCKET_DISCONNECTED,
        description: payload
          ? t(
              'errors.notifications_socket_connected',
              'notifications socket resumed'
            )
          : t(
              'errors.notifications_socket',
              'notifications socket disconnected'
            ),
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
      ReturnType<typeof notificationsSocketConnectionAction> | undefined,
      ReturnType<typeof notificationsUnsubscribeAction> | undefined
    ] = yield race([
      take(notificationsSocketConnectionAction),
      take(notificationsUnsubscribeAction),
    ])
    if (connectionResult && !connectionResult.payload) {
      console.info('[NOTIFICATION] should retry in 1sec')
      yield delay(1000)
      console.info('[NOTIFICATION] retry')
      yield put(notificationsUnsubscribeAction()) // need to unsubscribe to unlock waitForSubscription
      yield put(notificationsSubscribeAction())
    } else if (unsubscribeResult) {
      console.info('[NOTIFICATION] unsubscribe, stop trying')
      break
    }
  }
}

function* handleIO(socket: WebSocket) {
  yield fork(read, socket)
}

export function* systemNotificationsSocketsSaga() {
  yield all([fork(waitForSubscription)])
  yield all([fork(handleConnectionErrors)])
  yield takeLatest(notificationsSubscribeAction, keepAlive)
}
