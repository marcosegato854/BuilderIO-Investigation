/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import { Store } from 'redux'
// import { store } from 'store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { mkStartRecording } from 'store/features/actions/mockApi'
import { mkDataStorageState } from 'store/features/dataStorage/mockApi'
import { resetStoreAction } from 'store/features/global/slice'
import { mkGetPlan } from 'store/features/planning/mockApi'
import { pointCloudUnsubscribeAction } from 'store/features/pointcloud/slice'
import {
  mkAutocaptureCurrentPath,
  mkAutocaptureNeeded,
  mkAutocapturePolygons,
  mkAutocaptureStatus,
  mkRoutingPolyline,
  mkRoutingStatus,
} from 'store/features/routing/mockApi'
import {
  autocaptureStatusActions,
  routingStatusActions,
  routingSubscribeAction,
  routingUnsubscribeAction,
} from 'store/features/routing/slice'
import { RoutingSocketNotification } from 'store/features/routing/types'
import { mkSystemLog, mkSystemState } from 'store/features/system/mockApi'
import {
  modulesActions,
  stateSubscribeAction,
  stateUnsubscribeAction,
} from 'store/features/system/slice'
import { SystemState } from 'store/features/system/types'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import mockApiClient from 'store/services/mockApiClientPlanning'
import { getSocketUrl } from 'store/services/socketClientBackend'

