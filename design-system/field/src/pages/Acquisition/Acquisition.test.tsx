/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  queries,
  RenderResult,
  waitFor,
  fireEvent,
} from '@testing-library/react'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import { Acquisition, IAcquisitionProps } from 'pages/Acquisition/Acquisition'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { actionsServiceActivationStartActions } from 'store/features/actions/slice'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { mkAddFolder } from 'store/features/pointcloud/mockApi'
import { mkAutocapturePolygons } from 'store/features/routing/mockApi'
import {
  notificationsSubscribeAction,
  systemStateActions,
} from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { renderWithProvider } from 'utils/test'
import { mkActivationAbort } from 'store/features/actions/mockApi'

const mockedStore: any = configureMockStore()(mockStore)

/**
 * the component uses the router, so we need to mock it
 */
const routeComponentPropsMock = {
  history: {
    location: {
      pathname: '/HomePage',
      key: 'default',
    },
  },
  location: {},
  match: {},
}

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('Acquisition (Store)', () => {
  // let ws: WS
  let component: RenderResult<typeof queries>
  let mockAbortActivationAPI: jest.SpyInstance<any>
  let mockAddFolderAPI: jest.SpyInstance<any>
  let mockedPolygonsApi: jest.SpyInstance<any>

  const store = getTestingStore()

  beforeEach(async () => {
    store.dispatch(notificationsSubscribeAction())
    // mock API
    moxios.install(apiClient)
    moxios.stubRequest('/system/state', {
      status: 200,
      response: {
        state: 'Deactivated',
      },
    })
    moxios.stubRequest('/datastorage/state', {
      status: 200,
      response: {
        project: 'project45',
        job: 'JobToTest',
        scan: 'Scan',
      },
    })
    mockAbortActivationAPI = mkActivationAbort()
    mockedPolygonsApi = mkAutocapturePolygons()
    mockAddFolderAPI = mkAddFolder()
    component = renderWithProvider(
      <Acquisition {...(routeComponentPropsMock as IAcquisitionProps)} />
    )(store)
    // enable fake timers
    jest.useFakeTimers()
    // fill the store
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
  })

  afterEach(() => {
    mockDispatch.mockClear()
    WS.clean()
    mockAbortActivationAPI.mockClear()
    mockAddFolderAPI.mockClear()
    mockedPolygonsApi.mockClear()
    moxios.uninstall(apiClient)
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should reset the store at every test', async () => {
    const state = await store.getState()
    expect(state.rtkService.interfaceModes.length).toBe(0)
  })

  test('Should complete activation after polling the activate action', async () => {
    moxios.stubRequest('/system/actionactivate', {
      status: 200,
      response: {
        action: {
          status: 'done',
          progress: 100,
          description: 'Activation done',
        },
      },
    })
    await waitFor(
      () => {
        store.dispatch(actionsServiceActivationStartActions.request())
        store.dispatch(systemStateActions.success({ state: 'Activating' }))
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    expect(state.actionsService.activationProgress).toBe(100)
  })

  test('Should display an abort button during activation', async () => {
    moxios.stubRequest('/system/actionactivate', {
      status: 200,
      response: {
        action: {
          status: 'progress',
          progress: 50,
          description: 'Activation in progress',
        },
      },
    })
    await waitFor(
      () => {
        store.dispatch(actionsServiceActivationStartActions.request())
        store.dispatch(systemStateActions.success({ state: 'Activating' }))
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(500)
    const abortButton = component.getByTestId('abort-activation-button')
    expect(abortButton).toBeTruthy()
  })

  test('Should call the abort API on click', async () => {
    moxios.stubRequest('/system/actionactivate', {
      status: 200,
      response: {
        action: {
          status: 'progress',
          progress: 50,
          description: 'Activation in progress',
        },
      },
    })
    await waitFor(
      () => {
        store.dispatch(actionsServiceActivationStartActions.request())
        store.dispatch(systemStateActions.success({ state: 'Activating' }))
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(500)
    const abortButton = component.getByTestId('abort-activation-button')
    await waitFor(
      () => {
        fireEvent.click(abortButton)
      },
      { timeout: 1000 }
    )
    jest.advanceTimersByTime(500)
    expect(mockAbortActivationAPI).toHaveBeenCalled()
  })
})

describe('Acquisition (mockStore)', () => {
  let component: RenderResult<typeof queries>
  const store = getTestingStore()

  beforeEach(() => {
    store.dispatch(notificationsSubscribeAction())
    //
    moxios.install(apiClient)
    moxios.stubRequest('/system/state', {
      status: 200,
      response: {
        state: 'Deactivated',
      },
    })
    moxios.stubRequest('/datastorage/state', {
      status: 200,
      response: {
        project: 'project45',
        job: 'JobToTest',
        scan: 'Scan',
      },
    })
    component = renderWithProvider(
      <Acquisition {...(routeComponentPropsMock as IAcquisitionProps)} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
    WS.clean()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
