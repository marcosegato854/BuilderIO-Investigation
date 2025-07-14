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
import {
  AlignmentAction,
  alignmentMessageAction,
  alignmentSocketConnectionAction,
  alignmentStatusActions,
  alignmentSubscribeAction,
  alignmentUnsubscribeAction,
  selectAlignmentServiceState,
} from 'store/features/alignment/slice'
import { AlignmentNotification } from 'store/features/alignment/types'
import { selectToken } from 'store/features/auth/slice'
import { selectPosition } from 'store/features/position/slice'
import { PositionNotification } from 'store/features/position/types'
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
const connect = (token:string) => initClient('/position/alignment', token)

function subscribe(socket: WebSocket): EventChannel<AlignmentAction> {
  return eventChannel((emit) => {
    /**
     * throttled to avoid performance issues
     */
    const emitterFunction = (msg: MessageEvent<string>) => {
      const statusString = msg.data
      const status: AlignmentNotification = toJson(statusString, 'ALIGNMENT')
      // console.info('[ALIGNMENT] message', status)
      emit(alignmentMessageAction(status))
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
        console.warn(
          '[ALIGNMENT] [close] Connection Status WS died',
          new Date()
        )
      }
      emit(alignmentSocketConnectionAction(false))
    }
    return () => {}
  })
}

function* read(socket: WebSocket) {
  const channel: EventChannel<AlignmentAction> = yield call(subscribe, socket)
  while (true) {
    const action: AlignmentAction = yield take(channel)
    yield put(action)
  }
}

function* waitForSubscription() {
  while (true) {
    yield take(alignmentSubscribeAction)
    console.info('[ALIGNMENT] subscribe to socket')
    const token: string = yield select(selectToken)
    const { socket, error }: { socket?: WebSocket; error?: Error } = yield call(
      connect,token
    )
    if (socket && !error) {
      console.info('[ALIGNMENT] connected to socket')
      yield put(alignmentSocketConnectionAction(true))
      const ioTask: Task = yield fork(handleIO, socket)
      yield take(alignmentUnsubscribeAction)
      yield cancel(ioTask)
      socket.close(1000, 'Work complete')
      yield put(alignmentSocketConnectionAction(false))
    } else {
      if (!IS_TESTING) console.error('[ALIGNMENT] error connecting')
      yield put(alignmentSocketConnectionAction(false))
    }
  }
}

function* keepAlive() {
  const errorHandlerTask: Task = yield fork(handleConnectionErrors)
  while (true) {
    const [connectionResult, unsubscribeResult, locationChange]: [
      ReturnType<typeof alignmentSocketConnectionAction> | undefined,
      ReturnType<typeof alignmentUnsubscribeAction> | undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any | undefined
    ] = yield race([
      take(alignmentSocketConnectionAction),
      take(alignmentUnsubscribeAction),
      take('@@router/LOCATION_CHANGE'),
    ])
    if (connectionResult && !connectionResult.payload) {
      console.info('[ALIGNMENT] should retry in 1sec')
      yield delay(1000)
      console.info('[ALIGNMENT] retry')
      yield put(alignmentUnsubscribeAction()) // need to unsubscribe to unlock waitForSubscription
      yield put(alignmentSubscribeAction())
    } else if (unsubscribeResult) {
      console.info('[ALIGNMENT] unsubscribe, stop trying')
      yield cancel(errorHandlerTask)
    } else if (
      locationChange &&
      locationChange.payload.location.pathname.indexOf('acquisition') < 0
    ) {
      console.info('[ALIGNMENT] location change, stop trying')
      yield cancel(errorHandlerTask)
      break
    }
  }
}

function* handleConnectionErrors() {
  while (true) {
    const { alignmentSocketConnected } = yield select(
      selectAlignmentServiceState
    )
    const { payload }: ReturnType<typeof alignmentSocketConnectionAction> =
      yield take(alignmentSocketConnectionAction)
    if (payload !== alignmentSocketConnected) {
      const positionState: PositionNotification | null = yield select(
        selectPosition
      )
      const position = positionState?.position?.map || undefined
      const notification: SystemNotification = {
        code: SocketNotificationCodes.ALIGNMENT_SOCKET_DISCONNECTED,
        description: payload
          ? t('errors.alignment_socket_connected', 'alignment socket resumed')
          : t('errors.alignment_socket', 'alignment socket disconnected'),
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

/** update alignment state when connected successfully */
function* updateAlignmentState({
  payload,
}: ReturnType<typeof alignmentSocketConnectionAction>) {
  console.info('[ALIGNMENT] update status? ', payload)
  if (payload === true) {
    yield put(alignmentStatusActions.request())
  }
}

export function* alignmentSocketsSaga() {
  yield all([fork(waitForSubscription)])
  yield takeLatest(alignmentSubscribeAction, keepAlive)
  yield takeLatest(alignmentSocketConnectionAction, updateAlignmentState)
}
