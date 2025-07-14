/* eslint-disable @typescript-eslint/no-explicit-any */
import { queries, RenderResult, waitFor } from '@testing-library/react'
import { PlanningView } from 'components/organisms/PlanningView/PlanningView'
import moxios from 'moxios'
import React from 'react'
import { store } from 'store'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import {
  extractPolygonStartActions,
  selectPolygons,
  toolAction,
} from 'store/features/planning/slice'
import {
  ExtractPolygonStartRequest,
  Path,
  PlanningTools,
  Polygon,
} from 'store/features/planning/types'
import { mkGetSettings, mkSaveSettings } from 'store/features/settings/mockApi'
import { mockPolygonGeometry } from 'store/mock/mockPolygonGeometry'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { polygonPaths, settings } from 'utils/planning/polygonHelpers'
import { renderWithProvider } from 'utils/test'

const mockPolygon: Polygon = {
  ...mockStore.planningService.undoablePolygons.present[0]!,
  id: undefined,
}

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.spyOn(store, 'dispatch')

describe('PlanningView (realStore)', () => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let mockedUserSettingsApi: jest.SpyInstance<any>
  let mockedSaveUserSettingsApi: jest.SpyInstance<any>

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
    moxios.stubRequest('/planning/actionExtractPolygon', {
      status: 200,
      response: {
        action: {
          status: 'done',
          progress: 100,
          description: 'extraction done',
        },
        result: {
          polygons: [mockPolygonGeometry],
        },
      },
    })
    mockedUserSettingsApi = mkGetSettings()
    mockedSaveUserSettingsApi = mkSaveSettings()

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
          dataStorageJobDetailActions.success({
            job: {
              ...mockStore.dataStorageService.currentJob!,
              camera: {
                enable: false,
                distance: 5,
                blur: true,
              },
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    // moxios.uninstall(mockApiClientPlanning)
    moxios.uninstall(apiClient)
    mockDispatch.mockClear()
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
    mockedUserSettingsApi.mockClear()
    mockedSaveUserSettingsApi.mockClear()
  })

  test('should inherit polygon settings from the job', async () => {
    await waitFor(
      () => {
        store.dispatch(toolAction(PlanningTools.DRAW_PATH))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const polygons = await selectPolygons(state)
    expect(settings(polygons[0])).toStrictEqual(
      expect.objectContaining({
        camera: expect.objectContaining({
          enable: false,
          distance: 5,
        }),
      })
    )
  })

  test('should inherit internal path settings from the job', async () => {
    await waitFor(
      () => {
        store.dispatch(toolAction(PlanningTools.DRAW_POLYGON))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        const request: ExtractPolygonStartRequest = {
          coordinates: [],
          classes: [],
        }
        store.dispatch(extractPolygonStartActions.request(request))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const polygons = await selectPolygons(state)
    const path: Path = polygonPaths(polygons[0])![0]
    expect(settings(path)).toStrictEqual(
      expect.objectContaining({
        camera: expect.objectContaining({
          enable: false,
          distance: 5,
        }),
      })
    )
  })
})
