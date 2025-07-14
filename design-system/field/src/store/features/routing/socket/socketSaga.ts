/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line import/no-extraneous-dependencies
import { EventChannel, eventChannel, Task } from '@redux-saga/core'
import { t } from 'i18n/config'
import { isEmpty } from 'ramda'
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
import { actionsServiceDeactivateSystemAction } from 'store/features/actions/slice'
import { selectToken } from 'store/features/auth/slice'
import { selectPosition } from 'store/features/position/slice'
import { PositionNotification } from 'store/features/position/types'
import {
  RoutingAction,
  routingMessageAction,
  routingSocketConnectionAction,
  routingSubscribeAction,
  routingUnsubscribeAction,
  selectRoutingModule,
  selectRoutingServiceState,
} from 'store/features/routing/slice'
import { RoutingSocketNotification } from 'store/features/routing/types'
import { SocketNotificationCodes } from 'store/features/system/notifications/notificationCodes'
import { logMessage, logWarning } from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
import { initClient } from 'store/services/socketClientBackend'
import { IS_TESTING } from 'utils/capabilities'
import { toJson } from 'utils/strings'

/**
 * SAGAS
 */
// https://github.com/Lemoncode/redux-sagas-typescript-by-example/blob/master/07_channels/frontend/src/sagas/socket.ts
const connect = (token:string) => initClient('/routing',token)
// const connect = () => initMockClient('')

function subscribe(socket: WebSocket): EventChannel<RoutingAction> {
  return eventChannel((emit) => {
    /**
     * throttled to avoid performance issues
     */
    const emitterFunction = (msg: MessageEvent<string>) => {
      const statusString = msg.data
      try {
        if (isEmpty(statusString)) {
          console.warn('[ROUTING] empty message received', statusString)
          return
        }
        const status: RoutingSocketNotification = toJson(
          statusString,
          'ROUTING'
        )
        // if (status.action) {
        emit(routingMessageAction(status))
        // } else {
        //   emit(routingMessageAction(null))
        // }
      } catch (error) {
        console.error(error)
      }
    }
    // const throttleDelay = 500
    // const throttledEmitterFunction = throttle(
    //   throttleDelay,
    //   false,
    //   emitterFunction
    // )
    // eslint-disable-next-line no-param-reassign
    // socket.onmessage = throttledEmitterFunction
    // eslint-disable-next-line no-param-reassign
    socket.onmessage = emitterFunction

    // eslint-disable-next-line no-param-reassign
    socket.onclose = (event) => {
      if (event.wasClean) {
        // console.info(
        //   `[close] Connection Notifications WS closed cleanly, code=${event.code} reason=${event.reason}`
        // )
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.warn('[ROUTING] [close] Connection Status WS died', new Date())
      }
      emit(routingSocketConnectionAction(false))
    }
    return () => {}
  })
}

function* read(socket: WebSocket) {
  const channel: EventChannel<RoutingAction> = yield call(subscribe, socket)
  while (true) {
    const action: RoutingAction = yield take(channel)
    yield put(action)
  }
}

function* waitForSubscription() {
  while (true) {
    yield take(routingSubscribeAction)
    console.info('[ROUTING] subscribe to socket')
    const token: string = yield select(selectToken)
    const { socket, error }: { socket?: WebSocket; error?: Error } = yield call(
      connect,token
    )
    if (socket && !error) {
      console.info('[ROUTING] connected to socket')
      yield put(routingSocketConnectionAction(true))
      const ioTask: Task = yield fork(handleIO, socket)
      yield take(routingUnsubscribeAction)
      yield cancel(ioTask)
      console.info('[ROUTING] work complete')
      socket.close(1000, 'Work complete')
      yield put(routingSocketConnectionAction(false))
    } else {
      if (!IS_TESTING) console.error('[ROUTING] error connecting')
      yield put(routingSocketConnectionAction(false))
    }
  }
}

function* keepAlive() {
  const errorHandlerTask: Task = yield fork(handleConnectionErrors)
  while (true) {
    console.info('[ROUTING] keepAlive waiting for an event')
    const [connectionResult, unsubscribeResult, locationChange]: [
      ReturnType<typeof routingSocketConnectionAction> | undefined,
      ReturnType<typeof routingUnsubscribeAction> | undefined,
      any | undefined
    ] = yield race([
      take(routingSocketConnectionAction),
      take(routingUnsubscribeAction),
      take('@@router/LOCATION_CHANGE'),
    ])
    if (connectionResult && !connectionResult.payload) {
      console.info('[ROUTING] should retry in 1sec')
      yield delay(1000)
      console.info('[ROUTING] retry')
      const routingModuleEnabled: boolean = yield select(selectRoutingModule)
      if (routingModuleEnabled) {
        yield put(routingUnsubscribeAction()) // need to unsubscribe to unlock waitForSubscription
        yield put(routingSubscribeAction())
      } else {
        console.info('[ROUTING] disabled, no need to reconnect')
      }
    } else if (unsubscribeResult) {
      console.info('[ROUTING] unsubscribe, stop trying')
      yield cancel(errorHandlerTask)
      break
    } else if (
      locationChange &&
      locationChange.payload.location.pathname.indexOf('acquisition') < 0
    ) {
      console.info('[ROUTING] location change, stop trying')
      yield cancel(errorHandlerTask)
      break
    } else {
      console.info('[ROUTING] nothing happened, no need to reconnect')
    }
  }
}

function* handleConnectionErrors() {
  console.info('[ROUTING] init keepalive')
  while (true) {
    const { routingSocketConnected } = yield select(selectRoutingServiceState)
    const { payload }: ReturnType<typeof routingSocketConnectionAction> =
      yield take(routingSocketConnectionAction)
    if (payload !== routingSocketConnected) {
      const positionState: PositionNotification | null = yield select(
        selectPosition
      )
      const position = positionState?.position?.map || undefined
      const notification: SystemNotification = {
        code: SocketNotificationCodes.ROUTING_SOCKET_DISCONNECTED,
        description: payload
          ? t('errors.routing_socket_connected', 'routing socket resumed')
          : t('errors.routing_socket', 'routing socket disconnected'),
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

function* handleIO(socket: WebSocket) {
  yield fork(read, socket)
}

function* resetStatusAtDeacrivate() {
  console.info('[ROUTING] unsubscribe at deactivate')
  yield put(routingUnsubscribeAction())
}

// this way it cancels the keepAlive, otherwise it keeps trying until it succeeds
function* initKeepAlive() {
  while (true) {
    yield take(routingSubscribeAction)
    yield race([call(keepAlive), take(actionsServiceDeactivateSystemAction)])
  }
}

export function* routingSocketsSaga() {
  yield all([fork(waitForSubscription)])
  yield all([fork(initKeepAlive)])
  // yield takeLatest(routingSubscribeAction, keepAlive)
  // prettier-ignore
  yield takeLatest(actionsServiceDeactivateSystemAction, resetStatusAtDeacrivate)
}
