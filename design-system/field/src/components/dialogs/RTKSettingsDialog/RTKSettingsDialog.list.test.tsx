import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import RTKSettingsDialog from 'components/dialogs/RTKSettingsDialog/RTKSettingsDialog'
import moxios from 'moxios'
import { DeepPartial, last, mergeDeepLeft, pick } from 'ramda'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import { resetStoreAction } from 'store/features/global/slice'
import {
  OptimizedRootState,
  rtkServiceAuthenticateServerActions,
  rtkServiceCloseDialog,
  rtkServiceServersActions,
} from 'store/features/rtk/slice'
import { RtkServer } from 'store/features/rtk/types'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { getType } from 'typesafe-actions'
import { renderWithProvider } from 'utils/test'

describe('RTKSettingsDialog List (mockStore - with current server in the list)', () => {
  const overrides: DeepPartial<OptimizedRootState> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(
    mergeDeepLeft(overrides, mockStore)
  )
  const mockDispatch = jest.fn()
  const currentServer = mockStore.rtkService.servers![0]
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <RTKSettingsDialog initialValues={currentServer} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('should NOT be locked from the spinner if not authenticating', async () => {
    expect(
      screen.queryByTestId('rtk-connection-loader')
    ).not.toBeInTheDocument()
  })

  test('submit button should send the currently selected server', async () => {
    const confirmButton = component.getByTestId('rtk-confirm-button')
    fireEvent.click(confirmButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(rtkServiceCloseDialog),
        payload: expect.objectContaining({
          job: expect.objectContaining({
            ntrip: expect.objectContaining({
              name: currentServer.name,
            }),
          }),
        }),
      })
    )
  })
})

describe('RTKSettingsDialog List (mockStore - with current server not in the list)', () => {
  const overrides: DeepPartial<OptimizedRootState> = {}
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

  test('should NOT be locked from the spinner if not authenticating', async () => {
    expect(
      screen.queryByTestId('rtk-connection-loader')
    ).not.toBeInTheDocument()
  })

  test('submit button should send the currently selected server', async () => {
    const confirmButton = component.getByTestId('rtk-confirm-button')
    fireEvent.click(confirmButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(rtkServiceCloseDialog),
        payload: expect.objectContaining({
          job: expect.objectContaining({
            ntrip: expect.objectContaining({
              name: mockStore.rtkService.currentServer!.name,
            }),
          }),
        }),
      })
    )
  })
})

