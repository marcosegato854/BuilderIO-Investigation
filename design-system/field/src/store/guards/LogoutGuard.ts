import { ComponentType } from 'react'
import {
  connectedReduxRedirect,
  InjectedAuthReduxProps,
} from 'redux-auth-wrapper/history4/redirect'
import { replace } from 'connected-react-router'
import { RootState } from 'store/StoreTypes'
import {
  selectIsAuthenticating,
  selectIsLoggedIn,
} from 'store/features/auth/slice'
import { Routes } from 'Routes'

const LogoutGuard = <OwnProps>(
  Component: ComponentType<OwnProps & InjectedAuthReduxProps>
) =>
  connectedReduxRedirect<OwnProps, RootState>({
    allowRedirectBack: false,
    authenticatedSelector: selectIsLoggedIn,
    authenticatingSelector: selectIsAuthenticating,
    redirectAction: replace,
    redirectPath: Routes.LOGIN,
    wrapperDisplayName: 'LogoutGuard',
  })(Component)

export default LogoutGuard
