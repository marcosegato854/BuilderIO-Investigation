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
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  mkFinalAlignmentInfo,
  mkFinalAlignmentStart,
  mkInitialAlignmentInfo,
  mkInitialAlignmentStart,
} from 'store/features/actions/mockApi'
import {
  actionsServiceAcquisitionReady,
  actionsServiceActivationInfoActions,
} from 'store/features/actions/slice'
import {
  mkAlignmentCommand,
  mkAlignmentStatus,
} from 'store/features/alignment/mockApi'
import {
  alignmentMessageAction,
  alignmentUnsubscribeAction,
} from 'store/features/alignment/slice'
import {
  AlignmentNotification,
  AlignmentPhase,
} from 'store/features/alignment/types'
import {
  mkCameraExposure,
  mkCameraTrigger,
} from 'store/features/camera/mockApi'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { getPlannedJobActions } from 'store/features/planning/slice'
import { JobPlan } from 'store/features/planning/types'
import {
  mkAutocaptureNeeded,
  mkAutocapturePolygons,
  mkRoutingStatus,
} from 'store/features/routing/mockApi'
import {
  autocaptureStatusActions,
  routingStatusActions,
} from 'store/features/routing/slice'
import {
  modulesActions,
  notificationsSubscribeAction,
  notificationsUnsubscribeAction,
  systemStateActions,
} from 'store/features/system/slice'
import { ModuleID } from 'store/features/system/types'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import apiClientNode from 'store/services/apiClientNode'
import mockApiClient from 'store/services/mockApiClientPlanning'
import { getSocketUrl } from 'store/services/socketClientBackend'
import { renderWithProvider } from 'utils/test'

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

const mockedStore = configureMockStore()(mockStore)

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

const mockPlan: JobPlan = {
  polygons: mockStore.planningService.undoablePolygons.present!,
  initialAlignmentPoint: mockStore.planningService.initialAlignmentPoint!,
  finalAlignmentPoint: mockStore.planningService.finalAlignmentPoint!,
  needed: mockStore.planningService.needed!,
}

const notificationNone: AlignmentNotification = {
  ...mockStore.alignmentService.alignmentState!,
  alignmentPhase: AlignmentPhase.NONE,
}

const notificationInitial: AlignmentNotification = {
  ...mockStore.alignmentService.alignmentState!,
}