describe('RTKSettingsDialog List (mockStore - with current server not in the list - authenticating)', () => {
  const overrides: DeepPartial<OptimizedRootState> = {
    rtkService: {
      isAuthenticating: true,
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

  test('during connection all the dialog should be locked from the spinner', async () => {
    expect(component.getByTestId('rtk-connection-loader')).toBeTruthy()
  })
})

describe('RTKSettingsDialog List (store - with current server in the list)', () => {
  let component: RenderResult<typeof queries>
  const mockDispatchRealStore = jest.spyOn(store, 'dispatch')
  const currentServer: RtkServer = pick(
    ['name', 'server', 'user', 'password'],
    mockStore.rtkService.servers![0]
  )
  beforeEach(async () => {
    /** mock API */
    moxios.install(apiClient)
    moxios.stubRequest('/position/ntrip/supportedinterfacemodes', {
      status: 200,
      response: {
        ntripsupportedinterfacemode: ['RTCM', 'RTCA', 'MODE3'],
      },
    })
    moxios.stubRequest('/position/ntrip/mountpoints', {
      status: 200,
      response: {
        ntripmountpoints: [
          {
            name: 'NRT2-RDN',
            interfacemode: 'RTCM',
          },
          {
            name: 'NRT3-RDN',
            interfacemode: 'RTCA',
          },
        ],
      },
    })
    component = renderWithProvider(
      <RTKSettingsDialog initialValues={currentServer} />
    )(store)
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        // rtk servers
        store.dispatch(
          rtkServiceServersActions.success({
            servers: mockStore.rtkService.servers!,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    jest.useRealTimers()
    moxios.uninstall(apiClient)
    store.dispatch(resetStoreAction())
    mockDispatchRealStore.mockClear()
  })

  test('should open the current server at mount', async () => {
    expect(component.getByDisplayValue(currentServer.user!)).toBeTruthy()
  })

  test('should display only the server list if the current server was saved', async () => {
    const items = component.getAllByTestId('server-item')
    expect(items.length).toBe(mockStore.rtkService.servers!.length)
  })

  test('should open the current server as new at mount if not in the list', async () => {
    const newUser = `${currentServer.user}MOD`
    const newName = `${currentServer.name}MOD`
    component.unmount()
    component = renderWithProvider(
      <RTKSettingsDialog
        initialValues={{
          ...currentServer,
          name: newName,
          user: newUser,
        }}
      />
    )(store)
    const items = component.getAllByTestId('server-item')
    const lastItem = last(items) as HTMLElement
    expect(within(lastItem).getByText(newName)).toBeTruthy()
    expect(component.getByDisplayValue(newUser)).toBeTruthy()
  })

  test('should edit a server in the list when clicking the edit button', async () => {
    const newUser = `${currentServer.user}MOD`
    const newName = `${currentServer.name}MOD`
    component.unmount()
    component = renderWithProvider(
      <RTKSettingsDialog
        initialValues={{
          ...currentServer,
          name: newName,
          user: newUser,
        }}
      />
    )(store)
    const items = component.getAllByTestId('server-item')
    const firstItem = items[0] as HTMLElement
    const editButton = within(firstItem).getByTestId('icon-edit')
    await waitFor(
      () => {
        fireEvent.click(editButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByDisplayValue(currentServer.user!)).toBeTruthy()
  })

  test('submit button should send the currently selected server with edits', async () => {
    const usernameInput = component.getByDisplayValue(currentServer.user!)
    const newValue = `${currentServer.user}MOD`
    await waitFor(
      () => {
        fireEvent.change(usernameInput, { target: { value: newValue } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const confirmButton = component.getByTestId('rtk-confirm-button')
    await waitFor(
      () => {
        fireEvent.click(confirmButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(rtkServiceCloseDialog),
        payload: expect.objectContaining({
          job: expect.objectContaining({
            ntrip: expect.objectContaining({
              user: newValue,
            }),
          }),
        }),
      })
    )
  })

  test('connect button should send the currently selected server with edits', async () => {
    const usernameInput = component.getByDisplayValue(currentServer.user!)
    const newValue = `${currentServer.user}MOD`
    await waitFor(
      () => {
        fireEvent.change(usernameInput, { target: { value: newValue } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const confirmButton = component.getByTestId('rtk-connect-button')
    await waitFor(
      () => {
        fireEvent.click(confirmButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(rtkServiceAuthenticateServerActions.request),
        payload: expect.objectContaining({
          user: newValue,
        }),
      })
    )
  })
})

describe('RTKSettingsDialog List (store - with current server not in the list)', () => {
  let component: RenderResult<typeof queries>
  const mockDispatchRealStore = jest.spyOn(store, 'dispatch')
  const currentServer: RtkServer = pick(
    ['name', 'server', 'user', 'password'],
    mockStore.rtkService.currentServer!
  )
  beforeEach(async () => {
    /** mock API */
    moxios.install(apiClient)
    moxios.stubRequest('/position/ntrip/supportedinterfacemodes', {
      status: 200,
      response: {
        ntripsupportedinterfacemode: ['RTCM', 'RTCA', 'MODE3'],
      },
    })
    moxios.stubRequest('/position/ntrip/mountpoints', {
      status: 200,
      response: {
        ntripmountpoints: [
          {
            name: 'NRT2-RDN',
            interfacemode: 'RTCM',
          },
          {
            name: 'NRT3-RDN',
            interfacemode: 'RTCA',
          },
        ],
      },
    })
    component = renderWithProvider(
      <RTKSettingsDialog initialValues={currentServer} />
    )(store)
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        // rtk servers
        store.dispatch(
          rtkServiceServersActions.success({
            servers: mockStore.rtkService.servers!,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    jest.useRealTimers()
    moxios.uninstall(apiClient)
    store.dispatch(resetStoreAction())
    mockDispatchRealStore.mockClear()
  })

  test('should open the current server at mount', async () => {
    expect(component.getByDisplayValue(currentServer.user!)).toBeTruthy()
  })

  test('should display the server list plus the current server', async () => {
    const items = component.getAllByTestId('server-item')
    expect(items.length).toBe(mockStore.rtkService.servers!.length + 1)
  })

  test('submit button should send the currently selected server with edits', async () => {
    const usernameInput = component.getByDisplayValue(currentServer.user!)
    const newValue = `${currentServer.user}MOD`
    await waitFor(
      () => {
        fireEvent.change(usernameInput, { target: { value: newValue } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const confirmButton = component.getByTestId('rtk-confirm-button')
    await waitFor(
      () => {
        fireEvent.click(confirmButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(rtkServiceCloseDialog),
        payload: expect.objectContaining({
          job: expect.objectContaining({
            ntrip: expect.objectContaining({
              user: newValue,
            }),
          }),
        }),
      })
    )
  })

  test('connect button should send the currently selected server with edits', async () => {
    const usernameInput = component.getByDisplayValue(currentServer.user!)
    const newValue = `${currentServer.user}MOD`
    await waitFor(
      () => {
        fireEvent.change(usernameInput, { target: { value: newValue } })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const confirmButton = component.getByTestId('rtk-connect-button')
    await waitFor(
      () => {
        fireEvent.click(confirmButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(rtkServiceAuthenticateServerActions.request),
        payload: expect.objectContaining({
          user: newValue,
        }),
      })
    )
  })
})

describe('RTKSettingsDialog List (store - with no current server)', () => {
  let component: RenderResult<typeof queries>
  const mockDispatchRealStore = jest.spyOn(store, 'dispatch')
  beforeEach(async () => {
    /** mock API */
    moxios.install(apiClient)
    moxios.stubRequest('/position/ntrip/supportedinterfacemodes', {
      status: 200,
      response: {
        ntripsupportedinterfacemode: ['RTCM', 'RTCA', 'MODE3'],
      },
    })
    moxios.stubRequest('/position/ntrip/mountpoints', {
      status: 200,
      response: {
        ntripmountpoints: [
          {
            name: 'NRT2-RDN',
            interfacemode: 'RTCM',
          },
          {
            name: 'NRT3-RDN',
            interfacemode: 'RTCA',
          },
        ],
      },
    })
    component = renderWithProvider(<RTKSettingsDialog />)(store)
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        // rtk servers
        store.dispatch(
          rtkServiceServersActions.success({
            servers: mockStore.rtkService.servers!,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    moxios.uninstall(apiClient)
    store.dispatch(resetStoreAction())
    mockDispatchRealStore.mockClear()
    jest.useRealTimers()
  })

  test('should not add a temp server if the current server is empty', async () => {
    component.unmount()
    component = renderWithProvider(
      <RTKSettingsDialog initialValues={{ enable: true }} />
    )(store)
    const items = component.getAllByTestId('server-item')
    expect(items.length).toBe(mockStore.rtkService.servers!.length)
  })

  test('should add a temp server after clicking the new server button', async () => {
    const newServerButton = component.getByTestId('new-server-button')
    await waitFor(
      async () => {
        await fireEvent.click(newServerButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const items = component.getAllByTestId('server-item')
    expect(items.length).toBe(mockStore.rtkService.servers!.length + 1)
    // check if the form is opened
    expect(screen.getByTestId('rtk-connect-button')).toBeTruthy()
  })

  test('the connect button icon of a server should not open the accordion', async () => {
    const [connectButton] = component.getAllByTestId('icon-connect')
    await waitFor(
      async () => {
        await fireEvent.click(connectButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByDisplayValue(mockStore.rtkService.servers![0].name!)
    ).not.toBeInTheDocument()
  })

  test('the edit button of a server should open the accordion', async () => {
    const button = component.getAllByTestId('icon-edit')
    expect(button).toHaveLength(mockStore.rtkService.servers!.length)
    await waitFor(
      () => {
        fireEvent.click(button[0])
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByDisplayValue(mockStore.rtkService.servers![0].name!)
    ).toBeInTheDocument()
  })

  test('should send the just connected server to the job at confirm', async () => {
    // connect
    const [connectButton] = component.getAllByTestId('icon-connect')
    await waitFor(
      async () => {
        await fireEvent.click(connectButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // confirm
    const confirmButton = component.getByTestId('rtk-confirm-button')
    fireEvent.click(confirmButton)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(rtkServiceCloseDialog),
        payload: expect.objectContaining({
          job: expect.objectContaining({
            ntrip: expect.objectContaining({
              name: mockStore.rtkService.servers![0].name,
            }),
          }),
        }),
      })
    )
  })

  test('confirm button should be disabled if there is no server selected', async () => {
    // confirm
    const confirmButton = component.getByTestId('rtk-confirm-button')
    fireEvent.click(confirmButton)
    expect(mockDispatchRealStore).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: getType(rtkServiceCloseDialog),
      })
    )
  })
})
