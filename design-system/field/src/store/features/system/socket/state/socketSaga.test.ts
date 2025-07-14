/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import { store } from 'store'
import { mkDisplayableCameras } from 'store/features/camera/mockApi'
import { resetStoreAction } from 'store/features/global/slice'
import {
  stateSubscribeAction,
  stateUnsubscribeAction,
} from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import mockApiClient from 'store/services/mockApiClientPlanning'
import { getSocketUrl } from 'store/services/socketClientBackend'

describe('State Socket', () => {
  let ws: WS
  let mockDispatch: jest.SpyInstance<any, [action: any]>
  let mockSupportedCamerasAPI: jest.SpyInstance<any>

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    mockDispatch = jest.spyOn(store, 'dispatch')
    mockSupportedCamerasAPI = mkDisplayableCameras()
    // mock API
    moxios.install(apiClient)
    moxios.install(mockApiClient)
    moxios.stubRequest('/camera/displayablecameranames', {
      status: 200,
      response: {
        groups: mockStore.cameraService.groups,
      },
    })
    moxios.stubRequest('/routing/currentpath', {
      status: 200,
      response: {
        polygons: [],
      },
    })
    // mock SOCKET
    ws = new WS(`${getSocketUrl()}/system/state`)
    store.dispatch(stateSubscribeAction())
    await ws.connected
    jest.useFakeTimers()
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(stateUnsubscribeAction())
        store.dispatch(resetStoreAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    mockDispatch.mockClear()
    mockSupportedCamerasAPI.mockClear()
    moxios.uninstall(apiClient)
    moxios.uninstall(mockApiClient)
    jest.useRealTimers()
    WS.clean()
    jest.spyOn(console, 'error').mockRestore()
  })

  test('socket message gets saved in the store', async () => {
    const newState = { state: 'Activated' }
    ws.send(JSON.stringify(newState))
    expect(store.getState().system.systemState).toEqual(newState)
  })

  // it('marks the connection as active when it successfully connects to the ws server', () => {
  //   expect(store.getState().system.stateSocketConnected).toBe(true)
  // })

  // it('marks the connection as inactive after a disconnect', async () => {
  //   ws.close()
  //   await ws.closed
  //   expect(store.getState().system.stateSocketConnected).toBe(false)
  // })

  // it('marks the connection as inactive after a connection error', async () => {
  //   ws.error()
  //   await ws.closed
  //   expect(store.getState().system.stateSocketConnected).toBe(false)
  // })
})

describe('State Socket (no unsubscribe)', () => {
  let ws: WS
  const mockDispatch = jest.spyOn(store, 'dispatch')

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    // mock API
    moxios.install(apiClient)
    // mock SOCKET
    WS.clean()
    ws = new WS(`${getSocketUrl()}/system/state`)
    store.dispatch(stateSubscribeAction())
    await ws.connected
  })

  afterEach(() => {
    mockDispatch.mockClear()
    moxios.uninstall(apiClient)
    WS.clean()
    jest.spyOn(console, 'error').mockRestore()
  })

  it("it doesn't reconnect if receives unsubscribe action", async () => {
    store.dispatch(stateUnsubscribeAction())
    expect(mockDispatch).toHaveBeenLastCalledWith(stateUnsubscribeAction())
  })

  it('reconnects after losing the ws connection', async () => {
    ws.error()
    await ws.closed
    expect(store.getState().system.stateSocketConnected).toBe(false)

    WS.clean()
    ws = new WS(`${getSocketUrl()}/system/state`)
    await ws.connected // reconnected!

    expect(store.getState().system.stateSocketConnected).toBe(true)
  })
})
