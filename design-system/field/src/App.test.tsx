/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
import {
  fireEvent,
  queries,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import App from 'App'
import { t } from 'i18n/config'
import moxios from 'moxios'
import React from 'react'
import { store } from 'store'
import { loginActions, selectIsLoggedIn } from 'store/features/auth/slice'
import {
  mkDataStorageConfig,
  mkDataStorageProjects,
} from 'store/features/dataStorage/mockApi'
import { mkGetSettings } from 'store/features/settings/mockApi'
import {
  mkModules,
  mkSystemNotifications,
  mkSystemReleaseTag,
  mkSystemState,
} from 'store/features/system/mockApi'
import {
  hideInitializationAction,
  selectClientReleaseTag,
  systemStateActions,
} from 'store/features/system/slice'
import { SystemNotification } from 'store/features/system/types'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { mockMediaQueries } from 'utils/test'

beforeAll(() => {
  jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn())
})

const stubRequests = () => {
  moxios.stubRequest('/system/responsiveness', {
    status: 200,
    response: mockStore.system.responsiveness,
  })
}

const mockSpeak = jest.fn()
class SpeechSynthesisUtterance {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
  constructor(text: string) {}

  // eslint-disable-next-line class-methods-use-this
  addEventListener() {}
}

class SpeechSynthesis {
  // eslint-disable-next-line class-methods-use-this
  cancel() {}

  public speak = mockSpeak
}

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: new SpeechSynthesis(),
})

/** avoid the test to generate browser detection alerts on Windows */
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.SpeechSynthesisUtterance = SpeechSynthesisUtterance as any

