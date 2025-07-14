import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import { put, takeLatest } from 'redux-saga/effects'
import { store } from 'store'
import { openDialogAction } from 'store/features/dialogs/slice'
import {
  confirmAbortAutocaptureAction,
  autocaptureAbortActions,
} from 'store/features/routing/slice'
import { addSpeechText } from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'

/**
 * SAGAS
 */
function* confirmAbort({
  payload,
}: ReturnType<typeof confirmAbortAutocaptureAction>) {
  console.info('[ROUTING] confirm abort')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dialogData: any = t('acquisition.routing.dialogs.abort', {
    returnObjects: true,
  })
  if (dialogData) {
    const { title, text, confirm, back } = dialogData
    yield put(
      addSpeechText({
        content: { text, type: SpeechTextType.NAVIGATION },
        priority: true,
      })
    )
    yield put(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          title,
          text,
          okButtonLabel: confirm,
          cancelButtonLabel: back,
          type: 'warning',
          variant: 'colored',
          okButtonCallback: () => {
            console.info('[ROUTING] send abort to backend')
            store.dispatch(autocaptureAbortActions.request())
            if (payload.confirmCallback) payload.confirmCallback()
          },
        } as IAlertProps,
      })
    )
  }
}

export function* routingAbortSaga() {
  yield takeLatest(confirmAbortAutocaptureAction, confirmAbort)
}
