/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { ErrorManager } from 'components/organisms/ErrorManager/ErrorManager'
import { PlanningView } from 'components/organisms/PlanningView/PlanningView'
import { t } from 'i18n/config'
import moxios from 'moxios'
import { last } from 'ramda'
import randomColor from 'randomcolor'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { closeAllDialogsAction } from 'store/features/dialogs/slice'
import { resetStoreAction } from 'store/features/global/slice'
import {
  mkGetPlan,
  mkPlanProcessInfo,
  mkPlanProcessStart,
  mkSavePlan,
  mkUpdatePlan,
  mockPlan,
} from 'store/features/planning/mockApi'
import {
  addPointAction,
  addPolygonAction,
  clearPlanningHistoryAction,
  currentPolygonAction,
  deletePolygonAction,
  editPointAction,
  finalPointAction,
  getPlannedJobActions,
  initialPointAction,
  processingInfoPlanActions,
  resetPlanAction,
  savePlannedJobActions,
  selectCurrentPolygon,
  selectEditedStatus,
  selectNeeded,
  selectPlanComplete,
  selectPolygons,
  startProcessingPlanActions,
  submitPlanAction,
  updatePlannedJobActions,
} from 'store/features/planning/slice'
import { Coord3DPlanning, Polygon } from 'store/features/planning/types'
import { mkGetSettings, mkSaveSettings } from 'store/features/settings/mockApi'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { waypoints } from 'utils/planning/polygonHelpers'
import { renderWithProvider } from 'utils/test'

beforeAll(() => {
  jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn())
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)
const mockPolygon: Polygon = {
  ...mockStore.planningService.undoablePolygons.present[0]!,
  id: undefined,
}

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.spyOn(store, 'dispatch')

describe('PlanningView (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<PlanningView />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display job name', () => {
    expect(component.getByText('Project002: Job001')).toBeTruthy()
  })

  test('It should display maps copyright', () => {
    expect(component.getByTestId('tiles-copyright')).toBeTruthy()
  })
})

