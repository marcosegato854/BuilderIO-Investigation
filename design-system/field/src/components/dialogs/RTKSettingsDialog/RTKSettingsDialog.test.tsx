/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { renderWithProvider } from 'utils/test'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'
import { screen, RenderResult, queries, waitFor } from '@testing-library/react'
import moxios from 'moxios'
import apiClient from 'store/services/apiClientBackend'
import { store } from 'store'
import {
  rtkServiceAuthenticateServerActions,
  rtkServiceInterfaceModesActions,
  rtkServiceSetCurrentServer,
  rtkServiceSubmitServerActions,
  rtkServiceTestServerActions,
} from 'store/features/rtk/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { RtkTestInfo } from 'store/features/rtk/types'
import RTKSettingsDialog from 'components/dialogs/RTKSettingsDialog/RTKSettingsDialog'
import { getGdopStatus } from 'store/features/rtk/utils'
import { digits } from 'utils/numbers'
import { t } from 'i18n/config'
import {
  mkRtkInterfaceModes,
  mkRtkMountpoints,
  mkRtkMServerTest,
  mkRtkMServerTestInfo,
  mkRtkServerAuthenticate,
  mkRtkServers,
  mkRtkServerSubmit,
} from 'store/features/rtk/mockApi'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

const testInfo: RtkTestInfo = {
  internetconnection: true,
  ntripconnection: false,
  state: '',
  precision2d: '283.4113822859626',
  precisionheight: '175.13229370117188',
  satellites: {},
  hdop: '9999.0',
  vdop: '9999.0',
  gdop: '9999.0',
  // gdop: '30.0',
  // gdop: '1.1'
  agecorrection: '4739',
  position: {
    latitude: '45.8923602427',
    longitude: '12.69599714368',
    height: '139.1076',
  },
}

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('RTKSettingsDialog (mockStore)', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(<RTKSettingsDialog />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should display the title with an icon', () => {
    expect(component.getByTestId('dialog-title')).toBeTruthy()
    expect(component.getByTestId('dialog-title-icon')).toBeTruthy()
  })

  test('Should display the servers list', () => {
    expect(component.getByTestId('rtk-servers-list')).toBeTruthy()
  })

  test('Should display the mountpoint form', () => {
    expect(component.getByTestId('rtk-mountpoint-form')).toBeTruthy()
  })

  test('Should display connection info', () => {
    expect(component.getByTestId('rtk-connection-info')).toBeTruthy()
  })

  test('Should display confirm button', () => {
    expect(component.getByTestId('rtk-confirm-button')).toBeTruthy()
  })

  test('Should display cancel button', () => {
    expect(component.getByTestId('cancel-button')).toBeTruthy()
  })

  test('Should display connection info', () => {
    expect(
      component.getByText(
        digits(Number(mockStore.rtkService.testInfo!.position!.latitude!), 8)
      )
    ).toBeTruthy()
  })
})

