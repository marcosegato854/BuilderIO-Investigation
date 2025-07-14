/**
 * SAGAS
 */
// https://github.com/Lemoncode/redux-sagas-typescript-by-example/blob/master/07_channels/frontend/src/sagas/socket.ts

import { AxiosError } from 'axios'
import { select, takeLatest } from 'redux-saga/effects'
import { selectIsAdmin } from 'store/features/auth/slice'
import { errorAction } from 'store/features/errors/slice'
import { errorIsVisible, shortError } from 'utils/errors'

function* logErrorDisplay({ payload }: ReturnType<typeof errorAction>) {
  const isAdmin: boolean = yield select(selectIsAdmin)
  if (errorIsVisible(payload, isAdmin)) {
    const translated = shortError(payload as AxiosError)
    console.warn(`[MESSAGE_DISPLAYED] error: ${translated}`)
  }
}

export function* errorsSaga() {
  yield takeLatest(errorAction, logErrorDisplay)
}
