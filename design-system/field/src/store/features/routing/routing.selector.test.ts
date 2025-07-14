import { waitFor } from '@testing-library/react'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import { store } from 'store'
import {
  routingSubscribeAction,
  autocapturePolygonsActions,
  selectCoveredPolygons,
  selectUncoveredPolygons,
} from 'store/features/routing/slice'
import { mockAutcapturePolygons } from 'store/mock/mockAutocapturePolygons'
import apiClient from 'store/services/apiClientBackend'
import { getSocketUrl } from 'store/services/socketClientBackend'

describe('Routing Selector', () => {
  let ws: WS
  const mockDispatch = jest.spyOn(store, 'dispatch')

  beforeEach(async () => {
    // mock API
    moxios.install(apiClient)
    // mock SOCKET
    WS.clean()
    ws = new WS(`${getSocketUrl()}/routing`)
    // ws = new WS(`${getMockSocketUrl()}`)
    store.dispatch(routingSubscribeAction())
    await ws.connected
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    moxios.uninstall(apiClient)
    jest.useRealTimers()
  })

  it('should select covered and uncovered tracks', async () => {
    await waitFor(
      () => {
        store.dispatch(
          autocapturePolygonsActions.success({
            polygons: mockAutcapturePolygons,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const covered = await selectCoveredPolygons(state)
    const uncovered = await selectUncoveredPolygons(state)
    expect(covered.length + uncovered.length).toBe(
      mockAutcapturePolygons.length
    )
  })
})
