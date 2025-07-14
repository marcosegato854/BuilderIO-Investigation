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
import moxios from 'moxios'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  mkStartRecording,
  mkStartRecordingInfo,
  mkStopRecording,
  mkStopRecordingInfo,
} from 'store/features/actions/mockApi'
import {
  actionsServiceStartRecordingAction,
  actionsServiceStartRecordingInfoActions,
  actionsServiceStopRecordingAction,
} from 'store/features/actions/slice'
import { ActionsServiceStartRecordingStartResponse } from 'store/features/actions/types'
import { alignmentMessageAction } from 'store/features/alignment/slice'
import { AlignmentPhase } from 'store/features/alignment/types'
import { dataStorageProjectDetailActions } from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import {
  modulesActions,
  notificationMessageAction,
  notificationRemovalAction,
  systemStateActions,
} from 'store/features/system/slice'
import {
  ModuleID,
  NotificationsPosition,
  SystemNotification,
} from 'store/features/system/types'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import { composeErrorString } from 'utils/errors'
import { renderWithProvider } from 'utils/test'
import { AcquisitionView } from './AcquisitionView'
import { translateSystemNotification } from 'utils/notifications'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(
  mergeDeepRight(mockStore, { system: { systemState: { state: 'Logging' } } })
)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.spyOn(store, 'dispatch')

describe('AcquisitionViewMap (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display job name', () => {
    expect(
      component.getByText(mockStore.dataStorageService.currentJob.name)
    ).toBeTruthy()
  })

  test('should switch status info details on and off', () => {
    expect(screen.queryByTestId('status-detail')).not.toBeInTheDocument()
    const switchButton = component.getByTestId('toggle-info')
    expect(switchButton).toBeTruthy()
    fireEvent.click(switchButton)
    expect(screen.queryByTestId('status-detail')).toBeInTheDocument()
  })
})