describe('RTKSettingsDialog (Store)', () => {
  let component: RenderResult<typeof queries>
  const mockDispatchRealStore = jest.spyOn(store, 'dispatch')
  let mockMInterfaceModesAPI: jest.SpyInstance<any>
  let mockMountpointsAPI: jest.SpyInstance<any>
  let mockServersAPI: jest.SpyInstance<any>

  beforeEach(async () => {
    /** mock API */
    mockMInterfaceModesAPI = mkRtkInterfaceModes({
      ntripsupportedinterfacemode: ['RTCM', 'RTCA'],
    })
    mockMountpointsAPI = mkRtkMountpoints({
      action: {
        status: 'done',
        progress: 100,
        description: '',
      },
      result: {
        mountpoints: [
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
    mockServersAPI = mkRtkServers()
    component = renderWithProvider(<RTKSettingsDialog />)(store)
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    store.dispatch(resetStoreAction())
  })

  afterEach(() => {
    mockMInterfaceModesAPI.mockClear()
    mockMountpointsAPI.mockClear()
    mockServersAPI.mockClear()
    mockDispatchRealStore.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(
      screen.getByText(t('rtk.dialog.title', 'Wrong') as string)
    ).toBeTruthy()
  })

  test('Should retrieve available interface modes', async () => {
    await waitFor(
      () => {
        store.dispatch(rtkServiceInterfaceModesActions.request())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    expect(state.rtkService.interfaceModes.length).toBe(2)
  })

  test('Should reset the store at every test', async () => {
    const state = await store.getState()
    expect(state.rtkService.interfaceModes.length).toBe(0)
  })

  test('Should get mountpoints after polling the load action', async () => {
    moxios.stubRequest('/position/ntrip/actionloadmountpoints', {
      status: 200,
      response: {
        action: {
          status: 'done',
          progress: 100,
          description: 'NTRIP mount points loaded',
        },
        result: {
          mountpoints: [
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
      },
    })
    await waitFor(
      () => {
        store.dispatch(
          rtkServiceAuthenticateServerActions.success({
            action: {
              description: 'logged in',
              progress: -1,
              status: 'accepted',
            },
          })
        )
        store.dispatch(
          rtkServiceSetCurrentServer({
            name: 'Server',
            password: 'pwd',
            port: '80',
            server: 'https://',
            user: 'Username',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    expect(state.rtkService.mountpoints.length).toBe(2)
    // check the presence of curentServer
    expect(state.rtkService.currentServer).toBeTruthy()
  })

  test('Should get server info after polling', async () => {
    const mk = mkRtkMServerTest({
      action: {
        status: 'done',
        progress: 100,
        description: 'NTRIP Tested',
      },
      result: testInfo,
    })
    const mkInfo = mkRtkMServerTestInfo({
      action: {
        status: 'done',
        progress: 100,
        description: 'NTRIP Tested',
      },
      result: testInfo,
    })
    await waitFor(
      () => {
        store.dispatch(
          rtkServiceTestServerActions.success({
            action: {
              description: 'server testing started',
              progress: -1,
              status: 'accepted',
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    mk.mockRestore()
    mkInfo.mockRestore()
    const state = await store.getState()
    expect(state.rtkService.testInfo).toBe(testInfo)
    // should display the gdop value as per documentation
    const gdopStatus = getGdopStatus(testInfo.gdop)
    expect(screen.getByTestId('test-info-gdop')).toHaveTextContent(gdopStatus)
  })

  test('Sets the current server after authenticating', async () => {
    const mk = mkRtkServerAuthenticate()
    await waitFor(
      () => {
        store.dispatch(
          rtkServiceAuthenticateServerActions.request({
            name: 'Server',
            password: 'pwd',
            port: '80',
            server: 'https://',
            user: 'Username',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    mk.mockRestore()
    const state = await store.getState()
    expect(state.rtkService.currentServer).toBeTruthy()
    // Should update server connected prop when authentication is successful
    expect(state.rtkService.currentServer?.connected).toBeTruthy()
  })

  test('Sets the current server mountpoint after submit', async () => {
    const mk = mkRtkServerSubmit()
    await waitFor(
      () => {
        store.dispatch(
          rtkServiceSubmitServerActions.request({
            name: 'Server',
            password: 'pwd',
            port: '80',
            server: 'https://',
            user: 'Username',
            interfacemode: 'RTCM',
            mountpoint: 'NRT2-RDN',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    mk.mockRestore()
    const state = await store.getState()
    expect(state.rtkService.currentServer?.interfacemode).toBe('RTCM')
    expect(state.rtkService.currentServer?.mountpoint).toBe('NRT2-RDN')
  })

  test('Should update server connected prop after succesful connection', async () => {
    const mk = mkRtkServerAuthenticate()
    await waitFor(
      () => {
        store.dispatch(
          rtkServiceAuthenticateServerActions.request({
            name: 'Server',
            password: 'pwd',
            port: '80',
            server: 'https://',
            user: 'Username',
            interfacemode: 'RTCM',
            mountpoint: 'NRT2-RDN',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    mk.mockRestore()
    const state = await store.getState()
    expect(state.rtkService.currentServer?.connected).toBeTruthy()
  })

  test('Should display empty connection info', () => {
    expect(component.getByTestId('test-info')).toBeTruthy()
  })
})
