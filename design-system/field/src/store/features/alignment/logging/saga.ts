import {
  all,
  fork,
  put,
  race,
  select,
  take,
  takeLatest,
} from 'redux-saga/effects'
import {
  alignmentCommandActions,
  alignmentMessageAction,
  alignmentStatusActions,
  selectAlignment,
} from 'store/features/alignment/slice'
import {
  AlignmentCommand,
  AlignmentNotification,
} from 'store/features/alignment/types'
import { selectIsAdmin } from 'store/features/auth/slice'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'
import { logWarning } from 'store/features/system/slice'
import { translateAlignmentNotificationMessage } from 'utils/notifications'

/**
 * SAGAS
 */

function* alignmentCommand({
  payload,
}: ReturnType<typeof alignmentCommandActions.request>) {
  if (payload.action === AlignmentCommand.SKIP) {
    yield put(
      logWarning(
        '[ALIGNMENT] [USER_ACTION] user skipped the alignment before completion'
      )
    )
  }
}

function* monitorStateChanges() {
  while (true) {
    const savedDialog: AlignmentNotification = yield select(selectAlignment)
    const results: [
      ReturnType<typeof alignmentMessageAction> | undefined,
      ReturnType<typeof alignmentStatusActions.success> | undefined
    ] = yield race([take(alignmentMessageAction), take(alignmentMessageAction)])
    const response: { payload: AlignmentNotification } =
      results.filter(Boolean)[0]!
    const newState = response?.payload.dialog
    if (savedDialog?.dialog !== newState) {
      const isAdmin: boolean = yield select(selectIsAdmin)
      const currentProject: IProject = yield select(
        selectDataStorageCurrentProject
      )
      const { description } = response.payload
      const translated = translateAlignmentNotificationMessage(
        {
          description,
          messageCode: response.payload.messageCode || '',
          space: response.payload.space,
          time: response.payload.time,
        },
        currentProject?.coordinate?.unit || 'metric'
      )
      console.info(
        `[MESSAGE_DISPLAYED] alignment notification: ${translated} - admin: ${isAdmin}`
      )
    }
  }
}

export function* alignmentLoggingSaga() {
  yield all([fork(monitorStateChanges)])
  yield takeLatest(alignmentCommandActions.request, alignmentCommand)
}
