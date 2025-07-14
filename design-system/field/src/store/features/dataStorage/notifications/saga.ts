/* eslint-disable no-case-declarations */
// eslint-disable-next-line import/no-extraneous-dependencies
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { push } from 'connected-react-router'
import { t } from 'i18n/config'
import {
  all,
  fork,
  put,
  race,
  select,
  take,
  takeLatest,
} from 'redux-saga/effects'
import { Routes } from 'Routes'
import { store } from 'store'
import {
  dataStorageAvailableDisksActions,
  dataStorageJobsActions,
  dataStorageProcessingStatusActions,
  dataStorageProjectsActions,
  selectDataStorageCurrentDisk,
} from 'store/features/dataStorage/slice'
import {
  closeAllDialogsAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { dataStorageNotifications } from 'store/features/system/notifications/notificationCodes'
import {
  notificationMessageAction,
  systemResponsivenessActions,
} from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'

const notificationType = {
  0: 'message',
  1: 'warning',
  2: 'error',
  3: 'remove',
  4: 'annotation',
  5: 'internal',
}

const supportedNotifications = [
  SystemNotificationType.MESSAGE,
  SystemNotificationType.WARNING,
  SystemNotificationType.ERROR,
]

/**
 * SAGAS
 */
function* handleDataStorageNotifications() {
  while (true) {
    const { payload }: { payload: SystemNotification } = yield take(
      notificationMessageAction
    )
    if (
      dataStorageNotifications.includes(payload.code) &&
      supportedNotifications.includes(payload.type) &&
      payload.code !== 'DS-001'
    ) {
      const message = payload.description
      const okButton = t(
        `notifications.dataStorage.${payload.code}.okButton`,
        'OK'
      )
      if (payload.code === 'DS-042') {
        yield put(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: {
              type: notificationType[payload.type],
              variant: 'colored',
              text: message,
              okButtonLabel: okButton,
            } as IAlertProps,
          })
        )
      } else {
        yield put(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: {
              type: notificationType[payload.type],
              variant: 'colored',
              title: t(
                `notifications.dataStorage.${payload.code}.title`,
                'Disk notification'
              ),
              text: message,
              okButtonLabel: okButton,
            } as IAlertProps,
          })
        )
      }
    }
  }
}

function* handleDataStorageDiskDisconnection() {
  while (true) {
    const { payload }: { payload: SystemNotification } = yield take(
      notificationMessageAction
    )
    if (
      payload.code === 'DS-001' &&
      supportedNotifications.includes(payload.type)
    ) {
      const message = payload.description
      const okButton = t(
        `notifications.dataStorage.${payload.code}.okButton`,
        'OK'
      )
      yield put(dataStorageAvailableDisksActions.request())
      yield put(systemResponsivenessActions.request())
      yield put(dataStorageProjectsActions.request())
      yield race([
        take(dataStorageAvailableDisksActions.success),
        take(dataStorageAvailableDisksActions.failure),
      ])
      const pathname: string = yield select(
        (state) => state.router.location.pathname
      )
      const section = pathname.split('/')[1]
      const diskName = pathname.split('/')[2]
      const currentDisk: IDisk | undefined = yield select(
        selectDataStorageCurrentDisk
      )

      /**
       * This is the case of a disk change
       * not involving the current disk operation
       * or in a place without a disk/currentDisk
       */
      if (currentDisk?.name === diskName || !diskName) {
        // close open Dialog (in the case of a reconnection)
        yield put(closeAllDialogsAction())
        yield put(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: {
              type: notificationType[payload.type],
              variant: 'colored',
              text: message,
              okButtonLabel: okButton,
            } as IAlertProps,
          })
        )
      } else if (currentDisk?.name !== diskName && section === 'acquisition') {
        /**
         * If the current disk is removed in acquisition
         * the backend should crash
         */
        yield put(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: {
              type: notificationType[payload.type],
              variant: 'colored',
              okButtonLabel: t(
                'notifications.dataStorage.DS-010.okButton',
                'ok'
              ),
              title: t(
                'notifications.dataStorage.DS-010.title',
                'disk removed'
              ),
              text: t(
                'notifications.dataStorage.DS-010.text',
                'reconnect the disk'
              ),
            } as IAlertProps,
          })
        )
      } else {
        /**
         * This is the case of a disk change
         * involving the current disk operation
         * redirect brings to the projects page
         */
        yield put(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: {
              type: notificationType[payload.type],
              variant: 'colored',
              okButtonLabel: t(
                'notifications.dataStorage.currentDisk.okButton',
                'redirect'
              ),
              title: t(
                'notifications.dataStorage.currentDisk.title',
                'disk removed'
              ),
              text: t(
                'notifications.dataStorage.currentDisk.text',
                'reconnect or click redirect'
              ),
              okButtonCallback: () => {
                store.dispatch(push(Routes.PROJECTS))
              },
            } as IAlertProps,
          })
        )
      }
    }
  }
}

// handle the START notification "BK-PRC001" and update notification "BK-PRC002"
function* updateProcessingStatus({
  payload,
}: ReturnType<typeof notificationMessageAction>) {
  if (['BK-PRC002', 'BK-PRC001'].includes(payload.code)) {
    console.info('[NOTIFICATIONS] processing status updated, get updated info')
    yield put(dataStorageProcessingStatusActions.request())
  }
}

// handle the FINISH notification "BK-PRC002"
function* updateJobsWhenJobProcessed({
  payload,
}: ReturnType<typeof notificationMessageAction>) {
  if (payload.code === 'BK-PRC002') {
    console.info(
      '[NOTIFICATIONS] processing finished or updated, ready to reload'
    )
    // End notification is used also as an update when blur is done
    // yield put(dataStorageResetProcessing())
    yield put(dataStorageProjectsActions.request())
    yield put(dataStorageJobsActions.request())
  }
}

// prettier-ignore
export function* dataStorageNotificationSaga() {
  yield all([fork(handleDataStorageNotifications)])
  yield all([fork(handleDataStorageDiskDisconnection)])
  yield takeLatest(notificationMessageAction, updateProcessingStatus)
  yield takeLatest(notificationMessageAction, updateJobsWhenJobProcessed) 
}