describe('Acquisition alignment (Store - planned Job)', () => {
  let wsNotification: WS
  let wsAlignment: WS
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let store: Store
  let mockInitialAlignmentStartAPI: jest.SpyInstance<any>
  let mockInitialAlignmentInfoAPI: jest.SpyInstance<any>
  let mockFinalAlignmentStartAPI: jest.SpyInstance<any>
  let mockFinalAlignmentInfoAPI: jest.SpyInstance<any>
  let mockedAlignmentAPI: jest.SpyInstance<any>
  let mockedAlignmentStatusApi: jest.SpyInstance<any>
  let mockedRoutingTracks: jest.SpyInstance<any>
  let mockedRoutingStatus: jest.SpyInstance<any>
  let mockedRoutingNeeded: jest.SpyInstance<any>
  let mockedCameraTrigger: jest.SpyInstance<any>
  let mockedCameraExposure: jest.SpyInstance<any>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>

  beforeEach(async () => {
    store = getTestingStore()
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    // mock API
    mockInitialAlignmentStartAPI = mkInitialAlignmentStart()
    mockInitialAlignmentInfoAPI = mkInitialAlignmentInfo()
    mockFinalAlignmentStartAPI = mkFinalAlignmentStart()
    mockFinalAlignmentInfoAPI = mkFinalAlignmentInfo()
    mockedAlignmentAPI = mkAlignmentCommand()
    mockedAlignmentStatusApi = mkAlignmentStatus()
    mockedRoutingTracks = mkAutocapturePolygons()
    mockedRoutingStatus = mkRoutingStatus({
      enabled: true,
      initial: true,
      final: false,
    })
    mockedRoutingNeeded = mkAutocaptureNeeded()
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
    moxios.install(apiClient)
    wsNotification = new WS(`${getSocketUrl()}/notification`)
    wsAlignment = new WS(`${getSocketUrl()}/position/alignment`)
    store.dispatch(notificationsSubscribeAction())
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
        // enable routing
        store.dispatch(modulesActions.success({ modules: [ModuleID.ROUTING] }))
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
            state: 'Logging',
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
        // set alignment state
        store.dispatch(
          alignmentMessageAction(mockStore.alignmentService.alignmentState!)
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
        store.dispatch(alignmentUnsubscribeAction())
        store.dispatch(resetStoreAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    WS.clean()
    mockDispatchRealStore.mockClear()
    mockInitialAlignmentStartAPI.mockClear()
    mockInitialAlignmentInfoAPI.mockClear()
    mockFinalAlignmentStartAPI.mockClear()
    mockFinalAlignmentInfoAPI.mockClear()
    mockedAlignmentAPI.mockClear()
    mockedAlignmentStatusApi.mockClear()
    mockedRoutingTracks.mockClear()
    mockedRoutingStatus.mockClear()
    mockedRoutingNeeded.mockClear()
    mockedCameraTrigger.mockClear()
    mockedCameraExposure.mockClear()
    moxios.uninstall(apiClient)
    moxios.uninstall(mockApiClient)
    moxios.uninstall(apiClientNode)
    jest.useRealTimers()
  })

  // test('should start initial alignment on user click if the initial point is in range', async () => {
  //   await waitFor(
  //     () => {
  //       wsAlignment.send(JSON.stringify(notificationNone))
  //       store.dispatch(
  //         routingStatusActions.success({
  //           initial: true,
  //           final: false,
  //           enabled: true,
  //         })
  //       )
  //       store.dispatch(
  //         autocaptureStatusActions.success({
  //           enabled: true,
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const startButton = component.getByText(
  //     t('acquisition.main_button.start_initial', 'wrong') as string
  //   )
  //   await waitFor(
  //     () => {
  //       fireEvent.click(startButton)
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   expect(mockInitialAlignmentStartAPI).toHaveBeenCalled()
  // })

  // test('should show a modal on user click if the initial point is out of range', async () => {
  //   await waitFor(
  //     () => {
  //       wsAlignment.send(JSON.stringify(notificationNone))
  //       store.dispatch(
  //         routingStatusActions.success({
  //           initial: false,
  //           final: false,
  //           enabled: true,
  //         })
  //       )
  //       store.dispatch(
  //         autocaptureStatusActions.success({
  //           enabled: true,
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const startButton = component.getByText(
  //     t('acquisition.main_button.start_initial', 'wrong') as string
  //   )
  //   await waitFor(
  //     () => {
  //       fireEvent.click(startButton)
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   expect(
  //     screen.queryByText(
  //       t('acquisition.alignment.out_of_range.title', 'wrong') as string
  //     )
  //   ).toBeTruthy()
  //   expect(
  //     screen.queryByText(
  //       t('acquisition.alignment.out_of_range.cancel', 'wrong') as string
  //     )
  //   ).toBeTruthy()
  //   expect(
  //     screen.queryByText(
  //       t('acquisition.alignment.out_of_range.proceed', 'wrong') as string
  //     )
  //   ).toBeTruthy()
  // })

  // test('should start initial alignment on user click on the modal proceed btn', async () => {
  //   await waitFor(
  //     () => {
  //       wsAlignment.send(JSON.stringify(notificationNone))
  //       store.dispatch(
  //         routingStatusActions.success({
  //           initial: false,
  //           final: false,
  //           enabled: true,
  //         })
  //       )
  //       store.dispatch(
  //         autocaptureStatusActions.success({
  //           enabled: true,
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const startButton = component.getByText(
  //     t('acquisition.main_button.start_initial', 'wrong') as string
  //   )
  //   await waitFor(
  //     () => {
  //       fireEvent.click(startButton)
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const proceedButton = component.getByText(
  //     t('acquisition.alignment.out_of_range.proceed', 'wrong') as string
  //   )
  //   await waitFor(
  //     () => {
  //       fireEvent.click(proceedButton)
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   expect(mockInitialAlignmentStartAPI).toHaveBeenCalled()
  // })

  test('should not start initial alignment on user click on the modal cancel btn', async () => {
    await waitFor(
      () => {
        wsAlignment.send(JSON.stringify(notificationNone))
        store.dispatch(
          routingStatusActions.success({
            initial: false,
            final: false,
            enabled: true,
          })
        )
        store.dispatch(
          autocaptureStatusActions.success({
            enabled: true,
          })
        )
        const startButton = component.getByText(
          t('acquisition.main_button.start_initial', 'wrong') as string
        )
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const cancelButton = component.getByText(
      t('acquisition.alignment.out_of_range.cancel', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(cancelButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockInitialAlignmentStartAPI).not.toHaveBeenCalled()
  })

  test('should start final alignment on user click if the final point is not defined', async () => {
    await waitFor(
      () => {
        wsAlignment.send(
          JSON.stringify({
            ...notificationInitial,
            alignmentPhase: AlignmentPhase.INITIAL_DONE,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByText(
      t('acquisition.main_button.start_final', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const okButton = component.getByText(
      t('acquisition.alignment.final_confirm.proceed', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockFinalAlignmentStartAPI).toHaveBeenCalled()
  })

  test('should start final alignment on user click if the final point is in range', async () => {
    await waitFor(
      () => {
        wsAlignment.send(
          JSON.stringify({
            ...notificationInitial,
            alignmentPhase: AlignmentPhase.INITIAL_DONE,
          })
        )
        store.dispatch(getPlannedJobActions.success({ plan: mockPlan }))
        store.dispatch(
          routingStatusActions.success({
            initial: false,
            final: true,
            enabled: true,
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
    const startButton = component.getByText(
      t('acquisition.main_button.start_final', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const okButton = component.getByText(
      t('acquisition.alignment.final_confirm.proceed', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockFinalAlignmentStartAPI).toHaveBeenCalled()
  })

  /* disabled, see https://hexagon.atlassian.net/browse/PEF-1255 */
  // test('should show a modal on user click if the final point is out of range', async () => {
  //   await waitFor(
  //     () => {
  //       wsAlignment.send(
  //         JSON.stringify({
  //           ...notificationInitial,
  //           alignmentPhase: AlignmentPhase.INITIAL_DONE,
  //         })
  //       )
  //       store.dispatch(getPlannedJobActions.success({ plan: mockPlan }))
  //       store.dispatch(
  // routingAlignmentActions.success({
  //   initial: false,
  //   // final: false
  // })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const startButton = component.getByText(
  //     t('acquisition.main_button.start_final', 'wrong') as string
  //   )
  //   await waitFor(
  //     () => {
  //       fireEvent.click(startButton)
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   expect(
  //     screen.queryByText(
  //       t('acquisition.alignment.out_of_range.title', 'wrong') as string
  //     )
  //   ).toBeTruthy()
  //   expect(
  //     screen.queryByText(
  //       t('acquisition.alignment.out_of_range.cancel', 'wrong') as string
  //     )
  //   ).toBeTruthy()
  //   expect(
  //     screen.queryByText(
  //       t('acquisition.alignment.out_of_range.proceed', 'wrong') as string
  //     )
  //   ).toBeTruthy()
  // })

  test('should show a modal on user click on final alignment', async () => {
    await waitFor(
      () => {
        wsAlignment.send(
          JSON.stringify({
            ...notificationInitial,
            alignmentPhase: AlignmentPhase.INITIAL_DONE,
          })
        )
        store.dispatch(getPlannedJobActions.success({ plan: mockPlan }))
        store.dispatch(
          routingStatusActions.success({
            initial: false,
            final: false,
            enabled: true,
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
    const startButton = component.getByText(
      t('acquisition.main_button.start_final', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByText(
        t('acquisition.alignment.final_confirm.text', 'wrong') as string
      )
    ).toBeTruthy()
    expect(
      screen.queryByText(
        t('acquisition.alignment.final_confirm.cancel', 'wrong') as string
      )
    ).toBeTruthy()
    expect(
      screen.queryByText(
        t('acquisition.alignment.final_confirm.proceed', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('should start final alignment on user click on the modal proceed btn', async () => {
    await waitFor(
      () => {
        wsAlignment.send(
          JSON.stringify({
            ...notificationInitial,
            alignmentPhase: AlignmentPhase.INITIAL_DONE,
          })
        )
        store.dispatch(getPlannedJobActions.success({ plan: mockPlan }))
        store.dispatch(
          routingStatusActions.success({
            initial: false,
            final: false,
            enabled: true,
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
    const startButton = component.getByText(
      t('acquisition.main_button.start_final', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const proceedButton = component.getByText(
      t('acquisition.alignment.out_of_range.proceed', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(proceedButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockFinalAlignmentStartAPI).toHaveBeenCalled()
  })

  test('should not start final alignment on user click on the modal cancel btn', async () => {
    await waitFor(
      () => {
        wsAlignment.send(
          JSON.stringify({
            ...notificationInitial,
            alignmentPhase: AlignmentPhase.INITIAL_DONE,
          })
        )
        store.dispatch(getPlannedJobActions.success({ plan: mockPlan }))
        store.dispatch(
          routingStatusActions.success({
            initial: false,
            final: false,
            enabled: true,
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
    const startButton = component.getByText(
      t('acquisition.main_button.start_final', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const cancelButton = component.getByText(
      t('acquisition.alignment.out_of_range.cancel', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(cancelButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockFinalAlignmentStartAPI).not.toHaveBeenCalled()
  })
})

describe('Acquisition alignment (Store - planned Job - routing disabled)', () => {
  let wsNotification: WS
  let wsAlignment: WS
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let store: Store
  let mockInitialAlignmentStartAPI: jest.SpyInstance<any>
  let mockInitialAlignmentInfoAPI: jest.SpyInstance<any>
  let mockFinalAlignmentStartAPI: jest.SpyInstance<any>
  let mockFinalAlignmentInfoAPI: jest.SpyInstance<any>
  let mockedAlignmentAPI: jest.SpyInstance<any>
  let mockedAlignmentStatusApi: jest.SpyInstance<any>
  let mockedRoutingTracks: jest.SpyInstance<any>
  let mockedRoutingStatus: jest.SpyInstance<any>
  let mockedRoutingNeeded: jest.SpyInstance<any>
  let mockedCameraTrigger: jest.SpyInstance<any>
  let mockedCameraExposure: jest.SpyInstance<any>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>

  beforeEach(async () => {
    store = getTestingStore()
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    // mock API
    mockInitialAlignmentStartAPI = mkInitialAlignmentStart()
    mockInitialAlignmentInfoAPI = mkInitialAlignmentInfo()
    mockFinalAlignmentStartAPI = mkFinalAlignmentStart()
    mockFinalAlignmentInfoAPI = mkFinalAlignmentInfo()
    mockedAlignmentAPI = mkAlignmentCommand()
    mockedAlignmentStatusApi = mkAlignmentStatus()
    mockedRoutingTracks = mkAutocapturePolygons()
    mockedRoutingStatus = mkRoutingStatus()
    mockedRoutingNeeded = mkAutocaptureNeeded()
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
    moxios.install(apiClient)
    wsNotification = new WS(`${getSocketUrl()}/notification`)
    wsAlignment = new WS(`${getSocketUrl()}/position/alignment`)
    store.dispatch(notificationsSubscribeAction())
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
        // disable routing
        store.dispatch(modulesActions.success({ modules: [] }))
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
            state: 'Logging',
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
        // set alignment state
        store.dispatch(
          alignmentMessageAction(mockStore.alignmentService.alignmentState!)
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
        store.dispatch(alignmentUnsubscribeAction())
        store.dispatch(resetStoreAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    WS.clean()
    mockDispatchRealStore.mockClear()
    mockInitialAlignmentStartAPI.mockClear()
    mockInitialAlignmentInfoAPI.mockClear()
    mockFinalAlignmentStartAPI.mockClear()
    mockFinalAlignmentInfoAPI.mockClear()
    mockedAlignmentAPI.mockClear()
    mockedAlignmentStatusApi.mockClear()
    mockedRoutingTracks.mockClear()
    mockedRoutingStatus.mockClear()
    mockedRoutingNeeded.mockClear()
    mockedCameraTrigger.mockClear()
    mockedCameraExposure.mockClear()
    moxios.uninstall(apiClient)
    moxios.uninstall(mockApiClient)
    moxios.uninstall(apiClientNode)
    jest.useRealTimers()
  })

  test('should NOT show a modal on user click if the initial point is out of range', async () => {
    await waitFor(
      () => {
        wsAlignment.send(JSON.stringify(notificationNone))
        store.dispatch(
          routingStatusActions.success({
            initial: false,
            final: false,
            enabled: false,
          })
        )
        store.dispatch(
          autocaptureStatusActions.success({
            enabled: false,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByText(
      t('acquisition.main_button.start_initial', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByText(
        t('acquisition.alignment.out_of_range.title', 'wrong') as string
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        t('acquisition.alignment.out_of_range.cancel', 'wrong') as string
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        t('acquisition.alignment.out_of_range.proceed', 'wrong') as string
      )
    ).not.toBeInTheDocument()
  })
})
