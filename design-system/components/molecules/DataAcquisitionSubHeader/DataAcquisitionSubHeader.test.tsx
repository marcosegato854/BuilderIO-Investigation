/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { DataAcquisitionSubHeader } from 'components/molecules/DataAcquisitionSubHeader/DataAcquisitionSubHeader'
import moxios from 'moxios'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { mkCameraSnapshot } from 'store/features/camera/mockApi'
import { cameraTriggerDistanceSetActions } from 'store/features/camera/slice'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { mkAutocapturePolygons } from 'store/features/routing/mockApi'
import { systemStateActions } from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { renderWithProvider } from 'utils/test'

describe('DataAcquisitionSubHeader - Camera - (real store)', () => {
  let component: RenderResult<typeof queries>
  const store = getTestingStore()
  let mockSnapshotAPI: jest.SpyInstance<any>
  let mockedPolygonsApi: jest.SpyInstance<any>

  beforeEach(async () => {
    mockedPolygonsApi = mkAutocapturePolygons()
    moxios.install(apiClient)
    moxios.stubRequest('/routing/currentpath', {
      status: 200,
      response: { polygons: [] },
    })
    moxios.stubRequest('/routing/autocapture/polygons', {
      status: 200,
      response: { polygons: [] },
    })
    mockSnapshotAPI = mkCameraSnapshot()
    jest.useFakeTimers()
    await waitFor(
      () => {
        // fill project
        store.dispatch(
          dataStorageProjectDetailActions.success({
            disk: 'p',
            jobs: 0,
            name: 'test',
            completed: 0,
          })
        )
        // fill current job
        store.dispatch(
          dataStorageJobDetailActions.success({
            job: mockStore.dataStorageService.currentJob!,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    component = renderWithProvider(<DataAcquisitionSubHeader mode="camera" />)(
      store
    )
  })

  afterEach(() => {
    moxios.uninstall(apiClient)
    mockSnapshotAPI.mockClear()
    mockedPolygonsApi.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display the camera snapshot button during recording', async () => {
    await waitFor(
      () => {
        store.dispatch(systemStateActions.success({ state: 'Recording' }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByTestId('snapshot-button')).toBeTruthy()
  })

  test('It should call an API on click', async () => {
    await waitFor(
      () => {
        store.dispatch(systemStateActions.success({ state: 'Recording' }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const snapshotButton = component.getByTestId('snapshot-button')
    await waitFor(
      () => {
        fireEvent.click(snapshotButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockSnapshotAPI).toHaveBeenCalled()
  })

  test('It should NOT display the camera snapshot button when not recording', async () => {
    await waitFor(
      () => {
        store.dispatch(systemStateActions.success({ state: 'Activated' }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.queryByTestId('snapshot-button')).not.toBeInTheDocument()
  })

  test('It should NOT display the camera snapshot button when camera is off', async () => {
    await waitFor(
      () => {
        store.dispatch(systemStateActions.success({ state: 'Recording' }))
        store.dispatch(
          cameraTriggerDistanceSetActions.success({
            type: 'None',
            space: 2,
            time: 0,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.queryByTestId('snapshot-button')).not.toBeInTheDocument()
  })
})

describe('DataAcquisitionSubHeader - Map - (real store)', () => {
  let component: RenderResult<typeof queries>
  const store = getTestingStore()

  beforeEach(() => {
    component = renderWithProvider(<DataAcquisitionSubHeader mode="map" />)(
      store
    )
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
