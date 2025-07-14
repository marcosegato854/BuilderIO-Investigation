import { all, fork, put, select, take } from 'redux-saga/effects'
import { selectIsAdmin } from 'store/features/auth/slice'
import { errorAction } from 'store/features/errors/slice'
import {
  HiddenStatusCodes,
  UserHiddenStatusCodes,
} from 'store/features/errors/types'
import {
  addSpeechText,
  selectCurrentText,
  advanceQueue,
  selectQueue,
  removeFirstItem,
  setCurrentText,
} from 'store/features/speech/slice'
import {
  AddSpeechTextPayload,
  SpeechText,
  SpeechTextType,
} from 'store/features/speech/types'
import { notificationCanBeReproduced } from 'store/features/system/notifications/notificationCodes'
import { notificationMessageAction } from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
import { extractErrorStatusCode, translateError } from 'utils/errors'

function* addSpeechTextAfterError() {
  while (true) {
    const { payload }: { payload: Error } = yield take(errorAction)
    const isAdmin: boolean = yield select(selectIsAdmin)
    if (HiddenStatusCodes.includes(extractErrorStatusCode(payload))) return
    if (
      !isAdmin &&
      UserHiddenStatusCodes.includes(extractErrorStatusCode(payload))
    )
      return
    const message = translateError(payload)
    const errorToSpeech: AddSpeechTextPayload = {
      content: {
        text: message,
        type: SpeechTextType.ERROR,
      },
      priority: true,
    }
    yield put(addSpeechText(errorToSpeech))
  }
}

function* addSpeechTextAfterNotification() {
  while (true) {
    const { payload }: { payload: SystemNotification } = yield take(
      notificationMessageAction
    )
    const pathname: string = yield select(
      (state) => state.router.location.pathname
    )
    const section = pathname.split('/')[1]
    /**
     * Exclude camera disconnection notifications (handled in the specific saga)
     * Exclude socket disconnection notifications
     * Notification comes already translated
     * Handle only notifications during 'acquisition'
     */
    if (
      notificationCanBeReproduced(payload.code) &&
      ['acquisition'].includes(section) &&
      payload.type !== SystemNotificationType.INTERNAL
    ) {
      yield put(
        addSpeechText({
          content: { text: payload.description, type: SpeechTextType.ERROR },
          priority: true,
        })
      )
    }
  }
}

function* setCurrentAtFirstAdd() {
  while (true) {
    yield take(addSpeechText)
    const current: SpeechText = yield select(selectCurrentText)
    if (current === null) {
      console.info('[TTS] saga: advanceQueue()')
      yield put(advanceQueue())
    }
  }
}

function* setCurrentAtAdvanceQueue() {
  while (true) {
    yield take(advanceQueue)
    const queue: SpeechText[] = yield select(selectQueue)
    console.info('[TTS] saga advanceQueue - queue status: ', queue)
    const newSpeechElement = queue[0] || null
    yield put(removeFirstItem())
    yield put(setCurrentText(newSpeechElement))
  }
}

export function* speechSaga() {
  yield all([fork(addSpeechTextAfterError)])
  yield all([fork(addSpeechTextAfterNotification)])
  yield all([fork(setCurrentAtFirstAdd)])
  yield all([fork(setCurrentAtAdvanceQueue)])
}
