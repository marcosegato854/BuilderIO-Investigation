import { combineReducers } from 'redux'
import { createSelector } from 'reselect'
import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
} from 'typesafe-actions'
import { extractTokenFromHeader } from 'utils/strings'
import {
  LoginPayload,
  LoginResponse,
  User,
  Token,
  UserInfoResponse,
  UserInfo,
} from 'store/features/auth/types'
import { AnyObject } from 'yup/lib/object'

/**
 * ACTIONS
 */
export const loginActions = createAsyncAction(
  'authService/LOGIN_REQUEST',
  'authService/LOGIN_SUCCESS',
  'authService/LOGIN_FAILURE'
)<LoginPayload, LoginResponse, undefined>()
// export const reloginAction = createAction('authService/RELOGIN')()
export const logoutActions = createAsyncAction(
  'authService/LOGOUT_REQUEST',
  'authService/LOGOUT_SUCCESS',
  'authService/LOGOUT_FAILURE'
)<undefined, undefined, undefined>()
export const getUserInfoActions = createAsyncAction(
  'authService/GET_USER_INFO_REQUEST',
  'authService/GET_USER_INFO_SUCCESS',
  'authService/GET_USER_INFO_FAILURE'
)<undefined, UserInfoResponse, undefined>()
// export const reloginAction = createAction('authService/RELOGIN')()
export const setTokenAction = createAction('authService/SET_TOKEN')<
  string | null
>()
// export const forgottenPasswordAction = createAction(
//   'auth/FORGOTTEN_PASSWORD'
// )<ForgottenPasswordPayload>()
// export const resetPasswordAction = createAction(
//   'auth/RESET_PASSWORD'
// )<ResetPasswordPayload>()
// export const activateAccountAction = createAction(
//   'auth/ACTIVATE_ACCOUNT'
// )<ActivateAccountPayload>()

const actions = {
  loginActions,
  setTokenAction,
  logoutActions,
  getUserInfoActions,
  // forgottenPasswordAction,
  // resetPasswordAction,
  // activateAccountAction,
}
export type AuthAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type AuthServiceState = Readonly<{
  user: User | null
  userInfo: UserInfo | null
  token: Token | null
  isAuthenticating: boolean
  error: string | null
}>

const initialState: AuthServiceState = {
  isAuthenticating: false,
  user: null,
  userInfo: null,
  token: null,
  error: null,
}

const isAuthenticating = createReducer(initialState.isAuthenticating)
  .handleAction(
    [
      // reloginAction,
      loginActions.request,
    ],
    () => true
  )
  .handleAction([loginActions.success, loginActions.failure], () => false)

// const user = createReducer(initialState.user)
//   .handleAction(
//     loginActions.success,
//     (_: User | null, { payload }) => payload.user
//   )
//   .handleAction(loginActions.failure, () => null)

const userInfo = createReducer(initialState.userInfo)
  .handleAction(
    getUserInfoActions.success,
    (_: UserInfo | null, { payload }) => payload
  )
  .handleAction(
    [loginActions.failure, logoutActions.success],
    () => initialState.userInfo
  )

const token = createReducer(initialState.token)
  .handleAction(loginActions.success, (_: string | null, { payload }) =>
    extractTokenFromHeader(payload.authorization)
  )
  .handleAction(
    [loginActions.failure, logoutActions.success],
    () => initialState.token
  )
  .handleAction(setTokenAction, (_: string | null, { payload }) => payload)

export const authServiceReducer = combineReducers({
  isAuthenticating,
  userInfo,
  // user,
  token,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      authService: AuthServiceState
      [otherOptions: string]: unknown
    }
  | AnyObject
export const selectAuthServiceState = (
  state: OptimizedRootState
): AuthServiceState => state.authService

export const selectIsAuthenticating = (state: OptimizedRootState) =>
  selectAuthServiceState(state).isAuthenticating
// export const selectUser = (state: OptimizedRootState) =>
//   selectAuthServiceState(state).user
export const selectToken = (state: OptimizedRootState) =>
  selectAuthServiceState(state).token

export const selectIsLoggedIn = createSelector(
  selectToken,
  (tokenToCheck) => !!tokenToCheck
)

export const selectUserInfo = createSelector(
  selectAuthServiceState,
  (state) => state.userInfo
)

export const selectIsAdmin = createSelector(
  selectAuthServiceState,
  (state) => state.userInfo?.usertype === 'service'
)
