import {
  LoginPayload,
  LoginResponse,
  UserInfoResponse,
} from 'store/features/auth/types'
import apiClient from 'store/services/apiClientBackend'
import { trackProgress } from 'store/services/trackProgress'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  INFO: 'INFO',
  // SIGN_UP: 'SIGN_UP',
  // FORGOTTEN_PASSWORD: 'FORGOTTEN_PASSWORD',
  // RESET_PASSWORD: 'RESET_PASSWORD',
}

/**
 * CALLS
 */
export default {
  login: (data: LoginPayload) =>
    trackProgress(
      apiClient.post<LoginResponse>('/user/login', data),
      apiCallIds.LOGIN
    ),
  logout: () => {
    return trackProgress(apiClient.post('/user/logout'), apiCallIds.LOGOUT)
  },
  getUserInfo: () => {
    return trackProgress(
      apiClient.get<UserInfoResponse>('/user'),
      apiCallIds.INFO
    )
  },

  // relogin: () => trackProgress(apiClient.get<AuthResponse>('/auth/relogin')),

  // signUp: (data: SignUpPayload) =>
  //   trackProgress(
  //     apiClient.post<AuthResponse>('/users', data),
  //     apiCallIds.SIGN_UP
  //   ),

  // forgottenPassword: (data: ForgottenPasswordPayload) =>
  //   trackProgress(
  //     apiClient.post('/auth/forgotten-password', data),
  //     apiCallIds.FORGOTTEN_PASSWORD
  //   ),

  // resetPassword: (data: ResetPasswordPayload) =>
  //   trackProgress(
  //     apiClient.post<AuthResponse>('/auth/reset-password', data),
  //     apiCallIds.RESET_PASSWORD
  //   ),

  // activateAccount: ({ userId, activationToken }: ActivateAccountPayload) =>
  //   trackProgress(
  //     apiClient.get<AuthResponse>(
  //       `/users/${userId}/activate/${activationToken}`
  //     )
  //   ),
}
