/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import moxios from 'moxios'
import { Store } from 'redux'
import { getTestingStore } from 'store/configureTestingStorePlanning'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import {
  mkDeletePlan,
  mkGetPlan,
  mkPlanProcessStart,
  mkSavePlan,
  mkSplitPath,
  mkUpdatePlan,
} from 'store/features/planning/mockApi'
import {
  addPolygonAction,
  currentPolygonAction,
  deletePlannedJobActions,
  getPlannedJobActions,
  savePlannedJobActions,
  selectFinalAlignmentPoint,
  selectinitialAlignmentPoint,
  selectNeeded,
  selectPlanComplete,
  selectPlanningServiceState,
  selectPlanWarnings,
  selectPolygons,
  splitActions,
  startProcessingPlanActions,
  submitPlanAction,
  updatePlannedJobActions,
  updatePolygonNameAction,
  updatePolygonSettingsAction,
} from 'store/features/planning/slice'
import {
  JobPlan,
  PathSettings,
  PlanningProcessingStartRequest,
} from 'store/features/planning/types'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import {
  settings,
  waypoints,
  withNewSettings,
} from 'utils/planning/polygonHelpers'

const currentProject = mockStore.dataStorageService.currentProject!
const currentJob = mockStore.dataStorageService.currentJob!

const { disk, name: project } = currentProject
const { name: job } = currentJob

const mockPlan: JobPlan = {
  polygons: mockStore.planningService.undoablePolygons.present!,
  initialAlignmentPoint: mockStore.planningService.initialAlignmentPoint!,
  finalAlignmentPoint: mockStore.planningService.finalAlignmentPoint!,
  needed: mockStore.planningService.needed!,
  creationDate: mockStore.planningService.creationDate!,
  updateDate: mockStore.planningService.updateDate!,
}

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */

