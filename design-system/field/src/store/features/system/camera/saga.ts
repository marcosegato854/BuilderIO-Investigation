// eslint-disable-next-line import/no-extraneous-dependencies
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import { all, fork, put, race, select, take } from 'redux-saga/effects'
import { store } from 'store'
import {
  actionsServiceStartRecordingAction,
  actionsServiceStopRecordingAction,
  selectActivationDone,
  selectRecordingStatus,
} from 'store/features/actions/slice'
import { ActionStatus } from 'store/features/actions/types'
import { selectPhase } from 'store/features/alignment/slice'
import { AlignmentPhase } from 'store/features/alignment/types'
import {
  cameraDisplayableNamesActions,
  selectDisconnectedCameraGroups,
} from 'store/features/camera/slice'
import { CameraGroup } from 'store/features/camera/types'
import {
  closeAllDialogsAction,
  openDialogAction,
  selectDialogs,
} from 'store/features/dialogs/slice'
import { DialogInfo } from 'store/features/dialogs/types'
import { errorAction } from 'store/features/errors/slice'
import { addSpeechText } from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'
import {
  getDisconnectedCameraCancelLabel,
  getDisconnectedCameraMessage,
  getDisconnectedCameraOkLabel,
  getReconnectedCameraCancelLabel,
  getReconnectedCameraMessage,
  getReconnectedCameraOkLabel,
} from 'store/features/system/camera/utils'
import { cameraDisconnectionNotifications } from 'store/features/system/notifications/notificationCodes'
import {
  logMessage,
  notificationMessageAction,
  notificationRemovalAction,
} from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
import { translateSystemNotification } from 'utils/notifications'

/**
 * SAGAS
 */
function* handleCameraDisconnection() {
  while (true) {
    const { payload }: { payload: SystemNotification } = yield take(
      notificationMessageAction
    )
    if (cameraDisconnectionNotifications.includes(payload.code)) {
      console.warn('[NOTIFICATION] camera disconnected received', payload.code)
      console.info('[NOTIFICATION] alert the user of camera disconnection')
      const isActivated: boolean = yield select(selectActivationDone)
      const recordingStatus: ActionStatus = yield select(selectRecordingStatus)
      const isRecording = recordingStatus === 'done'
      const message = getDisconnectedCameraMessage(isActivated, isRecording)
      const okLabel = getDisconnectedCameraOkLabel(isActivated, isRecording)
      const cancelLabel = getDisconnectedCameraCancelLabel(
        isActivated,
        isRecording
      )
      yield put(
        addSpeechText({
          content: { text: message, type: SpeechTextType.COLLECTION },
          priority: true,
        })
      )
      yield put(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            type: 'error',
            variant: isActivated ? 'colored' : 'grey',
            okButtonLabel: okLabel,
            cancelButtonLabel: cancelLabel,
            okButtonCallback: isRecording
              ? () => {
                  store.dispatch(closeAllDialogsAction())
                  store.dispatch(actionsServiceStopRecordingAction())
                  const message =
                    '[CAMERA_DISCONNECTION] [USER_ACTION] User stopped recording with a disconnected camera'
                  store.dispatch(logMessage(message))
                }
              : () => {
                  store.dispatch(closeAllDialogsAction())
                  console.warn(
                    '[CAMERA_DISCONNECTION] [USER_ACTION] user skip stop recording'
                  )
                },
            cancelButtonCallback: isRecording
              ? () => {
                  store.dispatch(closeAllDialogsAction())
                  const message =
                    '[CAMERA_DISCONNECTION] [USER_ACTION] User refused to stop recording with a disconnected camera'
                  store.dispatch(logMessage(message))
                }
              : () => {
                  store.dispatch(closeAllDialogsAction())
                  console.warn(
                    '[CAMERA_DISCONNECTION] [USER_ACTION] user cancel stop recording'
                  )
                },
            title: t('acquisition.deactivated_camera.title', 'Disconnected'),
            text: message,
          } as IAlertProps,
        })
      )
      yield put(cameraDisplayableNamesActions.request())
    }
  }
}