describe('System Socket', () => {
  let store: Store
  let wsState: WS
  let wsRouting: WS
  let wsPointCloud: WS
  let mockeStartRecording: jest.SpyInstance<any>
  let mockGetPlan: jest.SpyInstance<any>
  let mockedPolygonsApi: jest.SpyInstance<any>
  const mockSystemStateAPI = mkSystemState()
  const mockCurrentTrackAPI = mkAutocaptureCurrentPath()
  const mockCoveredTracksAPI = mkAutocapturePolygons()
  const mockRealTimeEstimationsAPI = mkAutocaptureNeeded()
  const mockDataStorageInfoAPI = mkDataStorageState({
    disk: 'c',
    project: 'P01',
    job: 'J01',
    scan: '5',
  })
  const mockRoutingStatusAPI = mkRoutingStatus()
  const mockAutocaptureStatusAPI = mkAutocaptureStatus()
  const mockPolylineAPI = mkRoutingPolyline()
  const mkBackendLog = mkSystemLog()

  beforeEach(async () => {
    store = getTestingStore()
    store.dispatch(
      modulesActions.success({ modules: mockStore.system.modules })
    )
    store.dispatch(
      routingStatusActions.success({
        enabled: true,
        initial: false,
        final: false,
      })
    )
    store.dispatch(
      autocaptureStatusActions.success({
        enabled: true,
      })
    )
    // console.log('SSSSSS', expect.getState().currentTestName)
    // mock API
    // moxios.install(mockApiClient)
    moxios.install(apiClient)
    moxios.stubRequest('/datastorage/state', {
      status: 200,
      response: {
        disk: 'c',
        project: 'P01',
        job: 'J01',
        scan: '5',
      },
    })
    const project = mockStore.dataStorageService.currentProject!
    moxios.stubRequest('/datastorage/projects/c/P01', {
      status: 200,
      response: project,
    })
    moxios.stubRequest('/routing/autocapture/currentpath', {
      status: 200,
      response: { polygons: [] },
    })
    moxios.stubRequest('/routing/routing/polyline', {
      status: 200,
      response: { polygons: [] },
    })
    moxios.stubRequest('/system/log', {
      status: 200,
      response: {},
    })
    moxios.stubRequest(
      `/datastorage/projects/${project.disk}/${project.name}/jobs/J01`,
      {
        status: 200,
        response: { job: mockStore.dataStorageService.currentJob! },
      }
    )
    // moxios.stubRequest('/planning/plan/c/P01/jobs/Job001', {
    //   status: 200,
    //   response: { plan: mockStore.planningService },
    // })
    mockeStartRecording = mkStartRecording()
    mockedPolygonsApi = mkAutocapturePolygons()
    mockGetPlan = mkGetPlan()
    // mock SOCKET
    wsState = new WS(`${getSocketUrl()}/system/state`)
    store.dispatch(stateSubscribeAction())
    await wsState.connected
    wsRouting = new WS(`${getSocketUrl()}/routing`)
    store.dispatch(routingSubscribeAction())
    await wsRouting.connected
    wsPointCloud = new WS(`${getSocketUrl()}/pointcloud`)
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const client = new WebSocket(`${getSocketUrl()}/pointcloud`)
    await wsPointCloud.connected
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockSystemStateAPI.mockClear()
    mockCurrentTrackAPI.mockClear()
    mockCoveredTracksAPI.mockClear()
    mockRealTimeEstimationsAPI.mockClear()
    mockDataStorageInfoAPI.mockClear()
    mockRoutingStatusAPI.mockClear()
    mockAutocaptureStatusAPI.mockClear()
    mockPolylineAPI.mockClear()
    mkBackendLog.mockClear()
    mockedPolygonsApi.mockClear()
    mockGetPlan.mockClear()
    mockeStartRecording.mockClear()
    moxios.uninstall(apiClient)
    moxios.uninstall(mockApiClient)
    store.dispatch(resetStoreAction())
    store.dispatch(stateUnsubscribeAction())
    store.dispatch(routingUnsubscribeAction())
    store.dispatch(pointCloudUnsubscribeAction())
    WS.clean()
    jest.useRealTimers()
    // console.log('XXXXX', expect.getState().currentTestName)
  })

  test('should retrieve the current track if the recording status changes to Recording', async () => {
    const stateMessage: SystemState = {
      state: 'Recording',
    }
    wsState.send(JSON.stringify(stateMessage))
    await wsPointCloud.connected
    jest.advanceTimersByTime(500)
    expect(mockCurrentTrackAPI).toHaveBeenCalled()
  })

  test('should retrieve the current project and job if the recording status changes to Recording', async () => {
    const stateMessage: SystemState = {
      state: 'Recording',
    }
    wsState.send(JSON.stringify(stateMessage))
    await wsPointCloud.connected
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    expect(stateAfter.dataStorageService.currentProject).toBeTruthy()
    expect(stateAfter.dataStorageService.currentJob).toBeTruthy()
  })

  /** disabled, it opens the job info dialog on the slave and gets stuck there */
  // test('should update the activating state in the slave client', async () => {
  //   const stateBefore = await store.getState()
  //   expect(stateBefore.system.systemState?.state).toBe(undefined)
  //   expect(stateBefore.actionsService?.activationProgress).toBe(0)
  //   expect(stateBefore.pointCloudService?.connected).toBe(false)
  //   const stateMessage: SystemState = {
  //     state: 'Activating',
  //   }
  //   wsState.send(JSON.stringify(stateMessage))
  //   await waitFor(() => {}, { timeout: 500 })
  //   jest.advanceTimersByTime(500)
  //   await wsPointCloud.connected
  //   const stateAfter = await store.getState()
  //   expect(stateAfter.system.systemState?.state).toBe('Activating')
  //   expect(stateAfter.actionsService?.activationProgress).toBe(0)
  //   expect(mockDataStorageInfoAPI).toHaveBeenCalledTimes(1)
  // })

  test('should switch to activated status with a socket message Activated', async () => {
    const stateBefore = await store.getState()
    expect(stateBefore.system.systemState?.state).toBe(undefined)
    expect(stateBefore.actionsService?.recordingStatus).toBe(null)
    expect(stateBefore.pointCloudService?.connected).toBe(false)
    const stateMessage: SystemState = {
      state: 'Activated',
    }
    wsState.send(JSON.stringify(stateMessage))
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    await wsPointCloud.connected
    const stateAfter = await store.getState()
    expect(stateAfter.system.systemState?.state).toBe('Activated')
    expect(stateAfter.actionsService?.activationProgress).toBe(100)
    expect(stateAfter.pointCloudService?.connected).toBe(true)
    expect(mockDataStorageInfoAPI).toHaveBeenCalledTimes(1)
  })

  test('should update the deactivating state in the slave client', async () => {
    const stateBefore = await store.getState()
    expect(stateBefore.system.systemState?.state).toBe(undefined)
    expect(stateBefore.actionsService?.deactivationStatus).toBe(null)
    expect(stateBefore.pointCloudService?.connected).toBe(false)
    const stateMessage: SystemState = {
      state: 'Deactivating',
    }
    wsState.send(JSON.stringify(stateMessage))
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    await wsPointCloud.connected
    const stateAfter = await store.getState()
    expect(stateAfter.system.systemState?.state).toBe('Deactivating')
    expect(stateAfter.actionsService?.deactivationStatus).toBe('progress')
    expect(stateAfter.actionsService?.deactivating).toBe(true)
    expect(mockDataStorageInfoAPI).toHaveBeenCalledTimes(1)
  })

  test('should switch to recording status with a socket message Recording', async () => {
    const stateBefore = await store.getState()
    expect(stateBefore.system.systemState?.state).toBe(undefined)
    expect(stateBefore.actionsService?.recordingStatus).toBe(null)
    expect(stateBefore.pointCloudService?.connected).toBe(false)
    const stateMessage: SystemState = {
      state: 'Recording',
    }
    wsState.send(JSON.stringify(stateMessage))
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    await wsPointCloud.connected
    const stateAfter = await store.getState()
    expect(stateAfter.system.systemState?.state).toBe('Recording')
    expect(stateAfter.actionsService?.activationProgress).toBe(100)
    expect(stateAfter.actionsService?.recordingStatus).toBe('done')
    expect(stateAfter.pointCloudService?.connected).toBe(true)
    expect(mockDataStorageInfoAPI).toHaveBeenCalledTimes(1)
  })

  test('should not call the start recording actions from a socket state update', async () => {
    const stateBefore = await store.getState()
    expect(stateBefore.system.systemState?.state).toBe(undefined)
    expect(stateBefore.actionsService?.recordingStatus).toBe(null)
    const stateMessage: SystemState = {
      state: 'Recording',
    }
    wsState.send(JSON.stringify(stateMessage))
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    expect(mockeStartRecording).not.toHaveBeenCalled()
  })

  test('should retrieve the covered / uncovered tracks if the recording status changes to Recording', async () => {
    const stateMessage: SystemState = {
      state: 'Recording',
    }
    await waitFor(
      () => {
        wsState.send(JSON.stringify(stateMessage))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockCoveredTracksAPI).toHaveBeenCalled()
  })

  test('should retrieve the covered / uncovered tracks if the recording status changes to Activated', async () => {
    const stateMessage: SystemState = {
      state: 'Activated',
    }
    await waitFor(
      () => {
        wsState.send(JSON.stringify(stateMessage))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockCoveredTracksAPI).toHaveBeenCalled()
  })

  test('should retrieve the covered / uncovered tracks list when receiving a notification', async () => {
    const trackListChangedNotification: RoutingSocketNotification = {
      type: 'notification',
      data: {
        id: 1,
        time: '2021-11-24T09:36:01',
        type: 0,
        code: 'ROU-001',
        description: 'Covered tracks list changed',
        p1: '',
      },
    }
    await waitFor(
      () => {
        wsRouting.send(JSON.stringify(trackListChangedNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockCoveredTracksAPI).toHaveBeenCalled()
  })

  test('should call the routingStatus API when receiving a specific notification', async () => {
    const routingAlignmentNotification: RoutingSocketNotification = {
      type: 'notification',
      data: {
        id: 4,
        time: '2021-11-24T09:36:01',
        type: 3,
        code: 'ROU-003',
        description: 'Alignment points status changed',
        p1: '',
      },
    }
    await waitFor(
      () => {
        wsRouting.send(JSON.stringify(routingAlignmentNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockRoutingStatusAPI).toHaveBeenCalled()
  })

  test('should call the autocaptureStatus API when receiving a specific notification', async () => {
    const autocaptureNotification: RoutingSocketNotification = {
      type: 'notification',
      data: {
        id: 4,
        time: '2021-11-24T09:36:01',
        type: 3,
        code: 'AC-001',
        description: 'Autocapture status changed',
        p1: '',
      },
    }
    await waitFor(
      () => {
        wsRouting.send(JSON.stringify(autocaptureNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockAutocaptureStatusAPI).toHaveBeenCalled()
  })

  test('should retrieve the real time estimations when receiving a notification', async () => {
    const estimationsChangedNotification: RoutingSocketNotification = {
      type: 'notification',
      data: {
        id: 1,
        time: '2021-11-24T09:36:01',
        type: 0,
        code: 'ROU-004',
        description: 'Real time estimations changed',
        p1: '',
      },
    }
    await waitFor(
      () => {
        wsRouting.send(JSON.stringify(estimationsChangedNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockRealTimeEstimationsAPI).toHaveBeenCalled()
  })

  test('should retrieve the polyline when receiving a notification', async () => {
    const polylineChangedNotification: RoutingSocketNotification = {
      type: 'notification',
      data: {
        id: 1,
        time: '2021-11-24T09:36:01',
        type: 0,
        code: 'ROU-006',
        description: 'Polyline changed',
        p1: '',
      },
    }
    await waitFor(
      () => {
        wsRouting.send(JSON.stringify(polylineChangedNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockPolylineAPI).toHaveBeenCalled()
  })

  test('should switch to deactivated status with a socket message Deactivated', async () => {
    const stateBefore = await store.getState()
    expect(stateBefore.system.systemState?.state).toBe(undefined)
    expect(stateBefore.actionsService?.recordingStatus).toBe(null)
    expect(stateBefore.pointCloudService?.connected).toBe(false)
    const stateMessage: SystemState = {
      state: 'Recording',
    }
    wsState.send(JSON.stringify(stateMessage))
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    await wsPointCloud.connected
    const stateMiddle = await store.getState()
    expect(stateMiddle.pointCloudService?.connected).toBe(true)
    expect(mockDataStorageInfoAPI).toHaveBeenCalledTimes(1)
    wsState.send(
      JSON.stringify({
        state: 'Deactivated',
      })
    )
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    // await wsPointCloud.closed // diisabled becouse we keep the socket active until unmount in order to be able to render the final pointcloud
    const stateAfter = await store.getState()
    expect(stateAfter.system.systemState?.state).toBe('Deactivated')
    expect(stateAfter.actionsService?.activationProgress).toBe(0)
    expect(stateAfter.actionsService?.recordingStatus).toBe(null)
    // expect(stateAfter.pointCloudService?.connected).toBe(false) // diisabled becouse we keep the socket active until unmount in order to be able to render the final pointcloud
    expect(mockDataStorageInfoAPI).toHaveBeenCalledTimes(2) // TODO: PLANNING - not valid to check redirects with this, find another way
  })
})
