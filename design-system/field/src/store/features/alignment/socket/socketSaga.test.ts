/* eslint-disable @typescript-eslint/no-explicit-any */
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import { Store } from 'redux'
import { store } from 'store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { actionsServiceDeactivateSystemAction } from 'store/features/actions/slice'
import {
  alignmentSubscribeAction,
  alignmentUnsubscribeAction,
} from 'store/features/alignment/slice'
import { resetStoreAction } from 'store/features/global/slice'
import apiClient from 'store/services/apiClientBackend'
import { getSocketUrl } from 'store/services/socketClientBackend'
import { mkAlignmentStatus } from 'store/features/alignment/mockApi'

describe('Alignment Socket', () => {
  let ws: WS
  let mockDispatch: jest.SpyInstance<any, [action: any]>
  beforeEach(async () => {
    mockDispatch = jest.spyOn(store, 'dispatch')
    // mock API
    moxios.install(apiClient)
    // mock SOCKET
    ws = new WS(`${getSocketUrl()}/position/alignment`)
    // ws = new WS(`${getMockSocketUrl()}`)
    store.dispatch(alignmentSubscribeAction())
    await ws.connected
    jest.useFakeTimers()
  })

  afterEach(() => {
    store.dispatch(alignmentUnsubscribeAction())
    store.dispatch(resetStoreAction())
    mockDispatch.mockClear()
    moxios.uninstall(apiClient)
    WS.clean()
    jest.useRealTimers()
  })

  it('marks the connection as active when it successfully connects to the ws server', () => {
    expect(store.getState().alignmentService.alignmentSocketConnected).toBe(
      true
    )
  })

  it('marks the connection as inactive after a disconnect', async () => {
    ws.close()
    await ws.closed
    expect(store.getState().alignmentService.alignmentSocketConnected).toBe(
      false
    )
  })

  it('marks the connection as inactive after a connection error', async () => {
    ws.error()
    await ws.closed
    expect(store.getState().alignmentService.alignmentSocketConnected).toBe(
      false
    )
  })
})

describe('Alignment Socket (no unsubscribe)', () => {
  let ws: WS
  const testingStore: Store = getTestingStore()
  const mockDispatch = jest.spyOn(testingStore, 'dispatch')

  beforeEach(async () => {
    // mock API
    moxios.install(apiClient)
    // mock SOCKET
    WS.clean()
    ws = new WS(`${getSocketUrl()}/position/alignment`)
    // ws = new WS(`${getMockSocketUrl()}`)
    testingStore.dispatch(alignmentSubscribeAction())
    await ws.connected
  })

  afterEach(() => {
    mockDispatch.mockClear()
    moxios.uninstall(apiClient)
    WS.clean()
  })

  it("it doesn't reconnect if receives unsubscribe action", async () => {
    testingStore.dispatch(alignmentUnsubscribeAction())
    expect(mockDispatch).toHaveBeenLastCalledWith(alignmentUnsubscribeAction())
  })

  it("it doesn't reconnect if receives deactivate action", async () => {
    testingStore.dispatch(actionsServiceDeactivateSystemAction())
    expect(mockDispatch).toHaveBeenLastCalledWith(
      actionsServiceDeactivateSystemAction()
    )
  })
})

describe('Alignment Socket (no subscribe)', () => {
  let ws: WS
  const testingStore: Store = getTestingStore()
  let mockedAlignmentApi: jest.SpyInstance<any>

  beforeEach(async () => {
    // mock API
    mockedAlignmentApi = mkAlignmentStatus()
    // mock SOCKET
    WS.clean()
    ws = new WS(`${getSocketUrl()}/position/alignment`)
  })

  afterEach(() => {
    mockedAlignmentApi.mockClear()
    WS.clean()
  })

  it('calls the alignment status API when successfully connected to the socket', async () => {
    const connected1 = await testingStore.getState().alignmentService
      .alignmentSocketConnected
    expect(connected1).toBe(false)
    expect(mockedAlignmentApi).toHaveBeenCalledTimes(0)
    testingStore.dispatch(alignmentSubscribeAction())
    await ws.connected
    const connected2 = await testingStore.getState().alignmentService
      .alignmentSocketConnected
    expect(connected2).toBe(true)
    expect(mockedAlignmentApi).toHaveBeenCalledTimes(1)
  })
})
