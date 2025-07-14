/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  RenderResult,
  fireEvent,
  queries,
  screen,
  waitFor,
} from '@testing-library/react'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { ErrorManager } from 'components/organisms/ErrorManager/ErrorManager'
import { PlanningView } from 'components/organisms/PlanningView/PlanningView'
import { t } from 'i18n/config'
import moxios from 'moxios'
import { last, mergeDeepRight } from 'ramda'
import { Store } from 'redux'
import { getTestingStore } from 'store/configureTestingStorePlanning'
import { getUserInfoActions } from 'store/features/auth/slice'
import { UserInfo } from 'store/features/auth/types'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { closeAllDialogsAction } from 'store/features/dialogs/slice'
import {
  mkGetPlan,
  mkImportShpInfo,
  mkImportShpStart,
  mkListShpInfo,
  mkListShpStart,
  mockPlan,
} from 'store/features/planning/mockApi'
import {
  addPolygonAction,
  currentPolygonAction,
  deleteInternalPathAction,
  getPlannedJobActions,
  importShpInfoActions,
  importShpStartActions,
  selectCurrentPolygonId,
  selectPolygons,
} from 'store/features/planning/slice'
import { Path, Polygon } from 'store/features/planning/types'
import { mkSaveSettings } from 'store/features/settings/mockApi'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { availableColors } from 'utils/colors'
import { polygonPaths } from 'utils/planning/polygonHelpers'
import { renderWithProvider } from 'utils/test'

const currentProject = mockStore.dataStorageService.currentProject!
const currentJob = mockStore.dataStorageService.currentJob!

const loggedUser: UserInfo = {
  usertype: 'service',
  username: 'admin',
}

