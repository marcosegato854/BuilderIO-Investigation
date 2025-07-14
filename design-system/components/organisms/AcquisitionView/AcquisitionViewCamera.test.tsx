import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { AcquisitionView } from 'components/organisms/AcquisitionView/AcquisitionView'
import moxios from 'moxios'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import { dataStorageProjectDetailActions } from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { viewModeAction } from 'store/features/position/slice'
import { cameraTriggerActions } from 'store/features/camera/slice'
import { ViewMode } from 'store/features/position/types'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { renderWithProvider } from 'utils/test'
import { mergeDeepRight } from 'ramda'

describe('AcquisitionView (CAMERA) (realStore)', () => {
  let component: RenderResult<typeof queries>
  const mockDispatch = jest.spyOn(store, 'dispatch')

  beforeEach(async () => {
    /** mock API */
    moxios.install(apiClient)
    moxios.stubRequest('/system/actionstartrecording', {
      status: 200,
      response: {
        action: {
          status: 'progress',
          progress: 50,
          description: 'starting recording',
        },
      },
    })
    moxios.stubRequest('/system/actionstoprecording', {
      status: 200,
      response: {
        action: {
          status: 'progress',
          progress: 50,
          description: 'starting recording',
        },
      },
    })
    moxios.stubRequest('/camera/trigger', {
      status: 200,
      response: {
        type: 'Distance',
        space: 1,
        time: 1,
      },
    })
    /** render */
    component = renderWithProvider(<AcquisitionView />)(store)
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
        //
        store.dispatch(viewModeAction(ViewMode.CAMERA))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    moxios.uninstall(apiClient)
    mockDispatch.mockClear()
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display the camera view', () => {
    expect(component.getByTestId('camera-view')).toBeInTheDocument()
  })

  test('should display the bottom controls', () => {
    expect(component.getByTestId('zooming')).toBeInTheDocument()
  })

  test('should not display map related bottom controls', () => {
    expect(screen.queryByTestId('satellite-view')).not.toBeInTheDocument()
    expect(screen.queryByTestId('tools')).not.toBeInTheDocument()
  })

  test('should zoom the image when clicking on zoom', async () => {
    const plusButton = component.getByTestId('zoom-in')
    const minusButton = component.getByTestId('zoom-out')
    // we need to wait for the dispatch to fire
    await waitFor(
      () => {
        fireEvent.mouseDown(plusButton)
      },
      { timeout: 100 }
    )
    jest.advanceTimersByTime(100)
    // fire mouseup otherwise it keeps zooming in
    fireEvent.mouseUp(plusButton)
    expect(mockDispatch).toBeCalledWith({
      payload: 1,
      type: 'positionService/CAMERA_VIEW_ZOOM',
    })
    // we need to wait for the dispatch to fire
    await waitFor(
      () => {
        fireEvent.mouseDown(minusButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // fire mouseup otherwise it keeps zooming out
    fireEvent.mouseUp(minusButton)
    expect(mockDispatch).toBeCalledWith({
      payload: 0,
      type: 'positionService/CAMERA_VIEW_ZOOM',
    })
  })

  // TODO: handle new camera enable format
  test('should show a camera disabled screen if trigger is set to none', async () => {
    await waitFor(
      () => {
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
    expect(component.getByTestId('camera-view-disabled')).toBeInTheDocument()
  })
})

describe('AcquisitionView (Camera disabled) (mockStore)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      cameraService: {
        trigger: {
          type: 'None',
        },
      },
      routingService: {
        autocaptureCurrentPolygon: undefined,
      },
    })
  )
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>

  beforeEach(async () => {
    /** render */
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
  })

  afterEach(() => {})

  test('It should show a camera disabled screen', () => {
    expect(component.getByTestId('camera-view-disabled')).toBeInTheDocument()
  })
})

describe('AcquisitionView (Camera enabled) (mockStore)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      cameraService: {
        trigger: {
          type: 'Distance',
        },
      },
      routingService: {
        autocaptureCurrentPolygon: undefined,
      },
    })
  )
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>

  beforeEach(async () => {
    /** render */
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
  })

  afterEach(() => {})

  test('It should NOT show a camera disabled screen', () => {
    expect(screen.queryByTestId('camera-view-disabled')).not.toBeInTheDocument()
  })
})
