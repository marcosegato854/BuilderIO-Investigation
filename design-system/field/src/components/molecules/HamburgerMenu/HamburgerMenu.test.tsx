/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  getByTestId,
  queries,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { HamburgerMenu } from 'components/molecules/HamburgerMenu/HamburgerMenu'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import { mkLogout } from 'store/features/auth/mockApi'
import { dataStorageProcessingStatusActions } from 'store/features/dataStorage/slice'
import { DataStorageProcessingInfo } from 'store/features/dataStorage/types'
import { closeAllDialogsAction } from 'store/features/dialogs/slice'
import { mkReboot, mkShutDown } from 'store/features/system/mockApi'
import { systemResponsivenessActions } from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { formatSwVersion } from 'utils/strings'
import { renderWithProvider } from 'utils/test'

beforeAll(() => {
  jest.spyOn(global, 'XMLHttpRequest').mockImplementation(
    () =>
      ({
        open: jest.fn(),
        send: jest.fn(),
        setRequestHeader: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        abort: jest.fn(),
        getResponseHeader: jest.fn(),
        getAllResponseHeaders: jest.fn(),
        overrideMimeType: jest.fn(),
        readyState: 4,
        status: 200,
        responseText: '{}',
        response: {},
        onreadystatechange: jest.fn(),
        responseType: '',
        responseURL: '',
        responseXML: null,
      } as unknown as XMLHttpRequest)
  )
})

