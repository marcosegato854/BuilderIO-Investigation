/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import { update } from 'ramda'
import { store } from 'store'
import { PathSettings } from 'store/features/planning/types'
import apiRouting from 'store/features/routing/api'
import {
  mkAutocapturePolygons,
  mkAutocaptureStatusUpdate,
  mkAutocaptureUpdatePolygons,
} from 'store/features/routing/mockApi'
import {
  autocaptureAbortActions,
  autocapturePolygonsActions,
  reorderUncoveredPathsAction,
  resetRoutingAction,
  routingSubscribeAction,
  routingUnsubscribeAction,
  selectCoveredPolygons,
  selectUncoveredPolygons,
  updateUncoveredPathSettingsAction,
} from 'store/features/routing/slice'
import { mockAutcapturePolygons } from 'store/mock/mockAutocapturePolygons'
import apiClient from 'store/services/apiClientBackend'
import mockApiClient from 'store/services/mockApiClientPlanning'
import { getSocketUrl } from 'store/services/socketClientBackend'
import { settings, withNewSettings } from 'utils/planning/polygonHelpers'

describe('Routing', () => {
  let ws: WS
  let mockTracksAPI: jest.SpyInstance<any>
  let mockUpdateTracksAPI: jest.SpyInstance<any>
  let mockUpdateAutocaptureStateAPI: jest.SpyInstance<any>
  const newSettings: PathSettings = {
    camera: { enable: 0, distance: 2, elapse: 250 },
    scanner: {
      range: 150,
      scanlineSpacing: 3,
    },
    collection: {
      multiple: false,
    },
  }
  const updatedTrack = withNewSettings(mockAutcapturePolygons[1], newSettings)
  const updatedRoutingTracks = update(1, updatedTrack, mockAutcapturePolygons)

  beforeEach(async () => {
    // mock API
    moxios.install(mockApiClient)
    moxios.install(apiClient)
    moxios.stubRequest('/user/settings', {
      status: 200,
      response: {},
    })
    mockTracksAPI = mkAutocapturePolygons()
    mockUpdateTracksAPI = jest
      .spyOn(apiRouting, 'autocaptureUpdatePolygons')
      .mockReturnValue({
        status: 200,
        data: {
          polygons: updatedRoutingTracks,
        },
      } as any)
    mockUpdateAutocaptureStateAPI = mkAutocaptureStatusUpdate()
    ws = new WS(`${getSocketUrl()}/routing`)
    // ws = new WS(`${getMockSocketUrl()}`)
    store.dispatch(routingSubscribeAction())
    await ws.connected
    jest.useFakeTimers()
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(routingUnsubscribeAction())
        store.dispatch(
          autocapturePolygonsActions.success({
            polygons: [],
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    moxios.uninstall(mockApiClient)
    moxios.uninstall(apiClient)
    mockTracksAPI.mockClear()
    mockUpdateTracksAPI.mockClear()
    mockUpdateAutocaptureStateAPI.mockClear()
    WS.clean()
    jest.useRealTimers()
  })

  it('should save uncovered tracks after reordering', async () => {
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
    //
    await waitFor(
      () => {
        store.dispatch(
          reorderUncoveredPathsAction({
            fromIndex: 0,
            toIndex: 1,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    expect(mockUpdateTracksAPI).toHaveBeenCalled()
  })

  it('should save uncovered tracks after updating settings', async () => {
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
    //
    const stateBefore = await store.getState()
    const uncoveredBefore = await selectUncoveredPolygons(stateBefore)
    await waitFor(
      () => {
        store.dispatch(
          updateUncoveredPathSettingsAction(
            withNewSettings(uncoveredBefore[0], newSettings)
          )
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    expect(mockUpdateTracksAPI).toHaveBeenCalled()
  })

  it('updates the tracks after posting the update', async () => {
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
    //
    const stateBefore = await store.getState()
    const uncoveredBefore = await selectUncoveredPolygons(stateBefore)
    await waitFor(
      () => {
        store.dispatch(
          updateUncoveredPathSettingsAction(
            withNewSettings(uncoveredBefore[0], newSettings)
          )
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    const stateAfter = await store.getState()
    const uncoveredAfter = await selectUncoveredPolygons(stateAfter)
    expect(settings(uncoveredAfter[0])).toBe(newSettings)
  })

  it('should reset routing tracks', async () => {
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
    //
    await waitFor(
      () => {
        store.dispatch(resetRoutingAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    const stateAfter = await store.getState()
    const uncoveredAfter = await selectUncoveredPolygons(stateAfter)
    expect(uncoveredAfter.length).toBe(0)
    const coveredAfter = await selectCoveredPolygons(stateAfter)
    expect(coveredAfter.length).toBe(0)
  })

  it('should abort routing with an action', async () => {
    await waitFor(
      () => {
        store.dispatch(autocaptureAbortActions.request())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    expect(mockUpdateAutocaptureStateAPI).toHaveBeenCalled()
  })

  // Disabled: it should remain connected since it can be re-enabled
  // it('should disconnect from the socket if aborted successfully', async () => {
  //   await waitFor(
  //     () => {
  //       const currentJob = mockStore.dataStorageService.currentJob!
  //       store.dispatch(dataStorageJobDetailActions.success({ job: currentJob }))
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const stateBefore = await store.getState()
  //   expect(stateBefore.routingService.routingSocketConnected).toBe(true)
  //   await waitFor(
  //     () => {
  //       store.dispatch(autocaptureAbortActions.request())
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   //
  //   const stateAfter = await store.getState()
  //   expect(stateAfter.routingService.routingSocketConnected).toBe(false)
  // })

  // TODO: PLANNING - handle polygons
})

describe('Routing (errors)', () => {
  let ws: WS
  let mockTracksAPI: jest.SpyInstance<any>
  let mockUpdateTracksAPI: jest.SpyInstance<any>
  let mockConsoleError: jest.SpyInstance<any>
  const newSettings: PathSettings = {
    camera: { enable: 0, distance: 2, elapse: 250 },
    scanner: {
      range: 150,
      scanlineSpacing: 3,
    },
    collection: {
      multiple: false,
    },
  }
  const updatedTrack = withNewSettings(mockAutcapturePolygons[1], newSettings)
  const updatedRoutingTracks = update(1, updatedTrack, mockAutcapturePolygons)

  beforeEach(async () => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    // mock API
    moxios.install(mockApiClient)
    moxios.install(apiClient)
    moxios.stubRequest('/user/settings', {
      status: 200,
      response: {},
    })
    mockTracksAPI = mkAutocapturePolygons({
      polygons: mockAutcapturePolygons,
    })
    mockUpdateTracksAPI = mkAutocaptureUpdatePolygons({
      polygons: updatedRoutingTracks,
    })
    ws = new WS(`${getSocketUrl()}/routing`)
    // ws = new WS(`${getMockSocketUrl()}`)
    store.dispatch(routingSubscribeAction())
    await ws.connected
    jest.useFakeTimers()
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(routingUnsubscribeAction())
        store.dispatch(
          autocapturePolygonsActions.success({
            polygons: [],
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    moxios.uninstall(mockApiClient)
    moxios.uninstall(apiClient)
    mockConsoleError.mockClear()
    mockTracksAPI.mockClear()
    mockUpdateTracksAPI.mockClear()
    WS.clean()
    jest.useRealTimers()
  })

  it('should reorder uncovoered tracks', async () => {
    mockUpdateTracksAPI.mockClear()
    mockUpdateTracksAPI = jest
      .spyOn(apiRouting, 'autocaptureUpdatePolygons')
      .mockRejectedValue('error updating polygons')
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
    const stateBefore = await store.getState()
    const uncoveredBefore = await selectUncoveredPolygons(stateBefore)
    await waitFor(
      () => {
        store.dispatch(
          reorderUncoveredPathsAction({
            fromIndex: 0,
            toIndex: 1,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const uncoveredAfter = await selectUncoveredPolygons(stateAfter)
    expect(uncoveredAfter[1].id).toBe(uncoveredBefore[0].id)
  })

  it('should update uncovered tracks settings', async () => {
    mockUpdateTracksAPI.mockClear()
    mockUpdateTracksAPI = jest
      .spyOn(apiRouting, 'autocaptureUpdatePolygons')
      .mockRejectedValue('error updating polygons')
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
    const stateBefore = await store.getState()
    const uncoveredBefore = await selectUncoveredPolygons(stateBefore)
    await waitFor(
      () => {
        store.dispatch(
          updateUncoveredPathSettingsAction(
            withNewSettings(uncoveredBefore[0], newSettings)
          )
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const uncoveredAfter = await selectUncoveredPolygons(stateAfter)
    expect(settings(uncoveredAfter[0])).toBe(newSettings)
  })
})
