import { AxiosResponse } from 'axios'
import { all, fork, call, put, take, takeLatest, select } from 'redux-saga/effects'

import { extractTokenFromHeader } from 'utils/strings'

import { Routes } from 'Routes'
import { push } from 'connected-react-router'
import {
  getUserInfoActions,
  loginActions,
  logoutActions,
  selectIsLoggedIn,
  setTokenAction,
} from 'store/features/auth/slice'
import { LoginResponse, UserInfoResponse } from 'store/features/auth/types'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/auth/api'
import { resetStoreAction } from 'store/features/global/slice'
import { notificationMessageAction } from '../system/slice'
import { SystemNotification, SystemNotificationType } from '../system/types'
import { openDialogAction } from '../dialogs/slice'
import { DialogNames } from 'components/dialogs/dialogNames'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { t } from 'i18n/config'

/**
 * SAGAS
 */
export function* login({ payload }: ReturnType<typeof loginActions.request>) {
  try {
    // save the preference
    const { rememberMe } = payload
    yield localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false')
    // API call
    const resp: AxiosResponse<LoginResponse> = yield call(api.login, payload)
    yield put(loginActions.success(resp.data))
  } catch (e) {
    yield put(loginActions.failure())
    yield put(errorAction(e))
    // redirect to LOGIN if you're using QR code and something wrong happens
    yield put(push(Routes.LOGIN))
  }
}
export function* logout() {
  try {
    // API call
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const resp: AxiosResponse<undefined> = yield call(api.logout)
    yield put(logoutActions.success())
  } catch (e) {
    yield put(logoutActions.failure())
    yield put(errorAction(e))
  }
}

export function* getUserInfo() {
  try {
    // API call
    const resp: AxiosResponse<UserInfoResponse> = yield call(api.getUserInfo)
    yield put(getUserInfoActions.success(resp.data))
  } catch (e) {
    yield put(getUserInfoActions.failure())
    yield put(errorAction(e))
  }
}

export function* saveToken(response: ReturnType<typeof loginActions.success>) {
  const { payload } = response
  const rememberMe: string = yield localStorage.getItem('rememberMe')
  if (rememberMe !== 'true') return
  const token = extractTokenFromHeader(payload.authorization)
  yield localStorage.setItem('PEF_token', token)
  yield put(setTokenAction(token))
}

export function* deleteToken() {
  yield localStorage.removeItem('PEF_token')
}

export function* resetStore() {
  console.info('[STARTUP] reset store at logout')
  yield put(resetStoreAction())
}

export function* redirectToLogin() {
  console.info('[STARTUP] redirect at logout')
  yield put(push(Routes.LOGIN))
}
export function* notificationHandler() {
  console.info('[USER NOTIFICATION] userLoggedInOrOut')
  while (true) {
    const { payload }: { payload: SystemNotification } = yield take(
      notificationMessageAction
    )
    const isLoggedIn: boolean = yield select(selectIsLoggedIn)
    if (isLoggedIn && (payload.code === 'USR-003' || payload.code === 'USR-004')) {
      const message = payload.description
      const okButton = t(
        `notifications.dataStorage.${payload.code}.okButton`,
        'OK'
      )
      yield put(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            type: 'message',
            variant: 'grey',
            text: message,
            okButtonLabel: okButton,
          } as IAlertProps,
        })
      )
    }
  }
}

// function* relogin() {
//   try {
//     const resp: AxiosResponse<AuthResponse> = yield call(api.relogin)

//     yield put(loginActions.success(resp.data))
//   } catch {
//     yield put(loginActions.failure())
//   }
// }

// function* signUp({ payload }: ReturnType<typeof signUpAction>) {
//   try {
//     const resp: AxiosResponse<AuthResponse> = yield call(api.signUp, payload)

//     yield put(loginActions.success(resp.data))
//   } catch {
//     yield put(loginActions.failure())
//   }
// }

// function* forgottenPassword({
//   payload,
// }: ReturnType<typeof forgottenPasswordAction>) {
//   try {
//     yield call(api.forgottenPassword, payload)

//     // message.success(
//     //   t('auth.forgottenPasswordSent', {
//     //     defaultValue: 'An e-mail with further instructions has been sent to your e-mail address.',
//     //   })
//     // );

//     yield put(push(rootPath))
//   } catch {
//     // handle???
//   }
// }

// function* resetPassword({ payload }: ReturnType<typeof resetPasswordAction>) {
//   try {
//     const resp: AxiosResponse<AuthResponse> = yield call(
//       api.resetPassword,
//       payload
//     )

//     yield put(loginActions.success(resp.data))
//   } catch {
//     yield put(loginActions.failure())
//   }
// }

// function* activateAccount({
//   payload,
// }: ReturnType<typeof activateAccountAction>) {
//   try {
//     const resp: AxiosResponse<AuthResponse> = yield call(
//       api.activateAccount,
//       payload
//     )

//     // message.success(
//     //   t('auth.accountActivated', { defaultValue: 'Your account has been activated successfully.' })
//     // );

//     yield put(loginActions.success(resp.data))
//   } catch {
//     yield put(loginActions.failure())
//   }

//   yield put(push(rootPath))
// }

export function* authSaga() {
  yield all([fork(notificationHandler)])
  yield takeLatest(loginActions.request, login)
  yield takeLatest(logoutActions.request, logout)
  yield takeLatest(getUserInfoActions.request, getUserInfo)
  yield takeLatest(loginActions.success, getUserInfo)
  yield takeLatest(loginActions.success, saveToken)
  yield takeLatest(loginActions.failure, deleteToken)
  yield takeLatest(logoutActions.success, deleteToken)
  yield takeLatest(logoutActions.success, redirectToLogin)
  // yield takeLatest(reloginAction, relogin)
  // yield takeLatest(signUpAction, signUp)
  // yield takeLatest(forgottenPasswordAction, forgottenPassword)
  // yield takeLatest(resetPasswordAction, resetPassword)
  // yield takeLatest(activateAccountAction, activateAccount)
}
