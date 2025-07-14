/* eslint-disable @typescript-eslint/indent */
import React, { ReactNode } from 'react'
import { connect } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import {
  // reloginAction,
  selectIsLoggedIn,
} from 'store/features/auth/slice'
// import { AUTH_ROUTER_PATHS } from 'features/auth/routes'

import { RootState } from 'store/StoreTypes'

import { LoadingScreen } from 'components/organisms/LoadingScreen/LoadingScreen'
// import history from 'utils/history'
import { persistor } from 'store/configureStore'

const mapStateToProps = (state: RootState) => ({
  isLoggedIn: selectIsLoggedIn(state),
})

const mapDispatchToProps = {
  // relogin: reloginAction,
}

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    children: ReactNode
  }

const StorePersistGate = ({
  children,
  isLoggedIn,
}: // relogin
Props) => (
  <PersistGate
    loading={<LoadingScreen />}
    // TODO: restore with guards
    // onBeforeLift={() => {
    //   if (
    //     isLoggedIn &&
    //     history.location.pathname !== AUTH_ROUTER_PATHS.logout
    //   ) {
    //     relogin()
    //   }
    // }}
    persistor={persistor}
  >
    {children}
  </PersistGate>
)

StorePersistGate.defaultProps = {
  isLoggedIn: false,
}

export default connect(mapStateToProps, mapDispatchToProps)(StorePersistGate)