describe('PlanningView (real store)', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  let component: RenderResult<typeof queries>
  let mockConsoleError: jest.SpyInstance<any>
  let mockGetPlanAPI: jest.SpyInstance<any>
  let mockShpStartAPI: jest.SpyInstance<any>
  let mockShpListStartAPI: jest.SpyInstance<any>
  let mockShpListInfoAPI: jest.SpyInstance<any>
  let mockShpInfoAPI: jest.SpyInstance<any>
  let mockedUserSettingsApi: jest.SpyInstance<any>
  let store: Store

  beforeEach(async () => {
    store = getTestingStore()
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        store.dispatch(dataStorageProjectDetailActions.success(currentProject))
        store.dispatch(dataStorageJobDetailActions.success({ job: currentJob }))
        store.dispatch(getPlannedJobActions.success({ plan: mockPlan }))
        store.dispatch(getUserInfoActions.success(loggedUser))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // mock API
    moxios.install(apiClient)
    // moxios.install(mockApiClientPlanning)
    mockedUserSettingsApi = mkSaveSettings()
    mockGetPlanAPI = mkGetPlan()
    // prevent api to actually call the backend
    mockShpStartAPI = mkImportShpStart()
    mockShpListStartAPI = mkListShpStart()
    mockShpListInfoAPI = mkListShpInfo()
    mockShpInfoAPI = mkImportShpInfo()
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
    moxios.uninstall(apiClient)
    mockGetPlanAPI.mockClear()
    mockShpStartAPI.mockClear()
    mockShpListStartAPI.mockClear()
    mockShpListInfoAPI.mockClear()
    mockShpInfoAPI.mockClear()
    mockedUserSettingsApi.mockClear()
    await waitFor(
      () => {
        store.dispatch(closeAllDialogsAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    jest.useRealTimers()
    mockConsoleError.mockClear()
  })

  test('should deselect everything on the map when import starts', async () => {
    await waitFor(
      () => {
        store.dispatch(currentPolygonAction(1))
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    const stateBefore = await store.getState()
    const currentPolygonBefore = await selectCurrentPolygonId(stateBefore)
    expect(currentPolygonBefore).toBe(1)
    await waitFor(
      () => {
        store.dispatch(
          importShpStartActions.request({
            shpFile: 'file.kml',
          })
        )
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    const stateAfter = await store.getState()
    const currentPolygonAfter = await selectCurrentPolygonId(stateAfter)
    expect(currentPolygonAfter).toBe(-1)
  })

  test('should call the shp list API when clicking the import SHP button', async () => {
    const importButton = component.getByText(
      t('planning.tools.upload_file', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent(
          importButton,
          new MouseEvent('click', {
            // because of custom implementation in BigTool.tsx
            bubbles: true,
            detail: 1,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockShpListStartAPI).toHaveBeenCalled()
  })

  test('It should keep polling until the acton is done', async () => {
    const importButton = component.getByText(
      t('planning.tools.upload_file', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent(
          importButton,
          new MouseEvent('click', {
            // because of custom implementation in BigTool.tsx
            bubbles: true,
            detail: 1,
          })
        )
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    expect(mockShpListStartAPI).toHaveBeenCalled()
    expect(mockShpListInfoAPI).toHaveBeenCalled()
  })

  test('It should add the new polygon to the plan', async () => {
    await waitFor(
      () => {
        store.dispatch(importShpInfoActions.request())
      },
      { timeout: 4000 }
    )
    jest.advanceTimersByTime(4000)
    const stateAfter = await store.getState()
    const polygonsAfter = await selectPolygons(stateAfter)
    expect(polygonsAfter.length).toBe(mockPlan.polygons.length + 1)
  })

  test('It should remove the polygon when removing the last path inside it', async () => {
    // add a polygon with one path only
    await waitFor(
      () => {
        const sourcePolygon: Polygon = last(mockPlan.polygons)!
        const sourcePaths: Path[] = sourcePolygon.paths
        const newPaths: any = [last(sourcePaths)]
        const newPolygon: Polygon = mergeDeepRight(sourcePolygon, {
          id: 135,
          name: 'Added',
          paths: newPaths,
        })
        store.dispatch(addPolygonAction(newPolygon))
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    const stateAfterAdd = await store.getState()
    const polygonsAfterAdd = await selectPolygons(stateAfterAdd)
    expect(polygonsAfterAdd.length).toBe(mockPlan.polygons.length + 1)
    // remove the paths
    await waitFor(
      () => {
        const poly: Polygon = last(polygonsAfterAdd)!
        const pth: Path = last(poly.paths)!
        store.dispatch(
          deleteInternalPathAction({
            polygonId: poly.temp_id!,
            pathId: pth.id!,
          })
        )
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    const stateAfterDelete = await store.getState()
    const polygonsAfterDelete = await selectPolygons(stateAfterDelete)
    expect(polygonsAfterDelete.length).toBe(mockPlan.polygons.length)
  })

  test('It should not remove the polygon when removing the one of the path inside it', async () => {
    // add a polygon with one path only
    const sourcePolygon: Polygon = last(mockPlan.polygons)!
    const newPolygon: Polygon = mergeDeepRight(sourcePolygon, {
      id: 135,
      name: 'Added',
    })
    await waitFor(
      () => {
        store.dispatch(addPolygonAction(newPolygon))
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    const stateAfterAdd = await store.getState()
    const polygonsAfterAdd = await selectPolygons(stateAfterAdd)
    expect(polygonsAfterAdd.length).toBe(mockPlan.polygons.length + 1)
    // remove the paths
    await waitFor(
      () => {
        const poly: Polygon = last(polygonsAfterAdd)!
        const pth: Path = last(poly.paths)!
        store.dispatch(
          deleteInternalPathAction({
            polygonId: poly.temp_id!,
            pathId: pth.id!,
          })
        )
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    const stateAfterDelete = await store.getState()
    const polygonsAfterDelete = await selectPolygons(stateAfterDelete)
    expect(polygonsAfterDelete.length).toBe(mockPlan.polygons.length + 1)
    const addedPolygon = last(polygonsAfterDelete)
    expect(addedPolygon?.paths.length).toBe(newPolygon.paths.length - 1)
  })

  test('It should set the imported shp polygons settings same as the job settings', async () => {
    await waitFor(
      () => {
        store.dispatch(importShpInfoActions.request())
      },
      { timeout: 4000 }
    )
    jest.advanceTimersByTime(4000)
    //
    const stateAfter = await store.getState()
    const polygonsAfter = await selectPolygons(stateAfter)
    const addedPolygon = last(polygonsAfter)
    const addedPolygonSettings = addedPolygon?.paths[0].settings
    expect(addedPolygonSettings!.scanner!.scanlineSpacing).toBe(
      currentJob.scanner.scanlinespacing
    )
    expect(addedPolygonSettings!.scanner!.range).toBe(currentJob.scanner.range)
    expect(addedPolygonSettings!.camera.enable).toBe(currentJob.camera.enable)
    expect(addedPolygonSettings!.camera.distance).toBe(
      currentJob.camera.distance
    )
    expect(addedPolygonSettings!.drivingSpeed).toBe(currentJob.drivingspeed)
  })

  test('It should set the polygon internal tracks colors as shades of the polygon colors', async () => {
    await waitFor(
      () => {
        store.dispatch(
          importShpInfoActions.success({
            action: {
              status: 'done',
              progress: 100,
              description: '',
            },
            result: {
              polygons: [
                {
                  ...mockPlan.polygons[1],
                  id: 789,
                },
              ],
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    const stateAfter = await store.getState()
    const polygonsAfter = await selectPolygons(stateAfter)
    const addedPolygon = last(polygonsAfter)
    const internal = polygonPaths(addedPolygon)
    const allowed = availableColors.filter((c) => c !== addedPolygon?.color)
    internal?.forEach((i) => {
      expect(allowed).not.toContain(i.color)
    })
  })

  // TODO: works alone, but fails with concurrent tests
  //   test('It should not call info API if start is successful', async () => {
  //     mockShpListStartAPI.mockClear()
  //     mockShpListInfoAPI.mockClear()
  //     mockShpListStartAPI = mkListShpStart({
  //       action: {
  //         status: 'done',
  //         progress: 100,
  //         description: '',
  //       },
  //       result: {
  //         shpList: [],
  //       },
  //     })
  //     const importButton = component.getByText(
  //       t('planning.tools.upload_file', 'wrong') as string
  //     )
  //     await waitFor(
  //       () => {
  //         fireEvent(
  //           importButton,
  //           new MouseEvent('click', {
  //             // because of custom implementation in BigTool.tsx
  //             bubbles: true,
  //             detail: 1,
  //           })
  //         )
  //       },
  //       { timeout: 2000 }
  //     )
  //     jest.advanceTimersByTime(2000)
  //     expect(mockShpListStartAPI).toHaveBeenCalledTimes(1)
  //     expect(mockShpListInfoAPI).not.toHaveBeenCalled()
  //   })
})

describe('PlanningView (real store) pending', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  let component: RenderResult<typeof queries>
  let mockConsoleError: jest.SpyInstance<any>
  let mockGetPlanAPI: jest.SpyInstance<any>
  let mockShpStartAPI: jest.SpyInstance<any>
  let mockShpInfoAPI: jest.SpyInstance<any>
  let mockedUserSettingsApi: jest.SpyInstance<any>
  let store: Store

  beforeEach(async () => {
    store = getTestingStore()
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        store.dispatch(dataStorageProjectDetailActions.success(currentProject))
        store.dispatch(dataStorageJobDetailActions.success({ job: currentJob }))
        store.dispatch(getPlannedJobActions.success({ plan: mockPlan }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // mock API
    moxios.install(apiClient)
    // moxios.install(mockApiClientPlanning)
    mockedUserSettingsApi = mkSaveSettings()
    mockGetPlanAPI = mkGetPlan()
    // prevent api to actually call the backend
    mockShpStartAPI = mkImportShpStart()
    mockShpInfoAPI = mkImportShpInfo({
      action: {
        progress: 0,
        description: '',
        status: 'progress',
      },
    })
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
    moxios.uninstall(apiClient)
    mockGetPlanAPI.mockClear()
    mockShpStartAPI.mockClear()
    mockShpInfoAPI.mockClear()
    mockedUserSettingsApi.mockClear()
    await waitFor(
      () => {
        store.dispatch(closeAllDialogsAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    jest.useRealTimers()
    mockConsoleError.mockClear()
  })

  test('should lock the screen during import', async () => {
    await waitFor(
      () => {
        store.dispatch(
          importShpStartActions.request({
            shpFile: 'file.kml',
          })
        )
      },
      { timeout: 4000 }
    )
    jest.advanceTimersByTime(4000)
    const progressMessage = t('planning.user_tips.busy', 'wrong')
    const alert = screen.getByText(progressMessage)
    expect(alert).toBeTruthy()
  })
})

describe('PlanningView (real store) failing', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  let component: RenderResult<typeof queries>
  let mockConsoleError: jest.SpyInstance<any>
  let mockGetPlanAPI: jest.SpyInstance<any>
  let mockShpStartAPI: jest.SpyInstance<any>
  let mockShpInfoAPI: jest.SpyInstance<any>
  let mockedUserSettingsApi: jest.SpyInstance<any>
  let store: Store

  beforeEach(async () => {
    store = getTestingStore()
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        store.dispatch(dataStorageProjectDetailActions.success(currentProject))
        store.dispatch(dataStorageJobDetailActions.success({ job: currentJob }))
        store.dispatch(getPlannedJobActions.success({ plan: mockPlan }))
        store.dispatch(getUserInfoActions.success(loggedUser))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // mock API
    moxios.install(apiClient)
    // moxios.install(mockApiClientPlanning)
    mockedUserSettingsApi = mkSaveSettings()
    mockGetPlanAPI = mkGetPlan()
    // prevent api to actually call the backend
    mockShpStartAPI = mkImportShpStart()
    mockShpInfoAPI = mkImportShpInfo({
      action: {
        status: 'error',
        progress: 0,
        description: 'error during shp import',
        errors: [
          {
            code: 'PLN-002',
            description: 'Error',
          },
        ],
      },
      result: mockStore.planningService.needed!,
    })
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
    moxios.uninstall(apiClient)
    mockGetPlanAPI.mockClear()
    mockShpStartAPI.mockClear()
    mockShpInfoAPI.mockClear()
    mockedUserSettingsApi.mockClear()
    await waitFor(
      () => {
        store.dispatch(closeAllDialogsAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    jest.useRealTimers()
    mockConsoleError.mockClear()
  })

  test('should display translated errors on shp info', async () => {
    // open the dialog
    const importButton = component.getByText(
      t('planning.tools.upload_file', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent(
          importButton,
          new MouseEvent('click', {
            // because of custom implementation in BigTool.tsx
            bubbles: true,
            detail: 1,
          })
        )
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(1000)
    // call failing api
    await waitFor(
      () => {
        store.dispatch(importShpInfoActions.request())
      },
      { timeout: 4000 }
    )
    jest.advanceTimersByTime(4000)
    const translatedError = `${t('planning.errors.shp_failed', 'wrong')}: ${t(
      'backend_errors.code.PLN-002',
      'wrong'
    )}`
    const alert = screen.getByText(translatedError)
    expect(alert).toBeTruthy()
  })

  test('should display translated errors on shp start', async () => {
    // mock the api
    mockShpStartAPI.mockClear()
    mockShpStartAPI = mkImportShpStart({
      action: {
        status: 'error',
        progress: 0,
        description: 'error during shp import',
        errors: [
          {
            code: 'PLN-002',
            description: 'Error',
          },
        ],
      },
      result: mockStore.planningService.needed!,
    })
    // open the dialog
    const importButton = component.getByText(
      t('planning.tools.upload_file', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent(
          importButton,
          new MouseEvent('click', {
            // because of custom implementation in BigTool.tsx
            bubbles: true,
            detail: 1,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // call the failing api
    await waitFor(
      () => {
        store.dispatch(
          importShpStartActions.request({
            shpFile: 'file.kml',
          })
        )
      },
      { timeout: 4000 }
    )
    jest.advanceTimersByTime(4000)
    const translatedError = `${t('planning.errors.shp_failed', 'wrong')}: ${t(
      'backend_errors.code.PLN-002',
      'wrong'
    )}`
    const alert = screen.getByText(translatedError)
    expect(alert).toBeTruthy()
  })
})
