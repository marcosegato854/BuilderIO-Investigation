import { waitFor } from '@testing-library/react'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import { mergeDeepRight } from 'ramda'
import { store } from 'store/configureStore'
import { mkPointcloudState } from 'store/features/pointcloud/mockApi'
import {
  pointCloudConnected,
  pointCloudSubscribeAction,
  pointCloudUnsubscribeAction,
} from 'store/features/pointcloud/slice'
import { systemResponsivenessActions } from 'store/features/system/slice'
import { SystemResponsiveness } from 'store/features/system/types'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { getSocketUrl } from 'store/services/socketClientBackend'

describe('PointCloud Socket (mock response)', () => {
  let ws: WS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockedPointcloudStateApi: jest.SpyInstance<any>

  beforeEach(async () => {
    /** mock API */
    mockedPointcloudStateApi = mkPointcloudState({
      coordinateSystem: {
        epsg: 'COORD123',
        proj4: '+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs',
      },
      hspc: {
        folder: '',
      },
    })
    ws = new WS(`${getSocketUrl()}/pointcloud?token=null`)
    store.dispatch(pointCloudSubscribeAction())
    /** render */
    await ws.connected
    jest.useFakeTimers()
  })
  afterEach(() => {
    mockedPointcloudStateApi.mockClear()
    store.dispatch(pointCloudUnsubscribeAction())
    WS.clean()
    moxios.uninstall(apiClient)
    jest.useRealTimers()
  })

  it('marks the connection as active when it successfully connects to the ws server', () => {
    expect(store.getState().pointCloudService.connected).toBe(true)
  })

  it('calls updates projection on API response', () => {
    store.dispatch(pointCloudConnected(true))
    expect(store.getState().pointCloudService.projection).toBe('COORD123')
  })

  it('marks the connection as inactive after a disconnect', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    ws.close()
    await ws.closed
    expect(store.getState().pointCloudService.connected).toBe(false)
    jest.spyOn(console, 'error').mockRestore()
  })

  it('marks the connection as inactive after a connection error', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    ws.error()
    await ws.closed
    expect(store.getState().pointCloudService.connected).toBe(false)
    jest.spyOn(console, 'error').mockRestore()
  })

  // this logic has been moved in a hook that doesn't rewrite the store
  /* it('should display critical in performance status if a socket fails', async () => {
    await waitFor(
      () => {
        store.dispatch(
          systemResponsivenessActions.success(mockStore.system.responsiveness!)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    ws.error()
    await ws.closed
    expect(store.getState().system.responsiveness?.connection?.critical).toBe(
      true
    )
    expect(
      store.getState().system.responsiveness?.connection?.gateway?.critical
    ).toBe(true)
  }) */

  it('should restore perfomance status if a socket is restored', async () => {
    await waitFor(
      () => {
        store.dispatch(
          systemResponsivenessActions.success(mockStore.system.responsiveness!)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    ws.error()
    await ws.closed
    await waitFor(
      () => {
        const updatedResponsiveness = mergeDeepRight(
          mockStore.system.responsiveness!,
          {
            connection: {
              critical: false,
              gateway: {
                critical: false,
              },
            },
          }
        ) as SystemResponsiveness
        store.dispatch(
          systemResponsivenessActions.success(updatedResponsiveness)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(store.getState().system.responsiveness?.connection?.critical).toBe(
      false
    )
    expect(
      store.getState().system.responsiveness?.connection?.gateway?.critical
    ).toBe(false)
  })
})

/** on a different suite
 * because mock API and stub request
 * don't work well together */
describe('PointCloud Socket (spy on API)', () => {
  it('calls pointcloud API when socket is connected', () => {
    const mockAAPICall = mkPointcloudState()
    store.dispatch(pointCloudConnected(true))
    expect(mockAAPICall).toHaveBeenCalled()
    mockAAPICall.mockReset()
  })
})