describe('PlanningView (realStore)', () => {
  let component: RenderResult<typeof queries>
  let mockSaveSettingsAPI: jest.SpyInstance<any>

  beforeEach(async () => {
    // mock API
    moxios.install(apiClient)
    // moxios.install(mockApiClientPlanning)
    moxios.stubRequest('/planning/path', {
      status: 200,
      response: {
        polygons: [mockPolygon],
      },
    })

    mockSaveSettingsAPI = mkSaveSettings()

    // render
    component = renderWithProvider(<PlanningView />)(store)
    //
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        store.dispatch(
          dataStorageProjectDetailActions.success({
            disk: 'p',
            jobs: 0,
            name: 'test',
            completed: 0,
          })
        )
        store.dispatch(
          addPolygonAction({
            ...mockPolygon,
            name: 'Scan1',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const polygons = await selectPolygons(state)
    await waitFor(
      () => {
        store.dispatch(currentPolygonAction(polygons[0].temp_id!))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    mockSaveSettingsAPI.mockClear()
    // moxios.uninstall(mockApiClientPlanning)
    moxios.uninstall(apiClient)
    mockDispatch.mockClear()
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should add a new polygon', async () => {
    await waitFor(
      () => {
        store.dispatch(
          addPolygonAction({
            ...mockPolygon,
            name: 'Scan2',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const polygons = await selectPolygons(state)
    expect(polygons.length).toBe(2)
    expect(polygons[1].name).toBe('Scan2')
  })

  test('should select a polygon and make it the current polygon', async () => {
    await waitFor(
      () => {
        store.dispatch(
          addPolygonAction({
            ...mockPolygon,
            name: 'Scan2',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    let state = await store.getState()
    const polygons = await selectPolygons(state)
    await waitFor(
      () => {
        store.dispatch(currentPolygonAction(polygons[0]!.temp_id!))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    state = await store.getState()
    const currentPolygon = await selectCurrentPolygon(state)
    expect(currentPolygon?.name).toBe('Scan1')
  })

  test('should add a point in the current path (dafault at the end)', async () => {
    const coord: Coord3DPlanning = {
      x: 1,
      y: 2,
      isFreePoint: false,
    }
    await waitFor(
      () => {
        store.dispatch(addPointAction({ coord }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const currentPolygon = await selectCurrentPolygon(state)
    const wps = waypoints(currentPolygon)
    expect(last(wps)).toStrictEqual(
      expect.objectContaining({
        longitude: coord.x,
        latitude: coord.y,
        freePoint: coord.isFreePoint,
      })
    )
  })

  test('should add a point in the current path at a specific position', async () => {
    const coord2: Coord3DPlanning = {
      x: 2,
      y: 3,
      isFreePoint: true,
    }
    await waitFor(
      () => {
        store.dispatch(addPointAction({ coord: coord2, atIndex: 0 }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const currentPolygon = await selectCurrentPolygon(state)
    const wps = waypoints(currentPolygon)
    expect(wps[0]).toStrictEqual(
      expect.objectContaining({
        longitude: coord2.x,
        latitude: coord2.y,
        freePoint: coord2.isFreePoint,
      })
    )
  })

  test('should edit a single point on the current path', async () => {
    const coord2: Coord3DPlanning = {
      x: 2,
      y: 3,
      isFreePoint: false,
    }
    await waitFor(
      () => {
        store.dispatch(editPointAction({ coord: coord2, atIndex: 1 }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const currentPolygon = await selectCurrentPolygon(state)
    const wps = waypoints(currentPolygon)
    expect(wps[1]).toStrictEqual(
      expect.objectContaining({
        longitude: coord2.x,
        latitude: coord2.y,
        freePoint: coord2.isFreePoint,
      })
    )
  })

  test('should remove a polygon', async () => {
    await waitFor(
      () => {
        store.dispatch(
          addPolygonAction({
            ...mockPolygon,
            name: 'Scan2',
          })
        )
        store.dispatch(
          addPolygonAction({
            ...mockPolygon,
            name: 'Scan3',
          })
        )
        store.dispatch(
          deletePolygonAction({
            name: 'Scan1',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const polygons = await selectPolygons(state)
    expect(polygons.length).toBe(2)
    expect(polygons[0].name).toBe('Scan2')
  })

  test('should assign a random color to each path', async () => {
    const state = await store.getState()
    const currentPolygon = await selectCurrentPolygon(state)
    expect(currentPolygon?.color).not.toBeUndefined()
  })

  test('should keep the color of a path if available', async () => {
    const color = randomColor()
    await waitFor(
      () => {
        store.dispatch(
          addPolygonAction({
            ...mockPolygon,
            name: 'Scan2',
            color,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    let state = await store.getState()
    const polygons = await selectPolygons(state)
    await waitFor(
      () => {
        store.dispatch(currentPolygonAction(last(polygons)!.temp_id!))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    state = await store.getState()
    const currentPolygon = await selectCurrentPolygon(state)
    expect(currentPolygon?.color).toBe(color)
  })

  // TODO: PLANNING - should display all the planned paths and polygons at load (refine)
})

const currentProject = mockStore.dataStorageService.currentProject!
const currentJob = mockStore.dataStorageService.currentJob!

const projectName = currentProject.name
const diskName = currentProject.disk
const jobName = currentJob.name

describe('PlanningView (real store)', () => {
  let component: RenderResult<typeof queries>
  let mockGetPlanAPI: jest.SpyInstance<any>
  let mockSavePlanAPI: jest.SpyInstance<any>
  let mockUpdatePlanAPI: jest.SpyInstance<any>
  let mockProcessPlanStartAPI: jest.SpyInstance<any>
  let mockProcessPlanInfoAPI: jest.SpyInstance<any>
  let mockedUserSettingsApi: jest.SpyInstance<any>

  beforeEach(async () => {
    mockedUserSettingsApi = mkGetSettings()
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
    // mock API
    mockGetPlanAPI = mkGetPlan()
    // prevent api to actually call the backend
    mockSavePlanAPI = mkSavePlan({
      plan: mockPlan,
      warnings: mockStore.planningService.warnings!,
    })
    mockUpdatePlanAPI = mkUpdatePlan()
    mockProcessPlanStartAPI = mkPlanProcessStart({
      action: {
        status: 'done',
        progress: 100,
        description: '',
      },
    })
    mockProcessPlanInfoAPI = mkPlanProcessInfo()
    jest.advanceTimersByTime(500)
    // render
    component = renderWithProvider(
      <div>
        <DialogManager />
        <ErrorManager />
        <PlanningView />
      </div>
    )(store)
  })

  afterEach(async () => {
    mockGetPlanAPI.mockClear()
    mockUpdatePlanAPI.mockClear()
    mockSavePlanAPI.mockClear()
    mockProcessPlanStartAPI.mockClear()
    mockProcessPlanInfoAPI.mockClear()
    mockedUserSettingsApi.mockClear()
    await waitFor(
      () => {
        store.dispatch(closeAllDialogsAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    jest.useRealTimers()
  })

  test('should present a save button if the plan has been edited', async () => {
    await waitFor(
      () => {
        store.dispatch(addPolygonAction(mockPolygon))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const edited = await selectEditedStatus(state)
    expect(edited).toBe(true)
    const submitButton = component.getByTestId('submit-button')
    expect(submitButton.getElementsByTagName('span')[0].textContent).toBe(
      t('planning.submit.estimate', 'Wrong')
    )
  })

  test('should allow to save only from the secondary button', async () => {
    await waitFor(
      () => {
        store.dispatch(addPolygonAction(mockPolygon))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const edited = await selectEditedStatus(state)
    expect(edited).toBe(true)
    const submitButtonArrow = component.getByTestId('arrow-icon')
    await waitFor(
      () => {
        fireEvent.click(submitButtonArrow)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const submitButtonSecondary = component.getByTestId(
      'submit-button-secondary'
    )
    expect(submitButtonSecondary).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(submitButtonSecondary)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toBeCalledWith(
      submitPlanAction({
        process: false,
        save: true,
        activate: false,
      })
    )
  })

  test('should not present a save button if the plan has not been edited', async () => {
    await waitFor(
      () => {
        store.dispatch(clearPlanningHistoryAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const edited = await selectEditedStatus(state)
    expect(edited).toBe(false)
    expect(
      screen.queryByText(t('planning.submit.save_activate') as string)
    ).not.toBeInTheDocument()
  })

  test('should submit the current plan', async () => {
    await waitFor(
      () => {
        store.dispatch(addPolygonAction(mockPolygon))
        store.dispatch(
          initialPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
        store.dispatch(
          finalPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const edited = await selectEditedStatus(state)
    expect(edited).toBe(true)
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      submitPlanAction({
        process: true,
        save: true,
        activate: false,
      })
    )
    const estimateLabel: string = t('planning.submit.optimise_plan', 'wrong')
    const estimateAlert = component.getByText(estimateLabel)
    expect(estimateAlert).toBeTruthy()
    const okButton = component.getByTestId('alert-ok-button')
    expect(okButton).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockProcessPlanStartAPI).toHaveBeenCalledWith(
      expect.objectContaining({
        optimize: false,
      })
    )
  })

  test('should submit the optimised plan', async () => {
    await waitFor(
      () => {
        store.dispatch(addPolygonAction(mockPolygon))
        store.dispatch(
          initialPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
        store.dispatch(
          finalPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const edited = await selectEditedStatus(state)
    expect(edited).toBe(true)
    const submitButton = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(
      submitPlanAction({
        process: true,
        save: true,
        activate: false,
      })
    )
    const estimateLabel: string = t('planning.submit.optimise_plan', 'wrong')
    const estimateAlert = component.getByText(estimateLabel)
    expect(estimateAlert).toBeTruthy()
    const cancelButton = component.getByTestId('alert-cancel-button')
    expect(cancelButton).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(cancelButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockProcessPlanStartAPI).toHaveBeenCalledWith(
      expect.objectContaining({
        optimize: true,
      })
    )
  })

  test('should reset the plan estimation status if the user edits paths and polygons', async () => {
    const needed = mockStore.planningService.needed!
    await waitFor(
      () => {
        store.dispatch(
          processingInfoPlanActions.success({
            action: {
              status: 'done',
              progress: 100,
              description: '',
            },
            result: {
              plan: {
                polygons: mockStore.planningService!.undoablePolygons.present,
                needed,
              },
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateBefore = await store.getState()
    const neededBefore = await selectNeeded(stateBefore)
    expect(neededBefore).toBe(needed)
    await waitFor(
      () => {
        store.dispatch(addPolygonAction(mockPolygon))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const neededAfter = await selectNeeded(stateAfter)
    expect(neededAfter).toEqual({
      time: null,
      battery: null,
      disk: null,
      distance: null,
    })
  })

  test('should display estimate if the plan is edited', async () => {
    await waitFor(
      () => {
        store.dispatch(
          updatePlannedJobActions.success({
            plan: { ...mockPlan },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        store.dispatch(addPolygonAction(mockPolygon))
        store.dispatch(
          initialPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
        store.dispatch(
          finalPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const edited = await selectEditedStatus(state)
    expect(edited).toBe(true)
    const complete = await selectPlanComplete(state)
    expect(complete).toBe(false)
    expect(
      component.getByText(t('planning.submit.estimate', 'wrong') as string)
    ).toBeTruthy()
  })

  test('should display start and activate if the plan is complete and not edited', async () => {
    await waitFor(
      () => {
        store.dispatch(addPolygonAction(mockPolygon))
        store.dispatch(
          initialPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
        store.dispatch(
          finalPointAction({ longitude: 0, latitude: 0, freePoint: true })
        )
        store.dispatch(
          updatePlannedJobActions.success({
            plan: { ...mockPlan },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const edited = await selectEditedStatus(state)
    expect(edited).toBe(false)
    expect(
      component.getByText(
        t('planning.submit.start_activate', 'wrong') as string
      )
    ).toBeTruthy()
  })

  // NOT WORKING: store is not updated with MemoryRouter. Enable and enable console.info to check if the push method is called
  // test('should redirect after saving if the plan is complete and edited', async () => {
  //   await waitFor(
  //     () => {
  //       store.dispatch(
  //         updatePlannedJobActions.success({
  //           plan: { ...mockPlan, complete: true },
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   await waitFor(
  //     () => {
  //       store.dispatch(addPolygonAction(mockPolygon))
  //       store.dispatch(initialPointAction({ x: 0, y: 0, isFreePoint: true }))
  //       store.dispatch(finalPointAction({ x: 0, y: 0, isFreePoint: true }))
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const state = await store.getState()
  //   const edited = await selectEditedStatus(state)
  //   expect(edited).toBe(true)
  //   const location = state.router.location.pathname
  //   expect(location).toBe(
  //     Routes.ACQUISITION.replace(':diskName', diskName)
  //       .replace(':projectName', projectName)
  //       .replace(':jobName', jobName)
  //   )
  // })

  // NOT WORKING: store is not updated with MemoryRouter. Enable and enable console.info to check if the push method is called
  // test('should redirect after saving if the plan is complete and not edited', async () => {
  //   await waitFor(
  //     () => {
  //       store.dispatch(addPolygonAction(mockPolygon))
  //       store.dispatch(initialPointAction({ x: 0, y: 1, isFreePoint: true }))
  //       store.dispatch(finalPointAction({ x: 0, y: 0, isFreePoint: true }))
  //       store.dispatch(
  //         updatePlannedJobActions.success({
  //           plan: { ...mockPlan, complete: true },
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const submitButton = component.getByTestId('submit-button')
  //   await waitFor(
  //     () => {
  //       fireEvent.click(submitButton)
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const state = await store.getState()
  //   const location = state.router.location.pathname
  //   expect(location).toBe(
  //     Routes.ACQUISITION.replace(':diskName', diskName)
  //       .replace(':projectName', projectName)
  //       .replace(':jobName', jobName)
  //   )
  // })

  test('should display warnings coming from the API responses', async () => {
    await waitFor(
      () => {
        const request = {
          disk: diskName,
          job: jobName,
          project: projectName,
          plan: mockPlan,
        }
        store.dispatch(savePlannedJobActions.request(request))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByText(t('planning.warnings.DS-039.title', 'Wrong') as string)
    ).toBeTruthy()
  })

  test('should reset the plan at unmount', async () => {
    await waitFor(
      () => {
        component.unmount()
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(resetPlanAction())
  })

  test('should not be edited after loading the plan', async () => {
    await waitFor(
      () => {
        store.dispatch(getPlannedJobActions.success({ plan: mockPlan }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const edited = await selectEditedStatus(state)
    expect(edited).toBe(false)
  })

  test('should br edited when modifiying initial point', async () => {
    await waitFor(
      () => {
        store.dispatch(getPlannedJobActions.success({ plan: mockPlan }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const edited = await selectEditedStatus(state)
    expect(edited).toBe(false)
    await waitFor(
      () => {
        store.dispatch(
          initialPointAction({
            longitude: 0,
            latitude: 0,
            freePoint: true,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const editedAfter = await selectEditedStatus(stateAfter)
    expect(editedAfter).toBe(true)
  })

  test('should be edited when modifiying final point', async () => {
    await waitFor(
      () => {
        store.dispatch(getPlannedJobActions.success({ plan: mockPlan }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const edited = await selectEditedStatus(state)
    expect(edited).toBe(false)
    await waitFor(
      () => {
        store.dispatch(
          finalPointAction({
            longitude: 0,
            latitude: 0,
            freePoint: true,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const editedAfter = await selectEditedStatus(stateAfter)
    expect(editedAfter).toBe(true)
  })

  test('should open a dialog if there are unsaved edits', async () => {
    await waitFor(
      () => {
        store.dispatch(getPlannedJobActions.success({ plan: mockPlan }))
        store.dispatch(
          finalPointAction({
            longitude: 0,
            latitude: 0,
            freePoint: true,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const editedAfter = await selectEditedStatus(stateAfter)
    expect(editedAfter).toBe(true)
    const backButton = component.getByTestId('plan-back-btn')
    await waitFor(
      () => {
        fireEvent.click(backButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        t('planning.alert.unsavedPlan.title', 'wrong') as string
      )
    ).toBeTruthy()
  })
})

/** Geolocation API is available only in secure contexts (a.k.a. only using HTTPS).
Getting geolocation data can take time, especially with high accuracy enabled – getting a GPS fix can take up to a minute. */
