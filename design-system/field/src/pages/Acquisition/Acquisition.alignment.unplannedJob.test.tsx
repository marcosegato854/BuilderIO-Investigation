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
import { Store } from 'redux'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
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
  actionsServiceDeactivateSystemAction,
} from 'store/features/actions/slice'
import {
  mkAlignmentCommand,
  mkAlignmentStatus,
} from 'store/features/alignment/mockApi'
import {
  alignmentMessageAction,
  alignmentSubscribeAction,
  alignmentUnsubscribeAction,
} from 'store/features/alignment/slice'
import {
  AlignmentCommand,
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
import {
  mkAutocaptureNeeded,
  mkAutocapturePolygons,
  mkRoutingStatus,
} from 'store/features/routing/mockApi'
import {
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

describe('Acquisition alignment (Testing Store)', () => {
  let wsNotification: WS
  let wsAlignment: WS
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let testingStore: Store
  let mockInitialAlignmentStartAPI: jest.SpyInstance<any>
  let mockInitialAlignmentInfoAPI: jest.SpyInstance<any>
  let mockFinalAlignmentStartAPI: jest.SpyInstance<any>
  let mockFinalAlignmentInfoAPI: jest.SpyInstance<any>
  let mockedAlignmentAPI: jest.SpyInstance<any>
  let mockedAlignmentStatusApi: jest.SpyInstance<any>
  let mockedRoutingTracks: jest.SpyInstance<any>
  let mockedRoutingStatus: jest.SpyInstance<any>
  let mockedRoutingNeeded: jest.SpyInstance<any>
  let mockedCameraExposure: jest.SpyInstance<any>
  let mockedCameraTrigger: jest.SpyInstance<any>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>

  beforeEach(async () => {
    testingStore = getTestingStore()
    mockDispatchRealStore = jest.spyOn(testingStore, 'dispatch')
    // mock API
    mockInitialAlignmentStartAPI = mkInitialAlignmentStart()
    mockInitialAlignmentInfoAPI = mkInitialAlignmentInfo()
    mockedCameraExposure = mkCameraExposure()
    mockedCameraTrigger = mkCameraTrigger()
    mockFinalAlignmentStartAPI = mkFinalAlignmentStart()
    mockFinalAlignmentInfoAPI = mkFinalAlignmentInfo()
    mockedAlignmentAPI = mkAlignmentCommand()
    mockedAlignmentStatusApi = mkAlignmentStatus()
    mockedRoutingTracks = mkAutocapturePolygons()
    mockedRoutingStatus = mkRoutingStatus()
    mockedRoutingNeeded = mkAutocaptureNeeded()
    moxios.install(apiClientNode)
    moxios.install(mockApiClient)
    moxios.stubRequest(
      `/addFolder/${mockStore.dataStorageService.currentProject?.name}/${mockStore.dataStorageService.currentJob?.name}`,
      {
        status: 200,
        response: {},
      }
    )
    moxios.stubRequest('/routing/enabled', {
      status: 200,
      response: { enabled: false },
    })
    moxios.install(apiClient)
    wsNotification = new WS(`${getSocketUrl()}/notification`)
    wsAlignment = new WS(`${getSocketUrl()}/position/alignment`)
    testingStore.dispatch(notificationsSubscribeAction())
    // store.dispatch(alignmentSubscribeAction())
    // render
    component = renderWithProvider(
      <div>
        <DialogManager />
        <ErrorManager />
        <Acquisition {...(routeComponentPropsMock as IAcquisitionProps)} />
      </div>
    )(testingStore)
    // wait for ws connection
    await wsNotification.connected
    // enable fake timers
    jest.useFakeTimers()
    // use the current Job with unplanned value
    const currentUnplannedJob: IJob = {
      ...mockStore.dataStorageService.currentJob!,
      planned: false,
    }
    // fill the store
    await waitFor(
      () => {
        // fill current project
        testingStore.dispatch(
          dataStorageProjectDetailActions.success(
            mockStore.dataStorageService.currentProject!
          )
        )
        // fill current job
        testingStore.dispatch(
          dataStorageJobDetailActions.success({
            job: currentUnplannedJob,
          })
        )
        // set system state
        testingStore.dispatch(
          systemStateActions.success({
            state: 'InitialAlignment',
          })
        )
        // display map
        testingStore.dispatch(actionsServiceAcquisitionReady(true))
        // set activation status
        testingStore.dispatch(
          actionsServiceActivationInfoActions.success({
            action: {
              status: 'done',
              progress: 100,
              description: '',
            },
          })
        )
        // set acquisition ready
        testingStore.dispatch(actionsServiceAcquisitionReady(true))
        // set alignment state
        testingStore.dispatch(
          alignmentMessageAction(mockStore.alignmentService.alignmentState!)
        )
      },
      { timeout: 100 }
    )
    jest.advanceTimersByTime(100)
  })

  afterEach(async () => {
    await waitFor(
      () => {
        testingStore.dispatch(notificationsUnsubscribeAction())
        testingStore.dispatch(alignmentUnsubscribeAction())
        testingStore.dispatch(resetStoreAction())
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
    mockedCameraExposure.mockClear()
    mockedCameraTrigger.mockClear()
    mockedRoutingTracks.mockClear()
    mockedRoutingStatus.mockClear()
    mockedRoutingNeeded.mockClear()
    moxios.uninstall(apiClient)
    moxios.uninstall(mockApiClient)
    moxios.uninstall(apiClientNode)
    jest.useRealTimers()
  })

  test('should display alignment toast', async () => {
    expect(screen.getByTestId('alignment-toast')).toBeTruthy()
  })

  test('should subscribe to alignment socket at mount', async () => {
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      alignmentSubscribeAction()
    )
  })

  test('should get alignment status at mount', async () => {
    expect(mockedAlignmentStatusApi).toHaveBeenCalled()
  })

  test('should unsubscribe from alignment socket at unmount', async () => {
    component.unmount()
    expect(mockDispatchRealStore).toHaveBeenCalledWith(
      alignmentUnsubscribeAction()
    )
  })

  test('should use button labels based on alignment phase', async () => {
    // initial
    const notificationInitial: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
    }
    await waitFor(
      () => {
        wsNotification.send(JSON.stringify(notificationInitial))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        t('acquisition.main_button.stop_initial', 'Wrong') as string
      )
    ).toBeTruthy()
    // none
    await waitFor(
      () => {
        wsAlignment.send(
          JSON.stringify({
            ...notificationInitial,
            alignmentPhase: AlignmentPhase.NONE,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        t('acquisition.main_button.start_initial', 'Wrong') as string
      )
    ).toBeTruthy()
    // final
    await waitFor(
      () => {
        wsAlignment.send(
          JSON.stringify({
            ...notificationInitial,
            alignmentPhase: AlignmentPhase.FINAL,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        t('acquisition.main_button.stop_final', 'Wrong') as string
      )
    ).toBeTruthy()
    // initial done
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
    expect(
      component.getByText(
        t('acquisition.main_button.start_final', 'Wrong') as string
      )
    ).toBeTruthy()
    // final done
    await waitFor(
      () => {
        wsAlignment.send(
          JSON.stringify({
            ...notificationInitial,
            alignmentPhase: AlignmentPhase.FINAL_DONE,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        t('acquisition.main_button.deactivate', 'Wrong') as string
      )
    ).toBeTruthy()
  })

  test('should start initial alignment on user click', async () => {
    await waitFor(
      () => {
        testingStore.dispatch(
          systemStateActions.success({
            state: 'Activated',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const notificationNone: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      alignmentPhase: AlignmentPhase.NONE,
    }
    await waitFor(
      () => {
        wsAlignment.send(JSON.stringify(notificationNone))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByText(
      t('acquisition.main_button.start_initial', 'Wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockInitialAlignmentStartAPI).toHaveBeenCalled()
  })

  test('should start final alignment on user click', async () => {
    const notificationInitial: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
    }
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
      t('acquisition.main_button.start_final', 'Wrong') as string
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

  test('should deactivate the system on user click', async () => {
    const notificationInitial: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
    }
    await waitFor(
      () => {
        wsAlignment.send(
          JSON.stringify({
            ...notificationInitial,
            alignmentPhase: AlignmentPhase.FINAL_DONE,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByText(
      t('acquisition.main_button.deactivate', 'Wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatchRealStore).toBeCalledWith(
      actionsServiceDeactivateSystemAction()
    )
  })

  test('should hide the record button before alignment is done', async () => {
    const notificationInitial: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      alignmentPhase: AlignmentPhase.INITIAL,
    }
    await waitFor(
      () => {
        wsAlignment.send(JSON.stringify(notificationInitial))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.queryByTestId('recording-button')).not.toBeInTheDocument()
  })

  test('should not display force alignment if in final done', async () => {
    expect(component.getByTestId('arrow-icon')).toBeTruthy()
    const notificationInitial: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      alignmentPhase: AlignmentPhase.FINAL_DONE,
    }
    await waitFor(
      () => {
        wsAlignment.send(JSON.stringify(notificationInitial))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.queryByTestId('arrow-icon')).not.toBeInTheDocument()
  })
})

describe('Acquisition alignment (Real Store)', () => {
  let wsNotification: WS
  let wsAlignment: WS
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let mockInitialAlignmentStartAPI: jest.SpyInstance<any>
  let mockInitialAlignmentInfoAPI: jest.SpyInstance<any>
  let mockFinalAlignmentStartAPI: jest.SpyInstance<any>
  let mockFinalAlignmentInfoAPI: jest.SpyInstance<any>
  let mockedAlignmentAPI: jest.SpyInstance<any>
  let mockedAlignmentStatusApi: jest.SpyInstance<any>
  let mockedRoutingTracks: jest.SpyInstance<any>
  let mockedRoutingNeeded: jest.SpyInstance<any>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  let mockedCameraExposure: jest.SpyInstance<any>
  let mockedCameraTrigger: jest.SpyInstance<any>

  beforeEach(async () => {
    mockDispatchRealStore = jest.spyOn(store, 'dispatch')
    // mock API
    mockInitialAlignmentStartAPI = mkInitialAlignmentStart()
    mockInitialAlignmentInfoAPI = mkInitialAlignmentInfo()
    mockFinalAlignmentStartAPI = mkFinalAlignmentStart()
    mockFinalAlignmentInfoAPI = mkFinalAlignmentInfo()
    mockedAlignmentAPI = mkAlignmentCommand()
    mockedAlignmentStatusApi = mkAlignmentStatus()
    mockedRoutingTracks = mkAutocapturePolygons()
    mockedRoutingNeeded = mkAutocaptureNeeded()
    mockedCameraExposure = mkCameraExposure()
    mockedCameraTrigger = mkCameraTrigger()
    moxios.install(apiClientNode)
    moxios.install(mockApiClient)
    moxios.stubRequest(
      `/addFolder/${mockStore.dataStorageService.currentProject?.name}/${mockStore.dataStorageService.currentJob?.name}`,
      {
        status: 200,
        response: {},
      }
    )
    moxios.stubRequest('/routing/enabled', {
      status: 200,
      response: { enabled: false },
    })
    moxios.install(apiClient)
    wsNotification = new WS(`${getSocketUrl()}/notification`)
    wsAlignment = new WS(`${getSocketUrl()}/position/alignment`)
    store.dispatch(notificationsSubscribeAction())
    // store.dispatch(alignmentSubscribeAction())
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
    mockedRoutingNeeded.mockClear()
    mockedCameraExposure.mockClear()
    mockedCameraTrigger.mockClear()
    moxios.uninstall(apiClient)
    moxios.uninstall(mockApiClient)
    moxios.uninstall(apiClientNode)
    jest.useRealTimers()
  })

  test('should abort initial alignment on user click', async () => {
    const notificationInitial: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      alignmentPhase: AlignmentPhase.INITIAL,
    }
    await waitFor(
      () => {
        wsAlignment.send(JSON.stringify(notificationInitial))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByText(
      t('acquisition.main_button.stop_initial', 'Wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    expect(
      screen.getByText(
        t('acquisition.alignment.skip_alert.text', 'Wrong') as string
      )
    ).toBeTruthy()
    const okButton = component.getByTestId('alert-ok-button')
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    expect(mockedAlignmentAPI).toBeCalledWith({
      action: AlignmentCommand.SKIP,
    })
  })

  test('should abort final alignment on user click', async () => {
    const notificationFinal: AlignmentNotification = {
      ...mockStore.alignmentService.alignmentState!,
      alignmentPhase: AlignmentPhase.FINAL,
    }
    await waitFor(
      () => {
        wsAlignment.send(JSON.stringify(notificationFinal))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const startButton = component.getByText(
      t('acquisition.main_button.stop_final', 'Wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(startButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    expect(
      screen.getByText(
        t('acquisition.alignment.skip_alert.text_final', 'Wrong') as string
      )
    ).toBeTruthy()
    const okButton = component.getByTestId('alert-ok-button')
    await waitFor(
      () => {
        fireEvent.click(okButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    expect(mockedAlignmentAPI).toBeCalledWith({
      action: AlignmentCommand.SKIP,
    })
  })
})