function* handleCameraReconnection() {
  while (true) {
    const { payload }: { payload: SystemNotification } = yield take(
      notificationRemovalAction
    )
    if (cameraDisconnectionNotifications.includes(payload.code)) {
      console.info('[NOTIFICATION] camera reconnected received')
      const isActivated: boolean = yield select(selectActivationDone)
      const recordingStatus: ActionStatus = yield select(selectRecordingStatus)
      const isRecording = recordingStatus === 'done'
      const alignmentPhase: AlignmentPhase = yield select(selectPhase)
      const readyToRecord = alignmentPhase === AlignmentPhase.INITIAL_DONE
      const dialogs: DialogInfo[] = yield select(selectDialogs)
      if (
        (dialogs[0]?.componentProps as IAlertProps)?.title ===
        t('acquisition.deactivated_camera.title', 'Disconnected')
      ) {
        console.info('[NOTIFICATION] remove disconnection alert')
        yield put(closeAllDialogsAction())
      }
      yield put(cameraDisplayableNamesActions.request())
      const [displayableCamerasResult]: [
        ReturnType<typeof cameraDisplayableNamesActions.success> | undefined
      ] = yield race([
        take(cameraDisplayableNamesActions.success),
        take(cameraDisplayableNamesActions.failure),
      ])
      if (displayableCamerasResult) {
        const disconnectedCameras: CameraGroup[] = yield select(
          selectDisconnectedCameraGroups
        )
        const hasDisconnectedCameras = disconnectedCameras.length > 0
        const okLabel = getReconnectedCameraOkLabel(
          isActivated,
          isRecording,
          hasDisconnectedCameras
        )
        const cancelLabel = getReconnectedCameraCancelLabel(
          isActivated,
          isRecording,
          hasDisconnectedCameras
        )
        const message = getReconnectedCameraMessage(
          isActivated,
          isRecording,
          readyToRecord,
          hasDisconnectedCameras
        )
        const canRestartRecording =
          readyToRecord &&
          !isRecording &&
          isActivated &&
          !hasDisconnectedCameras
        yield put(
          addSpeechText({
            content: { text: message, type: SpeechTextType.COLLECTION },
            priority: true,
          })
        )
        yield put(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: {
              type: 'message',
              variant: isActivated ? 'colored' : 'grey',
              okButtonLabel: okLabel,
              cancelButtonLabel: cancelLabel,
              okButtonCallback: canRestartRecording
                ? () => {
                    store.dispatch(closeAllDialogsAction())
                    store.dispatch(actionsServiceStartRecordingAction())
                    const message =
                      '[CAMERA_RECONNECTION] [USER_ACTION] User resumed recording after all cameras reconnected'
                    store.dispatch(logMessage(message))
                  }
                : () => {
                    store.dispatch(closeAllDialogsAction())
                    const message =
                      '[CAMERA_RECONNECTION] [USER_ACTION] User knows that a camera has been reconnected'
                    store.dispatch(logMessage(message))
                  },
              cancelButtonCallback: canRestartRecording
                ? () => {
                    store.dispatch(closeAllDialogsAction())
                    const message =
                      '[CAMERA_RECONNECTION] [USER_ACTION] User refused to resume recording after all cameras reconnected'
                    store.dispatch(logMessage(message))
                  }
                : () => {
                    store.dispatch(closeAllDialogsAction())
                    console.warn(
                      '[CAMERA_RECONNECTION] [USER_ACTION] user skip restart recording'
                    )
                  },
              title: t('acquisition.reactivated_camera.title', 'Disconnected'),
              text: message,
            } as IAlertProps,
          })
        )
      }
    }
  }
}

function* handleDeactivatedErrors() {
  while (true) {
    const { payload }: { payload: SystemNotification } = yield take(
      notificationMessageAction
    )
    const pathname: string = yield select(
      (state) => state.router.location.pathname
    )
    const section = pathname.split('/')[1]
    const silent =
      section === 'acquisition' ||
      cameraDisconnectionNotifications.includes(payload.code) ||
      payload.type !== SystemNotificationType.ERROR
    if (!silent) {
      const errorMessage = translateSystemNotification(payload)
      yield put(
        addSpeechText({
          content: {
            text: errorMessage.description,
            type: SpeechTextType.ERROR,
          },
          priority: true,
        })
      )
      yield put(errorAction(new Error(errorMessage.description)))
    }
  }
}

export function* systemCameraDisconnectionSaga() {
  yield all([fork(handleDeactivatedErrors)])
  yield all([fork(handleCameraDisconnection)])
  yield all([fork(handleCameraReconnection)])
}
