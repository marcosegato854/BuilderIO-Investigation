/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import RTKSettingsDialog from 'components/dialogs/RTKSettingsDialog/RTKSettingsDialog'
import { t } from 'i18n/config'
import { DeepPartial, mergeDeepLeft } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import { resetStoreAction } from 'store/features/global/slice'
import api from 'store/features/rtk/api'
import {
  mkRtkInterfaceModes,
  mkRtkServerAuthenticate,
  mkRtkServers,
} from 'store/features/rtk/mockApi'
import {
  OptimizedRootState,
  rtkServiceCloseDialog,
} from 'store/features/rtk/slice'
import { RtkServerError } from 'store/features/rtk/types'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

beforeAll(() => {
  jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn())
})

describe('RTKSettingsDialog (mockStore server error in job browser)', () => {
  const positionError: RtkServerError = {
    code: 'POS-001',
    description: 'Wrong server or internet connection problem',
  }
  const overrides: DeepPartial<OptimizedRootState> = {
    rtkService: {
      serverError: positionError,
    },
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(
    mergeDeepLeft(overrides, mockStore)
  )
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <RTKSettingsDialog initialValues={mockStore.rtkService.currentServer!} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('the spinner dialog should display any error occured during logging and mountpoints retrival', async () => {
    expect(component.getByTestId('rtk-connection-error')).toBeTruthy()
  })

  test('failure should present a retry and a cancel button', async () => {
    expect(component.getByTestId('rtk-retry-button')).toBeTruthy()
    expect(component.getByTestId('rtk-cancel-button')).toBeTruthy()
  })

  test('failure should not present a skip button', async () => {
    expect(screen.queryByTestId('rtk-skip-button')).not.toBeInTheDocument()
  })
})

describe('RTKSettingsDialog (mockStore server error in acquisition)', () => {
  const positionError: RtkServerError = {
    code: 'POS-001',
    description: 'Wrong server or internet connection problem',
  }
  const overrides: DeepPartial<OptimizedRootState> = {
    rtkService: {
      serverError: positionError,
    },
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(
    mergeDeepLeft(overrides, mockStore)
  )
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <RTKSettingsDialog
        initialValues={mockStore.rtkService.currentServer!}
        canAbortActivation={true}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('failure should present a skip button', async () => {
    expect(component.getByTestId('rtk-skip-button')).toBeTruthy()
  })

  test('skip button should save the job with RTK off', async () => {
    const skipButton = component.getByTestId('rtk-skip-button')
    fireEvent.click(skipButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      rtkServiceCloseDialog({ canAbortActivation: true, skipRTK: true })
    )
  })
})

describe('RTKSettingsDialog (store server error when connecting)', () => {
  const currentServer = mockStore.rtkService.servers![0]
  let component: RenderResult<typeof queries>
  let mockMAuthenticateAPI: jest.SpyInstance<any>
  let mockMountpointsAPI: jest.SpyInstance<any>
  let mockInterfaceModesAPI: jest.SpyInstance<any>
  let mockServersAPI: jest.SpyInstance<any>
  beforeEach(async () => {
    /** mock API */
    mockMountpointsAPI = jest
      .spyOn(api, 'rtkLoadMountpoints')
      .mockRejectedValue({
        code: 'POS-005',
        description:
          'There is already another NTRIP loading action in execution',
      })
    mockMAuthenticateAPI = mkRtkServerAuthenticate()
    mockInterfaceModesAPI = mkRtkInterfaceModes()
    mockServersAPI = mkRtkServers()
    component = renderWithProvider(
      <RTKSettingsDialog initialValues={currentServer} />
    )(store)
    jest.useFakeTimers()
    const confirmButton = component.getByTestId('rtk-connect-button')
    await waitFor(
      () => {
        fireEvent.click(confirmButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    mockMountpointsAPI.mockClear()
    mockMAuthenticateAPI.mockClear()
    mockInterfaceModesAPI.mockClear()
    mockServersAPI.mockClear()
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('should fill the store when receiving a server error', async () => {
    const stateAfter = await store.getState()
    expect(stateAfter.rtkService.serverError).toStrictEqual({
      code: 'POS-005',
      description: 'There is already another NTRIP loading action in execution',
    })
  })

  test('should open the loading overlay when receiving a server error', async () => {
    expect(component.getByTestId('rtk-connection-error')).toBeTruthy()
  })

  test('should show the translated error when receiving a server error', async () => {
    const dialogData: string = t(
      'backend_errors.code.POS-005',
      'There is already another NTRIP loading action in execution'
    )
    const alert = screen.getByText(dialogData)
    expect(alert).toBeTruthy()
  })
})

describe('RTKSettingsDialog (handling store server error not translated)', () => {
  const currentServer = mockStore.rtkService.servers![0]
  let component: RenderResult<typeof queries>
  let mockMAuthenticateAPI: jest.SpyInstance<any>
  let mockMountpointsAPI: jest.SpyInstance<any>
  let mockInterfaceModesAPI: jest.SpyInstance<any>
  let mockServersAPI: jest.SpyInstance<any>
  beforeEach(async () => {
    /** mock API */
    mockMountpointsAPI = jest
      .spyOn(api, 'rtkLoadMountpoints')
      .mockRejectedValue({
        code: 'PIN-001',
        description: 'Fancy error only for test',
      })
    mockMAuthenticateAPI = mkRtkServerAuthenticate()
    mockInterfaceModesAPI = mkRtkInterfaceModes()
    mockServersAPI = mkRtkServers()
    component = renderWithProvider(
      <RTKSettingsDialog initialValues={currentServer} />
    )(store)
    jest.useFakeTimers()
    const confirmButton = component.getByTestId('rtk-connect-button')
    await waitFor(
      () => {
        fireEvent.click(confirmButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    mockMountpointsAPI.mockClear()
    mockMAuthenticateAPI.mockClear()
    mockInterfaceModesAPI.mockClear()
    mockServersAPI.mockClear()
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('should show the descprition error included in the response', async () => {
    const dialogData: string = 'Fancy error only for test'
    const alert = screen.getByText(dialogData)
    expect(alert).toBeTruthy()
  })
})

describe('RTKSettingsDialog (handling store server error not translated and without description)', () => {
  const currentServer = mockStore.rtkService.servers![0]
  let component: RenderResult<typeof queries>
  let mockMountpointsAPI: jest.SpyInstance<any>
  beforeEach(async () => {
    /** mock API */
    mockMountpointsAPI = jest
      .spyOn(api, 'rtkLoadMountpoints')
      .mockRejectedValue({
        response: {
          status: 500,
          statusText: 'error',
          data: {
            error: {
              code: 'PIN-001',
            },
          },
        },
      })
    component = renderWithProvider(
      <RTKSettingsDialog initialValues={currentServer} />
    )(store)
    jest.useFakeTimers()
    const confirmButton = component.getByTestId('rtk-connect-button')
    await waitFor(
      () => {
        fireEvent.click(confirmButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    mockMountpointsAPI.mockClear()
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('should show the fallback default error label', async () => {
    const dialogData: string = t(
      'rtk.dialog.error.deafult',
      'Failed to connect'
    )
    const alert = screen.getByText(dialogData)
    expect(alert).toBeTruthy()
  })
})