describe('App initialization (not logged in)', () => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let mockedSystemStateApi: jest.SpyInstance<any>
  let mockedUserSettingsApi: jest.SpyInstance<any>
  let mockedProjectsApi: jest.SpyInstance<any>
  let mockedModulesApi: jest.SpyInstance<any>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  let mockConsoleWarn: jest.SpyInstance<any>
  let mockecRelaseTagApi: jest.SpyInstance<any>

  beforeEach(async () => {
    mockMediaQueries()
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    // mock API
    moxios.install(apiClient)
    // moxios.install(mockApiClientDiskManagement)
    stubRequests()
    mockedSystemStateApi = mkSystemState({ state: 'Initializing' })
    mockedProjectsApi = mkDataStorageProjects()
    mockedUserSettingsApi = mkGetSettings()
    mockedModulesApi = mkModules()
    mockecRelaseTagApi = mkSystemReleaseTag('release')
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    // render
    component = render(<App />)
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(async () => {
    await waitFor(() => {}, { timeout: 2000 })
    jest.advanceTimersByTime(2000)
    mockDispatchRealStore.mockClear()
    mockedSystemStateApi.mockClear()
    mockedUserSettingsApi.mockClear()
    mockedProjectsApi.mockClear()
    mockedModulesApi.mockClear()
    mockecRelaseTagApi.mockClear()
    mockConsoleWarn.mockClear()
    moxios.uninstall(apiClient)
    // moxios.uninstall(mockApiClientDiskManagement)
    jest.useRealTimers()
  })

  /** removed because it's not possible to retrieve the state before login */
  // test('should not allow the user to login if the system is starting', async () => {
  //   await waitFor(
  //     () => {
  //       store.dispatch(
  //         systemStateActions.success({
  //           state: 'Starting',
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const state = await store.getState()
  //   const isLoggedIn = await selectIsLoggedIn(state)
  //   expect(isLoggedIn).not.toBeTruthy()
  //   expect(screen.queryByTestId('login-form')).not.toBeInTheDocument()
  // })

  test('should allow the user to login', async () => {
    await waitFor(
      () => {
        store.dispatch(systemStateActions.failure())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const isLoggedIn = await selectIsLoggedIn(state)
    expect(isLoggedIn).not.toBeTruthy()
    expect(component.getByTestId('login-form')).toBeTruthy()
    expect(
      screen.queryByText(t('initialization.title', 'wrong') as string)
    ).not.toBeInTheDocument()
  })

  test('should load system modules at start', async () => {
    expect(mockedModulesApi).toHaveBeenCalled()
  })

  test('should load releaseTag at start', async () => {
    expect(mockecRelaseTagApi).toHaveBeenCalled()
    const state = await store.getState()
    expect(selectClientReleaseTag(state)).toBe('release')
  })
})

describe('App initialization (logged in)', () => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let mockedUserSettingsApi: jest.SpyInstance<any>
  let mockedSystemStateApi: jest.SpyInstance<any>
  let mockedNotificationsApi: jest.SpyInstance<any>
  let mockecModulesApi: jest.SpyInstance<any>
  let mockecRelaseTagApi: jest.SpyInstance<any>
  let mockedDatastorageConfigApi: jest.SpyInstance<any>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>

  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => 'TOKEN',
        setItem: () => {},
      },
      writable: true,
    })
    mockMediaQueries()
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    // mock API
    moxios.install(apiClient)
    stubRequests()
    mockedSystemStateApi = mkSystemState({
      state: 'Initializing',
    })
    mockedUserSettingsApi = mkGetSettings()
    mockecModulesApi = mkModules()
    mockedNotificationsApi = mkSystemNotifications()
    mockecRelaseTagApi = mkSystemReleaseTag('release')
    mockedDatastorageConfigApi = mkDataStorageConfig()
    // render
    component = render(<App />)
    // enable fake timers
    jest.useFakeTimers()
    // fill the store
    await waitFor(
      () => {
        store.dispatch(
          loginActions.success({
            authorization: 'bearer D8FHLJGJC',
          })
        )
        store.dispatch(hideInitializationAction(false))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(async () => {
    mockDispatchRealStore.mockClear()
    mockedUserSettingsApi.mockClear()
    mockedSystemStateApi.mockClear()
    mockecModulesApi.mockClear()
    mockedNotificationsApi.mockClear()
    mockecRelaseTagApi.mockClear()
    mockedDatastorageConfigApi.mockClear()
    moxios.uninstall(apiClient)
    // moxios.uninstall(mockApiClientDiskManagement)
    jest.useRealTimers()
  })

  test('should poll system state until initialization is complete', async () => {
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    expect(mockedSystemStateApi).toHaveBeenCalled()
    mockedSystemStateApi.mockClear()
    mockedSystemStateApi = mkSystemState({
      state: 'Initializing',
    })
    await waitFor(() => {}, { timeout: 1000 })
    jest.advanceTimersByTime(1000)
    await waitFor(() => {}, { timeout: 1000 })
    jest.advanceTimersByTime(1000)
    const expectedPollings = 2
    expect(mockedSystemStateApi).toHaveBeenCalledTimes(expectedPollings)
    mockedSystemStateApi = mkSystemState({
      state: 'Deactivated',
    })
    await waitFor(() => {}, { timeout: 2000 })
    jest.advanceTimersByTime(2000)
    await waitFor(() => {}, { timeout: 2000 })
    jest.advanceTimersByTime(2000)
    expect(mockedSystemStateApi).toHaveBeenCalledTimes(expectedPollings + 2)
    const state = await store.getState()
    expect(state.system.systemState?.state).toBe('Deactivated')
  })

  test('should display the status of the initialization if not complete', async () => {
    expect(mockedSystemStateApi).toHaveBeenCalled()
    const state = await store.getState()
    expect(state.system.systemState?.state).toBe('Initializing')
    expect(
      component.getByText(t('initialization.title', 'wrong') as string)
    ).toBeTruthy()
    expect(
      component.getByText(
        t('initialization.stateInitializing', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('should not display the status of the initialization after closing the dialog', async () => {
    expect(mockedSystemStateApi).toHaveBeenCalled()
    const state = await store.getState()
    expect(state.system.systemState?.state).toBe('Initializing')
    expect(
      component.getByText(t('initialization.title', 'wrong') as string)
    ).toBeTruthy()
    const okButton = component.getByTestId('alert-ok-button')
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 2000 }
    )
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: 'Initializing',
          })
        )
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(
      screen.queryByText(t('initialization.title', 'wrong') as string)
    ).not.toBeInTheDocument()
  })

  test('should not display the status of the initialization if complete', async () => {
    const state = await store.getState()
    expect(state.system.systemState?.state).toBe('Initializing')
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: 'Deactivated',
          })
        )
      },
      { timeout: 2000 }
    )
    const stateAfter = await store.getState()
    expect(stateAfter.system.systemState?.state).toBe('Deactivated')
    expect(
      screen.queryByText(t('initialization.title', 'wrong') as string)
    ).not.toBeInTheDocument()
  })

  test('should load system modules at start', async () => {
    expect(mockecModulesApi).toHaveBeenCalled()
  })

  test('should load releaseTag at start', async () => {
    expect(mockecRelaseTagApi).toHaveBeenCalled()
    const state = await store.getState()
    expect(selectClientReleaseTag(state)).toBe('release')
  })

  test('should load system notifications at start', async () => {
    expect(mockedNotificationsApi).toHaveBeenCalled()
  })

  test('should load datastorage configuration at start', async () => {
    expect(mockedDatastorageConfigApi).toHaveBeenCalled()
  })

  test('should display errors occured during initialization', async () => {
    const state = await store.getState()
    expect(state.system.notifications.length).toBeGreaterThanOrEqual(
      mockStore.system.notifications.length
    )
    const firstNotification = state.system.notifications[0]
    expect(
      component.getByText(
        t(
          `backend_errors.${firstNotification.code}`,
          firstNotification.description
        ) as string
      )
    ).toBeTruthy()
  })

  test('should translate and fill parameters of errors occured during initialization', async () => {
    const notification = mockStore.system.notifications[0] as SystemNotification
    const finalDescription = t(
      `backend_errors.code.${notification.code}`,
      'Wrong'
    ).replace('{p1}', notification.p1!)
    expect(component.getByText(finalDescription)).toBeTruthy()
  })
})