describe('HamburgerMenu (mockStore admin)', () => {
  let component: RenderResult<typeof queries>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergedStore = mergeDeepRight(mockStore, {
    authService: {
      userInfo: {
        usertype: 'service',
      },
    },
    system: {
      updateInfo: {
        version: '2025.1.1.1',
      },
    },
  }) as any
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  beforeEach(async () => {
    component = renderWithProvider(<HamburgerMenu />)(mockedStore)
    const openButton = component.getByTestId('open-button')
    jest.useFakeTimers()
    await waitFor(
      () => {
        fireEvent.click(openButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    jest.useRealTimers()
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('it should open the popover when clicked', () => {
    // already clicked in the beforeEach()
    expect(component.getByTestId('popoverMenu')).toBeTruthy()
  })

  test('it should display an alert when there is an update available', () => {
    expect(
      component.getByText(
        formatSwVersion(
          mergedStore.system.releaseTag,
          mergedStore.system.info.softwareBuildType,
          mergedStore.system.info.windowsBuild,
          mergedStore.system.info.softwareversion,
          mergedStore.system.info.installerVersion
        )
      )
    ).toBeTruthy()
  })

  test('it should display extended version information', () => {
    expect(component.getByTestId('firmwareUpdate')).toBeTruthy()
  })
})

describe('HamburgerMenu (store)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(async () => {
    component = renderWithProvider(
      <div>
        <DialogManager />
        <HamburgerMenu />
      </div>
    )(store)
    const openButton = component.getByTestId('open-button')
    jest.useFakeTimers()
    await waitFor(
      () => {
        fireEvent.click(openButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(closeAllDialogsAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    jest.useRealTimers()
  })

  test('it should logout API when the user clicks logout', async () => {
    const mockLogoutAPI = mkLogout()
    const logout = component.getByTestId('logout')
    expect(logout).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(logout)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockLogoutAPI).toHaveBeenCalled()
    mockLogoutAPI.mockClear()
  })

  test('it should open a dialog when the user clicks shutdown', async () => {
    const shutdown = component.getByTestId('shutdown')
    expect(shutdown).toBeTruthy()
    await waitFor(() => fireEvent.click(shutdown), { timeout: 500 })
    jest.advanceTimersByTime(500)

    const alert = component.getByTestId('alert-dialog')
    expect(alert).toBeTruthy()
    const dialogTitle = within(alert).getByText(
      t('header.menu.processingShutdown.title', 'wrong') as string
    )
    expect(dialogTitle).toBeTruthy()
  })
  test('it should open a dialog when the user clicks shutdown and a processing is ongoing', async () => {
    const processing: DataStorageProcessingInfo = {
      currentProcess: mockStore.dataStorageService.processing,
    }
    await waitFor(
      () => {
        store.dispatch(dataStorageProcessingStatusActions.success(processing))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)

    const shutdown = component.getByTestId('shutdown')
    expect(shutdown).toBeTruthy()
    await waitFor(() => fireEvent.click(shutdown), { timeout: 500 })
    jest.advanceTimersByTime(500)

    const alert = component.getByTestId('alert-dialog')
    expect(alert).toBeTruthy()
    const dialogText = within(alert).getByText(
      t('header.menu.processingShutdown.text', 'wrong') as string
    )
    expect(dialogText).toBeTruthy()
  })

  test('it should call the shutdown api when the user clicks shutdown', async () => {
    const mockApiShutdown = mkShutDown()

    const shutdown = component.getByTestId('shutdown')
    expect(shutdown).toBeTruthy()
    await waitFor(() => fireEvent.click(shutdown), { timeout: 500 })
    jest.advanceTimersByTime(500)

    const shutdownOk = component.getByTestId('alert-ok-button')
    expect(shutdownOk).toBeTruthy()
    await waitFor(() => fireEvent.click(shutdownOk), { timeout: 500 })
    jest.advanceTimersByTime(500)

    expect(mockApiShutdown).toHaveBeenCalled()
    mockApiShutdown.mockClear()
  })

  test('it should open a dialog when the user clicks reboot', async () => {
    const reboot = component.getByTestId('reboot')
    expect(reboot).toBeTruthy()
    await waitFor(() => fireEvent.click(reboot), { timeout: 500 })
    jest.advanceTimersByTime(500)

    const alert = component.getByTestId('alert-dialog')
    expect(alert).toBeTruthy()
    const dialogTitle = within(alert).getByText(
      t('header.menu.processingReboot.title', 'wrong') as string
    )
    expect(dialogTitle).toBeTruthy()
  })

  test('it should open a dialog when the user clicks reboot and a processing is ongoing', async () => {
    const processing: DataStorageProcessingInfo = {
      currentProcess: mockStore.dataStorageService.processing,
    }
    await waitFor(
      () => {
        store.dispatch(dataStorageProcessingStatusActions.success(processing))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)

    const reboot = component.getByTestId('reboot')
    expect(reboot).toBeTruthy()
    await waitFor(() => fireEvent.click(reboot), { timeout: 500 })
    jest.advanceTimersByTime(500)

    const alert = component.getByTestId('alert-dialog')
    expect(alert).toBeTruthy()
    const dialogText = within(alert).getByText(
      t('header.menu.processingReboot.text', 'wrong') as string
    )
    expect(dialogText).toBeTruthy()
  })

  test('it should call the reboot api when the user clicks reboot', async () => {
    const mockApiReboot = mkReboot()

    const reboot = component.getByTestId('reboot')
    expect(reboot).toBeTruthy()
    await waitFor(() => fireEvent.click(reboot), { timeout: 500 })
    jest.advanceTimersByTime(500)

    const rebootOk = component.getByTestId('alert-ok-button')
    expect(rebootOk).toBeTruthy()
    await waitFor(() => fireEvent.click(rebootOk), { timeout: 500 })
    jest.advanceTimersByTime(500)

    expect(mockApiReboot).toHaveBeenCalled()
    mockApiReboot.mockClear()
  })

  test('it should not display extended version information', () => {
    expect(screen.queryByTestId('firmwareUpdate')).not.toBeInTheDocument()
  })

  test('it should disable the reboot system button if no battery is over 20%', async () => {
    await waitFor(
      () => {
        store.dispatch(
          systemResponsivenessActions.success(
            mergeDeepRight(mockStore.system.responsiveness, {
              battery: {
                details: {
                  batteries: [
                    {
                      id: 1,
                      name: 'Battery 1',
                      health: 20,
                      critical: false,
                      description: 'Battery 1 description',
                      minutes: 5,
                      charging: false,
                      active: true,
                    },
                    {
                      id: 2,
                      name: 'Battery 2',
                      health: 10,
                      critical: true,
                      description: 'Battery 2 description',
                      minutes: 1,
                      charging: false,
                      active: true,
                    },
                  ],
                },
              },
            }) as any
          )
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const reboot = component.getByTestId('reboot-disabled')
    expect(reboot).toBeInTheDocument()
  })

  test('it should enable the reboot system button if the system is AC plugged', async () => {
    await waitFor(
      () => {
        store.dispatch(
          systemResponsivenessActions.success(
            mergeDeepRight(mockStore.system.responsiveness, {
              battery: {
                acplug: true,
                details: {
                  batteries: [
                    {
                      id: 1,
                      name: 'Battery 1',
                      health: 20,
                      critical: false,
                      description: 'Battery 1 description',
                      minutes: 5,
                      charging: false,
                      active: true,
                    },
                    {
                      id: 2,
                      name: 'Battery 2',
                      health: 10,
                      critical: true,
                      description: 'Battery 2 description',
                      minutes: 1,
                      charging: false,
                      active: true,
                    },
                  ],
                },
              },
            }) as any
          )
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const reboot = component.queryByTestId('reboot-disabled')
    expect(reboot).not.toBeInTheDocument()
  })

  test('it should enable the reboot system button if a battery with over 20% charge is plugged', async () => {
    await waitFor(
      () => {
        store.dispatch(
          systemResponsivenessActions.success(mockStore.system.responsiveness)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const reboot = component.queryByTestId('reboot-disabled')
    expect(reboot).not.toBeInTheDocument()
  })
})

describe('HamburgerMenu (mockStore update available online)', () => {
  let component: RenderResult<typeof queries>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergedStore = mergeDeepRight(mockStore, {
    system: {
      checkUpdate: {
        version: '2025.1.1.1',
        newUpdate: true,
        coveredByMaintenance: true,
        changelog: 'Changelog',
      },
    },
  }) as any
  const mockedStore = configureMockStore()(mergedStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  beforeEach(async () => {
    component = renderWithProvider(<HamburgerMenu />)(mockedStore)
    const openButton = component.getByTestId('open-button')
    jest.useFakeTimers()
    await waitFor(
      () => {
        fireEvent.click(openButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    jest.useRealTimers()
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('it should open the popover when clicked', () => {
    // already clicked in the beforeEach()
    expect(component.getByTestId('popoverMenu')).toBeTruthy()
  })

  test('it should display that an update is available', () => {
    expect(component.getByTestId('firmwareUpdate')).toBeTruthy()
  })
})
