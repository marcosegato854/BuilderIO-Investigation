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
import { t } from 'i18n/config'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import { Acquisition, IAcquisitionProps } from 'pages/Acquisition/Acquisition'
import React from 'react'
import { Store } from 'redux'
import configureMockStore from 'redux-mock-store'
import { store as realStore } from 'store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  actionsServiceAcquisitionReady,
  actionsServiceActivationInfoActions,
} from 'store/features/actions/slice'
import { alignmentMessageAction } from 'store/features/alignment/slice'
import { AlignmentPhase } from 'store/features/alignment/types'
import {
  mkCameraExposure,
  mkCameraTrigger,
} from 'store/features/camera/mockApi'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { closeAllDialogsAction } from 'store/features/dialogs/slice'
import { resetStoreAction } from 'store/features/global/slice'
import {
  mkAutocaptureNeeded,
  mkAutocapturePolygons,
  mkRoutingPolyline,
  mkRoutingStatus,
} from 'store/features/routing/mockApi'
import {
  confirmAbortAutocaptureAction,
  autocaptureAbortActions,
  routingMessageAction,
  routingStatusActions,
  routingSubscribeAction,
  routingUnsubscribeAction,
  autocaptureStatusActions,
} from 'store/features/routing/slice'
import { RoutingSocketNotification } from 'store/features/routing/types'
import {
  modulesActions,
  notificationsSubscribeAction,
  notificationsUnsubscribeAction,
  systemStateActions,
} from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import apiClientNode from 'store/services/apiClientNode'
import mockApiClient from 'store/services/mockApiClientPlanning'
import { getSocketUrl } from 'store/services/socketClientBackend'
import { renderWithProvider } from 'utils/test'

const mockedStore = configureMockStore()({
  ...mockStore,
  alignmentService: {
    ...mockStore.alignmentService,
    alignmentState: {
      ...mockStore.alignmentService.alignmentState,
      alignmentPhase: AlignmentPhase.INITIAL_DONE,
    },
  },
})

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

beforeAll(() => {
  jest.spyOn(global, 'XMLHttpRequest').mockImplementation(
    () =>
      ({
        open: jest.fn(),
        send: jest.fn(),
        setRequestHeader: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        abort: jest.fn(),
        getResponseHeader: jest.fn(),
        getAllResponseHeaders: jest.fn(),
        overrideMimeType: jest.fn(),
        readyState: 4,
        status: 200,
        responseText: '{}',
        response: {},
        onreadystatechange: jest.fn(),
        responseType: '',
        responseURL: '',
        responseXML: null,
      } as unknown as XMLHttpRequest)
  )
})