describe('PlanningView (mock API calls)', () => {
  let store: Store
  let mockDispatch: jest.SpyInstance<any, [action: any]>
  let mockGetPlanAPI: jest.SpyInstance<any>
  let mockSavePlanAPI: jest.SpyInstance<any>
  let mockUpdatePlanAPI: jest.SpyInstance<any>
  let mockDeletePlanAPI: jest.SpyInstance<any>
  let mockProcessStartPlanAPI: jest.SpyInstance<any>
  let mockSplitSinglePathAPI: jest.SpyInstance<any>

  beforeEach(async () => {
    store = getTestingStore()
    mockDispatch = jest.spyOn(store, 'dispatch')
    mockGetPlanAPI = mkGetPlan()
    mockSavePlanAPI = mkSavePlan()
    mockUpdatePlanAPI = mkUpdatePlan()
    mockDeletePlanAPI = mkDeletePlan()
    mockProcessStartPlanAPI = mkPlanProcessStart()
    mockSplitSinglePathAPI = mkSplitPath()
    /** mock API */
    moxios.install(apiClient)
    // moxios.install(mockApiClientPlanning)
    moxios.stubRequest(`/planning/plan/${disk}/${project}/${job}`, {
      status: 200,
      response: {
        plan: {
          polygons: mockPlan.polygons,
        },
      },
    })
    moxios.stubRequest('/planning/actionprocess', {
      status: 200,
      response: {
        action: {
          status: 'done',
          progress: 100,
          description: 'Plan processed',
        },
      },
    })
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        store.dispatch(dataStorageProjectDetailActions.success(currentProject))
        store.dispatch(dataStorageJobDetailActions.success({ job: currentJob }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    // moxios.uninstall(mockApiClientPlanning)
    moxios.uninstall(apiClient)
    mockGetPlanAPI.mockClear()
    mockSavePlanAPI.mockClear()
    mockUpdatePlanAPI.mockClear()
    mockDeletePlanAPI.mockClear()
    mockProcessStartPlanAPI.mockClear()
    mockSplitSinglePathAPI.mockClear()
    mockDispatch.mockClear()
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('should save a job plan with an action', async () => {
    const request = {
      disk,
      job,
      project,
      plan: mockPlan,
    }
    await waitFor(
      () => {
        store.dispatch(savePlannedJobActions.request(request))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockSavePlanAPI).toHaveBeenCalledWith(request)
  })

  test('should update a job plan with an action', async () => {
    const request = {
      disk,
      job,
      project,
      plan: mockPlan,
    }
    await waitFor(
      () => {
        store.dispatch(updatePlannedJobActions.request(request))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockUpdatePlanAPI).toHaveBeenCalledWith(request)
  })

  test('should delete a job plan with an action', async () => {
    const request = {
      disk,
      job,
      project,
    }
    await waitFor(
      () => {
        store.dispatch(deletePlannedJobActions.request(request))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDeletePlanAPI).toHaveBeenCalledWith(request)
  })

  test('should start estimating a job plan with an action', async () => {
    const request: PlanningProcessingStartRequest = {
      disk,
      job,
      project,
      optimize: true,
      plan: mockPlan,
    }
    await waitFor(
      () => {
        store.dispatch(startProcessingPlanActions.request(request))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockProcessStartPlanAPI).toHaveBeenCalledWith(request)
  })

  test('should call save plan if the plan is new', async () => {
    await waitFor(
      () => {
        store.dispatch(
          getPlannedJobActions.success({
            plan: {
              ...mockPlan,
              creationDate: undefined,
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        store.dispatch(
          submitPlanAction({ process: false, save: true, activate: false })
        )
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(mockSavePlanAPI).toHaveBeenCalled()
  })

  test('should alert the user if no initial point is set', async () => {
    await waitFor(
      () => {
        store.dispatch(
          getPlannedJobActions.success({
            plan: {
              ...mockPlan,
              creationDate: undefined,
              initialAlignmentPoint: undefined,
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        store.dispatch(
          submitPlanAction({ process: true, save: true, activate: false })
        )
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(mockSavePlanAPI).not.toHaveBeenCalled()
  })

  test('should call save without estimating', async () => {
    await waitFor(
      () => {
        store.dispatch(
          getPlannedJobActions.success({
            plan: {
              ...mockPlan,
              creationDate: undefined,
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        store.dispatch(
          submitPlanAction({ process: false, save: true, activate: false })
        )
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(mockProcessStartPlanAPI).not.toHaveBeenCalled()
    expect(mockSavePlanAPI).toHaveBeenCalled()
  })

  test('should call update plan if the plan existed', async () => {
    await waitFor(
      () => {
        store.dispatch(
          getPlannedJobActions.success({
            plan: mockPlan,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        store.dispatch(
          submitPlanAction({ process: false, save: true, activate: false })
        )
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(mockUpdatePlanAPI).toHaveBeenCalled()
  })

  test('should call the split path API with an action', async () => {
    await waitFor(
      () => {
        store.dispatch(
          getPlannedJobActions.success({
            plan: mockPlan,
          })
        )
        store.dispatch(currentPolygonAction(mockPlan.polygons[0].id!))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        const wps = waypoints(mockPlan.polygons[0])
        const splitPoint = wps[3]
        store.dispatch(
          splitActions.request({
            splitPoint,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockSplitSinglePathAPI).toHaveBeenCalled()
  })

  // FIXME: PLANNING - fails until we have a working API
  /*
  test('should call the split path API with an action (internal paths)', async () => {
    await waitFor(
      () => {
        store.dispatch(
          getPlannedJobActions.success({
            plan: mockPlan,
          })
        )
        store.dispatch(currentPolygonsAction(mockPlan.polygons[1].id!))
        store.dispatch(currentInternalPolygonAction(1))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        const wps = waypoints(mockPlan.polygons[0])
        const splitpoint: Coord3D = {
          x: wps[3].Longitude,
          y: wps[3].Latitude,
        }
        store.dispatch(
          splitInternalPolygonActions.request({
            splitpoint,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockSplitPolygonAPI).toHaveBeenCalled()
  })
  */

  test('should remove the old polygon from the store and add the two new polygons in its place', async () => {
    await waitFor(
      () => {
        store.dispatch(
          getPlannedJobActions.success({
            plan: mockPlan,
          })
        )
        store.dispatch(currentPolygonAction(mockPlan.polygons[0].id!))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        const wps = waypoints(mockPlan.polygons[0])
        const splitPoint = wps[3]
        store.dispatch(
          splitActions.request({
            splitPoint,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const polygonsAfter = await selectPolygons(stateAfter)
    expect(polygonsAfter.length).toBe(mockPlan.polygons.length + 1)
    expect(
      waypoints(polygonsAfter[0]).length + waypoints(polygonsAfter[1]).length
    ).toBe(waypoints(mockPlan.polygons[0]).length)
    expect(polygonsAfter[0].name).toBe(`${mockPlan.polygons[0].name} (1)`)
  })

  // FIXME: PLANNING - fails until we have a working API
  /*
  test('should remove the old polygon from the store and add the two new polygons in its place (internal polygons)', async () => {
    await waitFor(
      () => {
        store.dispatch(
          getPlannedJobActions.success({
            plan: mockPlan,
          })
        )
        store.dispatch(currentPolygonAction(mockPlan.polygons[1].id!))
        store.dispatch(currentInternalPolygonAction(1))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        const wps = waypoints(mockPlan.polygons[0])
        const splitpoint: Coord3D = {
          x: wps[3].Longitude,
          y: wps[3].Latitude,
        }
        store.dispatch(
          splitInternalPolygonActions.request({
            splitpoint,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const polygonsAfter = await selectPolygons(stateAfter)
    const internalPolygonsBefore = internalPolygons(mockPlan.Polygons[1]) || []
    const internalpolygonsAfter = internalPolygons(polygonsAfter[1]) || []
    expect(internalpolygonsAfter.length).toBe(internalPolygonsBefore.length + 1)
    // TODO: PLANNING - restore
    // expect(
    //   waypoints(polygonsAfter[0]).length + waypoints(polygonsAfter[1]).length
    // ).toBe(waypoints(mockPlan.polygons[0]).length)
    // expect(polygonsAfter[0].name).toBe(`${mockPlan.polygons[0].name} (1)`)
  })
  */
})

describe('PlanningView (mock API responses)', () => {
  let store: Store
  let mockDispatch: jest.SpyInstance<any, [action: any]>

  beforeEach(async () => {
    // enable fake timers
    jest.useFakeTimers()
    store = getTestingStore()
    mockDispatch = jest.spyOn(store, 'dispatch')
    // mock API
    // moxios.install(mockApiClientPlanning)
    // moxios.stubRequest(
    //   `/planning/geometry/${diskName}/${projectName}/${jobName}`,
    //   {
    //     status: 200,
    //     response: {
    //       plan: mockPlan,
    //     },
    //   }
    // )
    // render
    await waitFor(
      () => {
        store.dispatch(dataStorageProjectDetailActions.success(currentProject))
        store.dispatch(dataStorageJobDetailActions.success({ job: currentJob }))
        store.dispatch(
          savePlannedJobActions.success({
            plan: mockPlan,
            warnings: mockStore.planningService.warnings!,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    // moxios.uninstall(mockApiClientPlanning)
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('should fill the store with the job plan', async () => {
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const polygons = await selectPolygons(state)
    expect(polygons).toStrictEqual(mockPlan.polygons)
    const initialAlignmentPoint = await selectinitialAlignmentPoint(state)
    expect(initialAlignmentPoint).toBe(mockPlan.initialAlignmentPoint!)
    const finalAlignmentPoint = await selectFinalAlignmentPoint(state)
    expect(finalAlignmentPoint).toBe(mockPlan.finalAlignmentPoint!)
    const needed = await selectNeeded(state)
    expect(needed).toBe(mockPlan.needed!)
    const complete = await selectPlanComplete(state)
    expect(complete).toBe(true)
    const warnings = await selectPlanWarnings(state)
    expect(warnings).toStrictEqual(mockStore.planningService.warnings!)
  })

  test('should be able to update polygon settings', async () => {
    const newSettings: PathSettings = {
      camera: { enable: 0, distance: 1, elapse: 250 },
      scanner: {
        range: 150,
        scanlineSpacing: 3,
      },
      collection: {
        multiple: false,
      },
    }
    await waitFor(
      () => {
        store.dispatch(
          updatePolygonSettingsAction(
            withNewSettings(mockPlan.polygons[0], newSettings)
          )
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const polygons = await selectPolygons(state)
    expect(settings(polygons[0])).toBe(newSettings)
  })

  test('should be able to rename a polygon', async () => {
    const name = 'UpdatedPolygonkName'
    await waitFor(
      () => {
        store.dispatch(
          updatePolygonNameAction({
            ...mockPlan.polygons[0],
            name,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const polygons = await selectPolygons(state)
    expect(polygons[0].name).toBe(name)
  })

  test('should reset undo history at save', async () => {
    await waitFor(
      () => {
        store.dispatch(
          addPolygonAction({
            ...mockStore.planningService.undoablePolygons.present[0],
            name: 'Scan12',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const history = await selectPlanningServiceState(state).undoablePolygons
      .past
    expect(history.length).toBeGreaterThan(0)
    await waitFor(
      () => {
        store.dispatch(savePlannedJobActions.success({ plan: mockPlan }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const historyAfter = await selectPlanningServiceState(stateAfter)
      .undoablePolygons.past
    expect(historyAfter.length).toBe(0)
  })

  test('should reset undo history at update', async () => {
    await waitFor(
      () => {
        store.dispatch(
          addPolygonAction({
            ...mockStore.planningService.undoablePolygons.present[0],
            name: 'Scan12',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const history = await selectPlanningServiceState(state).undoablePolygons
      .past
    expect(history.length).toBeGreaterThan(0)
    await waitFor(
      () => {
        store.dispatch(updatePlannedJobActions.success({ plan: mockPlan }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const historyAfter = await selectPlanningServiceState(stateAfter)
      .undoablePolygons.past
    expect(historyAfter.length).toBe(0)
  })

  // TODO: PLANNING - should not display Estimate Plan if only renamed, but just Save Plan (also true for internal polygons)
  // TODO: PLANNING - should display the route after estimation (hold)
  // TODO: PLANNING - should not be able to reorder polygons before the first estimation (hold)
  // TODO: PLANNING - should not estimate if the polygon paths have not been extracted
  // TODO: PLANNING - should not activate if the polygon paths have not been extracted
  // TODO: PLANNING - will deletion be handled by the backend while deleting the job?
  // TODO: PLANNING - should be able to split polygon paths
  // TODO: PLANNING - should be able to delete polygon paths
})