describe('AcquisitionViewMap (realStore) without routing', () => {
  let component: RenderResult<typeof queries>
  let mockConsoleError: jest.SpyInstance<any>

  beforeEach(async () => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
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
    moxios.stubRequest('/system/log', {
      status: 200,
      response: {},
    })
    /** render */
    component = renderWithProvider(<AcquisitionView />)(store)
    //
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        // fill the project
        store.dispatch(
          dataStorageProjectDetailActions.success({
            disk: 'p',
            jobs: 0,
            name: 'test',
            completed: 0,
          })
        )
        // set system state
        store.dispatch(
          systemStateActions.success({
            state: 'Logging',
          })
        )
        // set alignment state
        store.dispatch(
          alignmentMessageAction({
            ...mockStore.alignmentService.alignmentState!,
            alignmentPhase: AlignmentPhase.INITIAL_DONE,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    moxios.uninstall(apiClient)
    mockDispatch.mockClear()
    mockConsoleError.mockClear()
    store.dispatch(resetStoreAction())
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('display progress while starting recording', async () => {
    // reset state
    await waitFor(
      () => {
        store.dispatch(systemStateActions.success({ state: 'Activated' }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(screen.queryByTestId('progress-message')).not.toBeInTheDocument()
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({ state: 'StartingRecording' })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.queryByTestId('progress-message')).toBeInTheDocument()
  })

  test('display progress while stopping recording', async () => {
    // reset state
    await waitFor(
      () => {
        store.dispatch(systemStateActions.success({ state: 'Activated' }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(screen.queryByTestId('progress-message')).not.toBeInTheDocument()
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({ state: 'StoppingRecording' })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.queryByTestId('progress-message')).toBeInTheDocument()
  })

  test('start recording should call the API', async () => {
    const mockApiStartRecording = mkStartRecordingInfo()
    await waitFor(
      () => {
        store.dispatch(actionsServiceStartRecordingAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockApiStartRecording).toHaveBeenCalled()
  })

  test('stop recording should call the API', async () => {
    const mockApiStopRecording = mkStopRecordingInfo()
    await waitFor(
      () => {
        store.dispatch(actionsServiceStopRecordingAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockApiStopRecording).toHaveBeenCalled()
  })

  test('should NOT start / stop recording when the button is clicked too soon', async () => {
    const recordingButton = component.getByTestId('recording-button')
    await waitFor(() => {}, { timeout: 2500 })
    jest.advanceTimersByTime(2500)
    expect(recordingButton).toBeTruthy()
    fireEvent.click(recordingButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'actionsService/START_RECORDING',
    })
    store.dispatch(
      actionsServiceStartRecordingInfoActions.success({
        action: { status: 'done', description: '', progress: 100 },
      })
    )
    expect(store.getState().actionsService.recordingStatus).toBe('done')
    await waitFor(() => {}, { timeout: 1000 })
    jest.advanceTimersByTime(1000)
    mockDispatch.mockClear()
    fireEvent.click(recordingButton)
    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: 'actionsService/STOP_RECORDING',
    })
  })

  test('should start / stop recording when the button is clicked', async () => {
    const recordingButton = component.getByTestId('recording-button')
    await waitFor(() => {}, { timeout: 2500 })
    jest.advanceTimersByTime(2500)
    expect(recordingButton).toBeTruthy()
    fireEvent.click(recordingButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'actionsService/START_RECORDING',
    })
    store.dispatch(
      actionsServiceStartRecordingInfoActions.success({
        action: { status: 'done', description: '', progress: 100 },
      })
    )
    expect(store.getState().actionsService.recordingStatus).toBe('done')
    mockDispatch.mockClear()
    await waitFor(() => {}, { timeout: 2500 })
    jest.advanceTimersByTime(2500)
    fireEvent.click(recordingButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'actionsService/STOP_RECORDING',
    })
  })

  test('it should remove alignment button during recording', () => {
    expect(screen.queryByTestId('alignment-button')).toBeInTheDocument()
    store.dispatch(
      actionsServiceStartRecordingInfoActions.success({
        action: { status: 'done', description: '', progress: 100 },
      })
    )
    expect(store.getState().actionsService.recordingStatus).toBe('done')
    expect(screen.queryByTestId('alignment-button')).not.toBeInTheDocument()
  })

  test('Displays sticky notifications', () => {
    const notificationText =
      mockStore.system.realTimeNotifications[0].description
    store.dispatch(
      notificationMessageAction({
        code: 'AL1',
        description: notificationText,
        id: 1,
        type: 2,
      })
    )
    expect(component.getAllByText(notificationText).length).toBeGreaterThan(0)
  })

  test('it should remove a sticky notification after a removal message from the socket', () => {
    const notificationText = 'position socket disconnected'
    expect(screen.queryByText(notificationText)).not.toBeInTheDocument()
    store.dispatch(
      notificationMessageAction({
        code: '801',
        description: notificationText,
        id: 1,
        type: 2,
      })
    )
    expect(screen.queryAllByText(notificationText).length).toBe(0)
  })

  test('it should not display a socket notification at center', () => {
    // prettier-ignore
    const notificationText = 'position socket disconnected'
    expect(screen.queryByText(notificationText)).not.toBeInTheDocument()
    store.dispatch(
      notificationMessageAction({
        code: '801',
        description: notificationText,
        id: 1,
        type: 2,
      })
    )
    expect(screen.queryAllByText(notificationText).length).toBe(0)
  })

  test('it should not display a socket notification at bottom', () => {
    const notificationText =
      mockStore.system.realTimeNotifications[0].description
    expect(screen.queryByText(notificationText)).not.toBeInTheDocument()
    store.dispatch(
      notificationMessageAction({
        code: 'AL1',
        description: notificationText,
        id: 1,
        type: 2,
      })
    )
    expect(screen.queryAllByText(notificationText).length).toBeGreaterThan(0)
    store.dispatch(
      notificationRemovalAction({
        code: 'AL1',
        description: 'Removal',
        id: 1,
        type: 3,
      })
    )
    expect(screen.queryByText(notificationText)).not.toBeInTheDocument()
  })

  test('it should display notifications at center', () => {
    // prettier-ignore
    const notificationText = 'Please go slower'
    expect(screen.queryByText(notificationText)).not.toBeInTheDocument()
    store.dispatch(
      notificationMessageAction({
        code: 'AL1',
        description: notificationText,
        id: 1,
        type: 2,
      })
    )
    expect(screen.queryByText(notificationText)).toBeInTheDocument()
    store.dispatch(
      notificationRemovalAction({
        code: 'AL1',
        description: 'Removal',
        id: 1,
        type: 3,
      })
    )
    expect(screen.queryByText(notificationText)).not.toBeInTheDocument()
  })

  test('it should fill in notification parameters', () => {
    const rawNotification: SystemNotification = {
      code: 'BTU-002',
      description: 'Low battery',
      p1: 'Batteryname',
      id: 1,
      type: 2,
    }
    const translatedNotification = translateSystemNotification(rawNotification)
    store.dispatch(notificationMessageAction(translatedNotification))
    const expectedText = t(
      `backend_errors.code.${rawNotification.code}`
    ).replace('{p1}', rawNotification.p1!)
    expect(screen.getByText(expectedText)).toBeInTheDocument()
    store.dispatch(
      notificationRemovalAction({
        code: 'BTU-002',
        description: 'Removal',
        id: 1,
        type: 3,
      })
    )
    expect(screen.queryByText(expectedText)).not.toBeInTheDocument()
  })

  test('it should dispatch an action to change notifications position when clicking ok', () => {
    const notificationText = 'Please go slower'
    store.dispatch(
      notificationMessageAction({
        code: 'AL1',
        description: notificationText,
        id: 1,
        type: 2,
      })
    )
    const button = screen.getByText(
      t('acquisition.dialogs.ok', 'wrong') as string
    )
    fireEvent.click(button)
    expect(mockDispatch).toBeCalledWith(
      expect.objectContaining({
        type: 'systemService/NOTIFICATIONS_POSIITON',
        payload: expect.objectContaining({
          position: NotificationsPosition.BOTTOM,
        }),
      })
    )
  })
})

describe('AcquisitionViewMap (realStore) with routing', () => {
  let component: RenderResult<typeof queries>
  let mockConsoleError: jest.SpyInstance<any>

  beforeEach(async () => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
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
    moxios.stubRequest('/system/log', {
      status: 200,
      response: {},
    })
    /** render */
    component = renderWithProvider(<AcquisitionView />)(store)
    //
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        // fill the project
        store.dispatch(
          dataStorageProjectDetailActions.success({
            disk: 'p',
            jobs: 0,
            name: 'test',
            completed: 0,
          })
        )
        // set system state
        store.dispatch(
          systemStateActions.success({
            state: 'Logging',
          })
        )
        // set alignment state
        store.dispatch(
          alignmentMessageAction({
            ...mockStore.alignmentService.alignmentState!,
            alignmentPhase: AlignmentPhase.INITIAL_DONE,
          })
        )
        // enable routing
        store.dispatch(
          modulesActions.success({
            modules: [ModuleID.ROUTING],
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    moxios.uninstall(apiClient)
    mockDispatch.mockClear()
    mockConsoleError.mockClear()
    store.dispatch(resetStoreAction())
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should start / stop recording when the button is clicked too soon', async () => {
    const recordingButton = component.getByTestId('recording-button')
    await waitFor(() => {}, { timeout: 2500 })
    jest.advanceTimersByTime(2500)
    expect(recordingButton).toBeTruthy()
    fireEvent.click(recordingButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'actionsService/START_RECORDING',
    })
    store.dispatch(
      actionsServiceStartRecordingInfoActions.success({
        action: { status: 'done', description: '', progress: 100 },
      })
    )
    expect(store.getState().actionsService.recordingStatus).toBe('done')
    await waitFor(() => {}, { timeout: 100 })
    jest.advanceTimersByTime(100)
    mockDispatch.mockClear()
    fireEvent.click(recordingButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'actionsService/STOP_RECORDING',
    })
  })

  test('should start / stop recording when the button is clicked', async () => {
    const recordingButton = component.getByTestId('recording-button')
    await waitFor(() => {}, { timeout: 2500 })
    jest.advanceTimersByTime(2500)
    expect(recordingButton).toBeTruthy()
    fireEvent.click(recordingButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'actionsService/START_RECORDING',
    })
    store.dispatch(
      actionsServiceStartRecordingInfoActions.success({
        action: { status: 'done', description: '', progress: 100 },
      })
    )
    expect(store.getState().actionsService.recordingStatus).toBe('done')
    mockDispatch.mockClear()
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    fireEvent.click(recordingButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'actionsService/STOP_RECORDING',
    })
  })
})

describe('AcquisitionViewMap (testingStore - failing api)', () => {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  const testingStore = getTestingStore()
  let mockConsoleError: jest.SpyInstance<any>
  let mockStartRecordingAPI: jest.SpyInstance<any>
  let mockStopRecordingAPI: jest.SpyInstance<any>
  let mockStartRecordingInfoAPI: jest.SpyInstance<any>
  let mockStopRecordingInfoAPI: jest.SpyInstance<any>
  const error = {
    module: 'Camera',
    code: 'CAM-020',
    description: 'Camera {p1} is not connected',
    p1: 'Pano Front',
  }

  beforeEach(async () => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    /** mock API */
    const errorAction = {
      action: {
        status: 'error',
        progress: -1,
        description: 'failed starting recording',
        errors: [
          {
            module: 'Camera',
            code: 'CAM-020',
            description: 'Camera {p1} is not connected',
            p1: 'Pano Front',
          },
        ],
      },
    } as ActionsServiceStartRecordingStartResponse
    mockStartRecordingAPI = mkStartRecording(errorAction)
    mockStopRecordingAPI = mkStopRecording(errorAction)
    mockStartRecordingInfoAPI = mkStartRecordingInfo(errorAction)
    mockStopRecordingInfoAPI = mkStopRecordingInfo(errorAction)
    moxios.install(apiClient)
    /** render */
    component = renderWithProvider(
      <div>
        <DialogManager />
        <ErrorManager />
        <AcquisitionView />
      </div>
    )(testingStore)
    //
    // enable fake timers
    jest.useFakeTimers()
    await waitFor(
      () => {
        // fill the project
        testingStore.dispatch(
          dataStorageProjectDetailActions.success({
            disk: 'p',
            jobs: 0,
            name: 'test',
            completed: 0,
          })
        )
        // set alignment state
        testingStore.dispatch(
          alignmentMessageAction({
            ...mockStore.alignmentService.alignmentState!,
            alignmentPhase: AlignmentPhase.INITIAL_DONE,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(async () => {
    mockConsoleError.mockClear()
    mockStartRecordingAPI.mockClear()
    mockStopRecordingAPI.mockClear()
    mockStartRecordingInfoAPI.mockClear()
    mockStopRecordingInfoAPI.mockClear()
    moxios.uninstall(apiClient)
    mockDispatch.mockClear()
    await waitFor(
      () => {
        testingStore.dispatch(resetStoreAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(200)
    jest.useRealTimers()
  })

  test('should display translated errors when start recording fails', async () => {
    await waitFor(
      () => {
        testingStore.dispatch(actionsServiceStartRecordingAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const text = composeErrorString(
      t('acquisition.camera_failure.recording', 'Recording failed'),
      [error]
    )
    expect(screen.getByText(text)).toBeTruthy()
  })

  test('should display translated errors when stop recording fails', async () => {
    await waitFor(
      () => {
        testingStore.dispatch(actionsServiceStopRecordingAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const text = composeErrorString(
      t('acquisition.camera_failure.stop', 'Stop failed'),
      [error]
    )
    expect(screen.getByText(text)).toBeTruthy()
  })
})