describe('Acquisition routing (Store)', () => {
  let wsNotification: WS
  let wsRouting: WS
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let store: Store
  let mockedRoutingTracks: jest.SpyInstance<any>
  let mockedRoutingStatus: jest.SpyInstance<any>
  let mockedRoutingNeeded: jest.SpyInstance<any>
  let mockedRoutingPolyline: jest.SpyInstance<any>
  let mockedCameraTrigger: jest.SpyInstance<any>
  let mockedCameraExposure: jest.SpyInstance<any>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  let mockDispatchTestingStore: jest.SpyInstance<any, [action: any]>

  beforeEach(async () => {
    store = getTestingStore()
    mockDispatchRealStore = jest.spyOn(realStore, 'dispatch')
    mockDispatchTestingStore = jest.spyOn(store, 'dispatch')
    // mock API
    mockedRoutingTracks = mkAutocapturePolygons()
    mockedRoutingStatus = mkRoutingStatus()
    mockedRoutingNeeded = mkAutocaptureNeeded()
    mockedRoutingPolyline = mkRoutingPolyline()
    mockedCameraTrigger = mkCameraTrigger()
    mockedCameraExposure = mkCameraExposure()
    moxios.install(apiClientNode)
    moxios.install(mockApiClient)
    moxios.stubRequest(
      `/addFolder/${mockStore.dataStorageService.currentProject?.name}/${mockStore.dataStorageService.currentJob?.name}`,
      {
        status: 200,
        response: {},
      }
    )
    moxios.stubRequest('/routing/abort', {
      status: 200,
      response: {},
    })
    moxios.install(apiClient)
    wsNotification = new WS(`${getSocketUrl()}/notification`)
    wsRouting = new WS(`${getSocketUrl()}/routing`)
    // wsRouting = new WS(`${getMockSocketUrl()}`)
    store.dispatch(notificationsSubscribeAction())
    store.dispatch(routingSubscribeAction())
    // render
    component = renderWithProvider(
      <div>
        <DialogManager />
        <ErrorManager />
        <Acquisition {...(routeComponentPropsMock as IAcquisitionProps)} />
      </div>
    )(store)
    // wait for ws connection
    await wsNotification.connected
    // enable fake timers
    jest.useFakeTimers()
    // fill the store
    await waitFor(
      () => {
        store.dispatch(
          modulesActions.success({ modules: mockStore.system.modules })
        )
        // fill current project
        store.dispatch(
          dataStorageProjectDetailActions.success(
            mockStore.dataStorageService.currentProject!
          )
        )
        // fill current job
        store.dispatch(
          dataStorageJobDetailActions.success({
            job: mockStore.dataStorageService.currentJob!,
          })
        )
        // set activation status
        store.dispatch(
          systemStateActions.success({
            state: 'Activated',
          })
        )
        store.dispatch(
          actionsServiceActivationInfoActions.success({
            action: {
              status: 'done',
              progress: 100,
              description: '',
            },
          })
        )
        // set acquisition ready
        store.dispatch(actionsServiceAcquisitionReady(true))
        // set routing state
        store.dispatch(
          routingMessageAction({
            type: 'direction',
            data: mockStore.routingService.routingState!,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(notificationsUnsubscribeAction())
        store.dispatch(routingUnsubscribeAction())
        store.dispatch(resetStoreAction())
        store.dispatch(closeAllDialogsAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    WS.clean()
    mockDispatchRealStore.mockClear()
    mockDispatchTestingStore.mockClear()
    mockedRoutingTracks.mockClear()
    mockedRoutingStatus.mockClear()
    mockedRoutingNeeded.mockClear()
    mockedRoutingPolyline.mockClear()
    mockedCameraTrigger.mockClear()
    mockedCameraExposure.mockClear()
    moxios.uninstall(apiClient)
    moxios.uninstall(mockApiClient)
    moxios.uninstall(apiClientNode)
    jest.useRealTimers()
  })

  test('should display routing toast', async () => {
    await waitFor(
      () => {
        // set alignment status
        store.dispatch(
          alignmentMessageAction({
            ...mockStore.alignmentService.alignmentState!,
            alignmentPhase: AlignmentPhase.INITIAL_DONE,
          })
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
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.getByTestId('routing-toast')).toBeTruthy()
  })

  test('should subscribe to routing socket at mount', async () => {
    expect(mockDispatchTestingStore).toHaveBeenCalledWith(
      routingSubscribeAction()
    )
  })

  test('should unsubscribe from routing socket at unmount', async () => {
    component.unmount()
    expect(mockDispatchTestingStore).toHaveBeenCalledWith(
      routingUnsubscribeAction()
    )
  })

  test('should open a dialog to confirm autocapture abort', async () => {
    await waitFor(
      () => {
        store.dispatch(confirmAbortAutocaptureAction({}))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByText(
        t('acquisition.routing.dialogs.abort.title', 'wrong') as string
      )
    ).toBeTruthy()
    expect(
      screen.queryByText(
        t('acquisition.routing.dialogs.abort.back', 'wrong') as string
      )
    ).toBeTruthy()
    expect(
      screen.queryByText(
        t('acquisition.routing.dialogs.abort.confirm', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('should abort autocapture on confirm', async () => {
    await waitFor(
      () => {
        store.dispatch(confirmAbortAutocaptureAction({}))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const okButton = screen.getByTestId('alert-ok-button')
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      autocaptureAbortActions.request()
    )
  })

  test('should update the store when receiving a message from the socket', async () => {
    // initial
    const notificationInitial: RoutingSocketNotification = {
      type: 'direction',
      data: {
        ...mockStore.routingService.routingState!,
      },
    }
    const state = await store.getState()
    expect(state.routingService.routingState?.instruction).toBe(
      mockStore.routingService.routingState!.instruction
    )
    const newInstruction = 'modified instruction'
    await waitFor(
      () => {
        wsRouting.send(
          JSON.stringify({
            ...notificationInitial,
            data: {
              ...notificationInitial.data,
              instruction: newInstruction,
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    expect(stateAfter.routingService.routingState?.instruction).toBe(
      newInstruction
    )
  })
})
