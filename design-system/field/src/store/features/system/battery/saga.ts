import { DialogNames } from 'components/dialogs/dialogNames'
import { all, fork, put, select, take } from 'redux-saga/effects'
import { openDialogAction } from 'store/features/dialogs/slice'
import { batterySytemNotifications } from 'store/features/system/notifications/notificationCodes'
import { notificationMessageAction } from 'store/features/system/slice'
import { SystemNotification } from 'store/features/system/types'
import { t } from 'i18n/config'
import { addSpeechText } from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'

/**
 * SAGAS
 */

function* handleBatteryNotifications() {
  while (true) {
    const { payload }: { payload: SystemNotification } = yield take(
      notificationMessageAction
    )
    /**
     * In 'acquisition' the notifications are already handled
     */
    const pathname: string = yield select(
      (state) => state.router.location.pathname
    )
    const section = pathname.split('/')[1]
    if (['acquisition'].includes(section)) return

    if (batterySytemNotifications.includes(payload.code)) {
      console.warn('[BATTERY] alert the user of battery low level')
      yield put(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            type: 'warning',
            variant: 'colored',
            text: t(`backend_errors.code.${payload.code}`, payload.description),
            okButtonLabel: t('backend_errors.dialogs.ok', 'ok'),
          },
        })
      )
      yield put(
        addSpeechText({
          content: { text: payload.description, type: SpeechTextType.ERROR },
          priority: true,
        })
      )
    }
  }
}

export function* systemBatteryNotificationsSaga() {
  yield all([fork(handleBatteryNotifications)])
}
