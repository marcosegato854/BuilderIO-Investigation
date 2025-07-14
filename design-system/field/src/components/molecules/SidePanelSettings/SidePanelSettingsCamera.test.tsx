/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { SidePanelSettingsCamera } from 'components/molecules/SidePanelSettings/SidePanelSettingsCamera'
import moxios from 'moxios'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import { cameraTriggerActions } from 'store/features/camera/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { PathSettings } from 'store/features/planning/types'
import {
  confirmAbortAutocaptureAction,
  autocaptureCurrentPathActions,
} from 'store/features/routing/slice'
import { mkSaveSettings } from 'store/features/settings/mockApi'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import mockApiClient from 'store/services/mockApiClientPlanning'
import { withNewSettings } from 'utils/planning/polygonHelpers'
import { renderWithProvider } from 'utils/test'

// TODO: PLANNING - test with current polygon in another file
describe('SidePanelSettingsCamera NO CURRENT POLYGON (mockStore)', () => {
  let component: RenderResult<typeof queries>

  const mockedStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      cameraService: {
        trigger: {
          type: 'Distance',
        },
      },
      routingService: {
        autocaptureCurrentPolygon: null,
      },
    })
  )
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  beforeEach(() => {
    moxios.install(mockApiClient)
    moxios.install(apiClient)
    moxios.stubRequest('/routing/abort', {
      status: 200,
      response: {},
    })
    component = renderWithProvider(<SidePanelSettingsCamera />)(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    moxios.uninstall(mockApiClient)
    moxios.uninstall(apiClient)
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display image distance slider', async () => {
    const distanceField = component.getByTestId('cameraDistanceField')
    expect(distanceField).toBeTruthy()
  })

  /* TODO - DISABLE BUTTON AS SOON AS ROUTING IS AVAILABLE PEF-2938 */
  /* test('should dispatch an abort action on navigation deactivated', async () => {
    const navigationSection = component.getByTestId('navigation')
    const toggle = within(navigationSection).getByTestId('mui-switch')
    await waitFor(
      () => {
        fireEvent.click(toggle.querySelectorAll('input')[0])
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(confirmAbortAutocaptureAction({}))
  }) */
})

describe('SidePanelSettingsCamera NO CURRENT POLYGON (mockStore time trigger camera)', () => {
  let component: RenderResult<typeof queries>

  const mockedStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      cameraService: {
        trigger: {
          type: 2,
        },
      },
      routingService: {
        autocaptureCurrentPolygon: null,
      },
    })
  )
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  beforeEach(() => {
    moxios.install(mockApiClient)
    moxios.install(apiClient)
    moxios.stubRequest('/routing/abort', {
      status: 200,
      response: {},
    })
    component = renderWithProvider(<SidePanelSettingsCamera />)(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    moxios.uninstall(mockApiClient)
    moxios.uninstall(apiClient)
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should NOT display image distance slider', async () => {
    const distanceField = component.queryByTestId('cameraDistanceField')
    expect(distanceField).not.toBeInTheDocument()
  })
})

describe('SidePanelSettingsCamera NO CURRENT POLYGON (mockStore camera off)', () => {
  let component: RenderResult<typeof queries>

  const mockedStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      cameraService: {
        trigger: {
          type: 0,
        },
      },
      routingService: {
        autocaptureCurrentPolygon: null,
      },
    })
  )
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch

  beforeEach(() => {
    moxios.install(mockApiClient)
    moxios.install(apiClient)
    moxios.stubRequest('/routing/abort', {
      status: 200,
      response: {},
    })
    component = renderWithProvider(<SidePanelSettingsCamera />)(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    moxios.uninstall(mockApiClient)
    moxios.uninstall(apiClient)
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should NOT display image distance slider', async () => {
    const distanceField = component.queryByTestId('cameraDistanceField')
    expect(distanceField).not.toBeInTheDocument()
  })
})

describe('SidePanelSettingsCamera (realStore)', () => {
  let component: RenderResult<typeof queries>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockedSaveSettingsApi: jest.SpyInstance<any>

  beforeEach(() => {
    mockedSaveSettingsApi = mkSaveSettings()
    component = renderWithProvider(<SidePanelSettingsCamera />)(store)
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(() => {
    store.dispatch(resetStoreAction())
    mockedSaveSettingsApi.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It reflects the currentTrack settings', async () => {
    expect(component.getByTestId('cameraDistanceField')).toBeTruthy()
    await waitFor(
      () => {
        const newSettings: PathSettings = {
          camera: { enable: 0, distance: 1, elapse: 250 },
          scanner: {
            range: 150,
            scanlineSpacing: 3,
          },
          collection: { multiple: false },
        }
        const newTrack = withNewSettings(
          mockStore.routingService.autocaptureCurrentPolygon!,
          newSettings
        )
        store.dispatch(
          autocaptureCurrentPathActions.success({
            polygons: [newTrack],
          })
        )
        store.dispatch(
          cameraTriggerActions.success({
            type: 'None',
            space: 2,
            time: 1000,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.queryByTestId('cameraDistanceField')).not.toBeInTheDocument()
  })
})
