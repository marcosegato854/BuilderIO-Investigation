/* eslint-disable jsx-a11y/anchor-is-valid */
import { CircularProgress } from '@mui/material'
import 'bootstrap'
import { CheckDevice } from 'components/atoms/CheckDevice/CheckDevice'
import { TextToSpeech } from 'components/atoms/TextToSpeech/TextToSpeech'
import { AdminStatus } from 'components/molecules/AdminStatus/AdminStatus'
import { InitializationManager } from 'components/molecules/InitializationManager/InitializationManager'
// import { OfflineOverlay } from 'components/molecules/OfflineOverlay/OfflineOverlay'
import { PortraitOverlay } from 'components/molecules/PortraitOverlay/PortraitOverlay'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { ErrorBoundary } from 'components/organisms/ErrorBoundary/ErrorBoundary'
import { ErrorManager } from 'components/organisms/ErrorManager/ErrorManager'
import { LoadingScreen } from 'components/organisms/LoadingScreen/LoadingScreen'
import { ConnectedRouter } from 'connected-react-router'
import useBackForward from 'hooks/useBackForward'
import useEnableAutoTts from 'hooks/useEnableAutoTts'
import useEnableNoSleep from 'hooks/useEnableNoSleep'
import useNotificationsSocket from 'hooks/useNotificationsSocket'
import { usePageVisibility } from 'hooks/usePageVisibility'
import { useFontByLanguage } from 'hooks/useFontByLanguage'
import { useLanguageBodyClass } from 'hooks/useLanguageBodyClass'
import useStartupActions from 'hooks/useStartupActions'
import useStateSocket from 'hooks/useStateSocket'
import useTheme from 'hooks/useTheme'
import useToken from 'hooks/useToken'
import { Acquisition } from 'pages/Acquisition/Acquisition'
import { JobBrowser } from 'pages/JobBrowser/JobBrowser'
import { LoginPage } from 'pages/LoginPage/LoginPage'
import { NotFound } from 'pages/NotFound/NotFound'
import { Planning } from 'pages/Planning/Planning'
import { ProjectBrowser } from 'pages/ProjectBrowser/ProjectBrowser'
import { QrCodeLogin } from 'pages/QrCodeLogin/QrCodeLogin'
import React, { ReactNode, Suspense } from 'react'
import { Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { Routes } from 'Routes'
import { store, StorePersistGate } from 'store'
import IsLoggedIn from 'store/guards/IsLoggedIn'
import LoginGuard from 'store/guards/LoginGuard'
import { useTrackProgress } from 'store/services/trackProgress'
import history from 'utils/history'
import MaterialUIThemeProvider from 'utils/themes/MaterialUIThemeProvider'
import { IS_TESTING } from 'utils/capabilities'

const PersistGate = IS_TESTING ? React.Fragment : StorePersistGate

const App = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Provider store={store}>
          <PersistGate>
            <ConnectedRouter history={history}>
              <MaterialUIThemeProvider>
                <GlobalSpinner>
                  <Switch>
                    <Route
                      exact
                      path={Routes.LOGIN}
                      component={LoginGuard(LoginPage)}
                    />
                    <Route
                      exact
                      path={Routes.PROJECTS}
                      component={IsLoggedIn(ProjectBrowser)}
                    />
                    <Route
                      // exact
                      path={Routes.JOBS}
                      component={IsLoggedIn(JobBrowser)}
                    />
                    <Route
                      // exact
                      path={Routes.ACQUISITION}
                      component={IsLoggedIn(Acquisition)}
                    />
                    <Route
                      // exact
                      path={Routes.QRCODELOGIN}
                      component={LoginGuard(QrCodeLogin)}
                    />
                    <Route
                      // exact
                      path={Routes.PLANNING}
                      component={IsLoggedIn(Planning)}
                    />
                    <Route component={NotFound} />
                  </Switch>
                </GlobalSpinner>
              </MaterialUIThemeProvider>
            </ConnectedRouter>
          </PersistGate>
        </Provider>
      </Suspense>
    </ErrorBoundary>
  )
}

// TODO: maybe move this in components?
const GlobalSpinner = ({ children }: { children: ReactNode }) => {
  const isInProgress = useTrackProgress()
  // const initializationHidden = useSelector(selectInitializationHidden)

  // TODO: create a new custom hook to localize moment globally at language change and startup
  // import "moment/locale/de" // one for each language supported
  // moment.locale('it')

  /**
   * this initializes theme support
   * it goes here in order to be embedded in a Provider
   */
  useTheme()
  useToken()
  useStartupActions()
  useBackForward()
  useNotificationsSocket()
  useStateSocket()
  usePageVisibility()
  useFontByLanguage()
  useLanguageBodyClass()
  /**
   * on iOs and certain tablets we need to
   * fire a first text to speech event
   */
  useEnableAutoTts()
  /**
   * on tablet we need to
   * block sleep mode on the first interaction
   */
  useEnableNoSleep()
  return isInProgress ? (
    <div
      style={{
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <CircularProgress />
    </div>
  ) : (
    <>
      <DialogManager />
      <ErrorManager />
      <TextToSpeech />
      {/* disabled PEF-1778 
      <OfflineOverlay /> */}
      <PortraitOverlay />
      <AdminStatus />
      <CheckDevice />
      <InitializationManager />
      {children}
    </>
  )
}

export default App
