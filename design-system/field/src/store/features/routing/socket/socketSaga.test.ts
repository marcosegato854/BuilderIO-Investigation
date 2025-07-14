/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import { Store } from 'redux'
import { store } from 'store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { actionsServiceDeactivateSystemAction } from 'store/features/actions/slice'
import { resetStoreAction } from 'store/features/global/slice'
import {
  autocaptureStatusActions,
  routingStatusActions,
  routingSubscribeAction,
  routingUnsubscribeAction,
} from 'store/features/routing/slice'
import { RoutingSocketNotification } from 'store/features/routing/types'
import { modulesActions } from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { getSocketUrl } from 'store/services/socketClientBackend'

describe('Routing Socket', () => {
  let ws: WS
  let mockDispatch: jest.SpyInstance<any, [action: any]>
  const notification: RoutingSocketNotification = {
    type: 'direction',
    data: mockStore.routingService.routingState!,
  }
  beforeEach(async () => {
    mockDispatch = jest.spyOn(store, 'dispatch')
    // mock API
    moxios.install(apiClient)
    // mock SOCKET
    ws = new WS(`${getSocketUrl()}/routing`)
    // ws = new WS(`${getMockSocketUrl()}`)
    store.dispatch(routingSubscribeAction())
    await ws.connected
    jest.useFakeTimers()
  })

  afterEach(() => {
    store.dispatch(routingUnsubscribeAction())
    store.dispatch(resetStoreAction())
    mockDispatch.mockClear()
    moxios.uninstall(apiClient)
    WS.clean()
    jest.useRealTimers()
  })

  test('routing status gets cleaned after deactivating the system', async () => {
    // test rapid messages
    await waitFor(
      () => {
        Array(5)
          .fill(-1)
          .forEach((_, index) => {
            ws.send(
              JSON.stringify({
                ...notification,
                data: {
                  ...notification.data,
                  instruction: `clean-instruction-${index}`,
                },
              })
            )
          })
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(store.getState().routingService.routingState!.instruction).toBe(
      'clean-instruction-4'
    )
    // deactivate the system
    await waitFor(
      () => {
        store.dispatch(actionsServiceDeactivateSystemAction())
        ws.send(
          JSON.stringify({
            ...notification,
            data: { ...notification.data, instruction: 'last' },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(store.getState().routingService.routingState).toBe(null)
    expect(
      store.getState().routingService.autocaptureNotifications.length
    ).toBe(0)
  })

  it('marks the connection as active when it successfully connects to the ws server', () => {
    expect(store.getState().routingService.routingSocketConnected).toBe(true)
  })

  it('marks the connection as inactive after a disconnect', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    ws.close()
    await ws.closed
    expect(store.getState().routingService.routingSocketConnected).toBe(false)
    jest.spyOn(console, 'error').mockRestore()
  })

  it('marks the connection as inactive after a connection error', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    ws.error()
    await ws.closed
    expect(store.getState().routingService.routingSocketConnected).toBe(false)
    jest.spyOn(console, 'error').mockRestore()
  })
})

describe('Routing Socket (no unsubscribe)', () => {
  let ws: WS
  const testingStore: Store = getTestingStore()
  const mockDispatch = jest.spyOn(testingStore, 'dispatch')

  beforeEach(async () => {
    // mock API
    moxios.install(apiClient)
    // mock SOCKET
    WS.clean()
    ws = new WS(`${getSocketUrl()}/routing`)
    // ws = new WS(`${getMockSocketUrl()}`)
    testingStore.dispatch(routingSubscribeAction())
    testingStore.dispatch(
      routingStatusActions.success({
        initial: false,
        final: false,
        enabled: true,
      })
    )
    testingStore.dispatch(
      autocaptureStatusActions.success({
        enabled: true,
      })
    )
    testingStore.dispatch(
      modulesActions.success({ modules: mockStore.system.modules })
    )
    await ws.connected
  })

  afterEach(() => {
    mockDispatch.mockClear()
    moxios.uninstall(apiClient)
    WS.clean()
  })

  // TODO: routing - maybe it should be kept alive for autocapture
  it("it doesn't reconnect if receives unsubscribe action", async () => {
    testingStore.dispatch(routingUnsubscribeAction())
    expect(mockDispatch).toHaveBeenLastCalledWith(routingUnsubscribeAction())
  })

  it("it doesn't reconnect if receives deactivate action", async () => {
    testingStore.dispatch(actionsServiceDeactivateSystemAction())
    expect(mockDispatch).toHaveBeenLastCalledWith(
      actionsServiceDeactivateSystemAction()
    )
  })

  it('reconnects after losing the ws connection', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    ws.error()
    await ws.closed
    expect(testingStore.getState().routingService.routingSocketConnected).toBe(
      false
    )

    WS.clean()
    ws = new WS(`${getSocketUrl()}/routing`)
    // ws = new WS(`${getMockSocketUrl()}`)
    await ws.connected // reconnected!

    expect(testingStore.getState().routingService.routingSocketConnected).toBe(
      true
    )
    jest.spyOn(console, 'error').mockRestore()
  })
})
