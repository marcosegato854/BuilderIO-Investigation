// eslint-disable-next-line import/no-extraneous-dependencies
import { EventChannel, eventChannel, Task } from '@redux-saga/core'
import {
  call,
  put,
  fork,
  take,
  all,
  cancel,
  delay,
  race,
  select,
  takeLatest,
} from 'redux-saga/effects'
import { t } from 'i18n/config'
import { initClient } from 'store/services/socketClientBackend'
import {
  PointCloudAction,
  pointCloudMessageAction,
  pointCloudConnected,
  pointCloudSubscribeAction,
  pointCloudUnsubscribeAction,
  selectPointCloudServiceState,
  selectPointcloudModule,
} from 'store/features/pointcloud/slice'
import { PointCloudNotification } from 'store/features/pointcloud/types'
import { selectPosition } from 'store/features/position/slice'
import { PositionNotification } from 'store/features/position/types'
import { logMessage, logWarning } from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
import { SocketNotificationCodes } from 'store/features/system/notifications/notificationCodes'
import { fixWindowsPath, toJson } from 'utils/strings'
import { IS_TESTING } from 'utils/capabilities'
import { selectToken } from '../auth/slice'

/**
 * SAGAS
 */
// https://github.com/Lemoncode/redux-sagas-typescript-by-example/blob/master/07_channels/frontend/src/sagas/socket.ts
const connect = (token:string) => initClient('/pointcloud',token)

function subscribe(socket: WebSocket): EventChannel<PointCloudAction> {
  return eventChannel((emit) => {
    // eslint-disable-next-line no-param-reassign
    socket.onmessage = (msg: MessageEvent<string>) => {
      const pointcloudObj: PointCloudNotification = toJson(
        fixWindowsPath(msg.data), // backslash gets interpreted as escape, but is part of the url
        'POINTCLOUD'
      )
      // console.info('[POINTCLOUD] message', pointcloudObj)
      emit(pointCloudMessageAction(pointcloudObj))
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
        console.warn(
          '[POINTCLOUD] [close] Connection Pointcloud WS died',
          new Date()
        )
      }
      emit(pointCloudConnected(false))
    }
    return () => {}
  })
}

function* read(socket: WebSocket) {
  const channel: EventChannel<PointCloudAction> = yield call(subscribe, socket)
  while (true) {
    const action: PointCloudAction = yield take(channel)
    yield put(action)
  }
}

function* waitForSubscription() {
  while (true) {
    yield take(pointCloudSubscribeAction)
    console.info('[POINTCLOUD] subscribe to socket')
    const token: string = yield select(selectToken)
    const { socket, error }: { socket?: WebSocket; error?: Error } = yield call(
      connect,token
    )
    if (socket && !error) {
      console.info('[POINTCLOUD] connected to socket')
      yield put(pointCloudConnected(true))
      const ioTask: Task = yield fork(handleIO, socket)
      yield take(pointCloudUnsubscribeAction)
      yield cancel(ioTask)
      socket.close(1000, 'Work complete')
      yield put(pointCloudConnected(false))
    } else {
      if (!IS_TESTING) console.error('[POINTCLOUD] error connecting')
      yield put(pointCloudConnected(false))
    }
  }
}

function* keepAlive() {
  const pointcloudModule: boolean = yield select(selectPointcloudModule)
  if (!pointcloudModule) return
  const errorHandlerTask: Task = yield fork(handleConnectionErrors)
  while (true) {
    const [connectionResult, unsubscribeResult]: [
      ReturnType<typeof pointCloudConnected> | undefined,
      ReturnType<typeof pointCloudUnsubscribeAction> | undefined
    ] = yield race([
      take(pointCloudConnected),
      take(pointCloudUnsubscribeAction),
    ])
    if (connectionResult && !connectionResult.payload) {
      console.info('[POINTCLOUD] should retry in 1sec')
      yield delay(1000)
      console.info('[POINTCLOUD] retry')
      yield put(pointCloudUnsubscribeAction()) // need to unsubscribe to unlock waitForSubscription
      yield put(pointCloudSubscribeAction())
    } else if (unsubscribeResult) {
      console.info('[POINTCLOUD] unsubscribe, stop trying')
      yield cancel(errorHandlerTask)
      break
    }
  }
}

function* handleConnectionErrors() {
  while (true) {
    const { connected } = yield select(selectPointCloudServiceState)
    const { payload }: ReturnType<typeof pointCloudConnected> = yield take(
      pointCloudConnected
    )
    if (payload !== connected) {
      const positionState: PositionNotification | null = yield select(
        selectPosition
      )
      const position = positionState?.position?.map || undefined
      const notification: SystemNotification = {
        code: SocketNotificationCodes.POINTCLOUDSOCKET_DISCONNECTED,
        description: payload
          ? t('errors.pointcloud_socket_connected', 'pointcloud socket resumed')
          : t('errors.pointcloud_socket', 'pointcloud socket disconnected'),
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
// function* stopKeepAlive() {
//   yield put(pointCloudUnsubscribeAction())
// }

function* handleIO(socket: WebSocket) {
  yield fork(read, socket)
}

export function* pointCloudSocketsSaga() {
  yield all([fork(waitForSubscription)])
  yield takeLatest(pointCloudSubscribeAction, keepAlive)
  // yield takeLatest(actionsServiceDeactivateSystemAction, stopKeepAlive)
}
