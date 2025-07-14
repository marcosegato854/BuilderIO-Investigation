/**
 * SAGAS
 */
// https://github.com/Lemoncode/redux-sagas-typescript-by-example/blob/master/07_channels/frontend/src/sagas/socket.ts

import {
  take,
  race,
  all,
  fork,
  put,
  takeLatest,
  select,
} from 'redux-saga/effects'
import { selectIsAdmin } from 'store/features/auth/slice'
import {
  dataStorageNewProjectActions,
  dataStorageUpdateProjectActions,
} from 'store/features/dataStorage/slice'
import {
  closeAllDialogsAction,
  openDialogAction,
} from 'store/features/dialogs/slice'

/**
 * Automatically close dialogs on specific actions dispatches
 */
function* checkForDialogCloseActions() {
  while (true) {
    yield race([
      take(dataStorageNewProjectActions.success),
      take(dataStorageUpdateProjectActions.success),
      // take(dataStorageNewJobActions.success),
      // take(dataStorageUpdateJobActions.success),
    ])
    yield put(closeAllDialogsAction())
  }
}

/**
 * Log dialog display
 */
function* logOpenDialog({ payload }: ReturnType<typeof openDialogAction>) {
  const isAdmin: boolean = yield select(selectIsAdmin)
  const { component, componentProps = {} } = payload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { title = '', text = '', message = '' } = componentProps as any
  console.info(
    `[MESSAGE_DISPLAYED] open dialog: ${component} - ${title} - ${
      text || message
    } - admin: ${isAdmin}`
  )
}

export function* dialogsSaga() {
  yield all([fork(checkForDialogCloseActions)])
  yield takeLatest(openDialogAction, logOpenDialog)
}
