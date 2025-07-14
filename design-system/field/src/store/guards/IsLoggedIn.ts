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

const IsLoggedIn = <OwnProps>(
  Component: ComponentType<OwnProps & InjectedAuthReduxProps>
) =>
  connectedReduxRedirect<OwnProps, RootState>({
    authenticatedSelector: selectIsLoggedIn,
    authenticatingSelector: selectIsAuthenticating,
    redirectAction: replace,
    redirectPath: Routes.LOGIN,
    wrapperDisplayName: 'IsLoggedIn',
  })(Component)

export default IsLoggedIn
