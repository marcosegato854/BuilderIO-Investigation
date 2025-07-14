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
  actionsServiceActivationInfoActions,
  actionsServiceStartRecordingAction,
  actionsServiceStartRecordingInfoActions,
} from 'store/features/actions/slice'
import { alignmentMessageAction } from 'store/features/alignment/slice'
import { AlignmentPhase } from 'store/features/alignment/types'
import { cameraDisplayableNamesActions } from 'store/features/camera/slice'
import { CameraGroup } from 'store/features/camera/types'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { mkAutocapturePolygons } from 'store/features/routing/mockApi'
import { mkSystemLog } from 'store/features/system/mockApi'
import {
  notificationsSubscribeAction,
  notificationsUnsubscribeAction,
} from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import apiClientNode from 'store/services/apiClientNode'
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

describe('Acquisition camera disconnection (Store)', () => {
  let ws: WS
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  let store: Store
  let mockedRoutingTracks: jest.SpyInstance<any>
  let mockedSystemLog: jest.SpyInstance<any>

  beforeEach(async () => {
    mockedRoutingTracks = mkAutocapturePolygons()
    mockedSystemLog = mkSystemLog()
    store = getTestingStore()
    mockDispatchRealStore = jest.spyOn(realStore, 'dispatch')
    // mock API
    moxios.install(apiClientNode)
    moxios.stubRequest(
      `/addFolder/${mockStore.dataStorageService.currentProject?.name}/${mockStore.dataStorageService.currentJob?.name}`,
      {
        status: 200,
        response: {},
      }
    )
    moxios.install(apiClient)
    ws = new WS(`${getSocketUrl()}/notification`)
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
    await ws.connected
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
          actionsServiceActivationInfoActions.success({
            action: {
              status: 'done',
              progress: 100,
              description: '',
            },
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

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(notificationsUnsubscribeAction())
        store.dispatch(resetStoreAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    WS.clean()
    mockedRoutingTracks.mockClear()
    mockedSystemLog.mockClear()
    mockDispatchRealStore.mockClear()
    moxios.uninstall(apiClient)
    moxios.uninstall(apiClientNode)
    jest.useRealTimers()
  })

  test('should display camera disconnection alert when receiving MV-0 notification', async () => {
    const notification: SystemNotification = {
      code: 'MV-0',
      description: 'Missing Front Left Camera',
      time: '2021-10-13T11:15:57D',
      type: 2,
      id: 1,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.getByText(
        t('acquisition.deactivated_camera.title', 'Disconnected') as string
      )
    ).toBeTruthy()
    // should not display a cancel button
    const buttonCancel = screen.queryByTestId('alert-cancel-button')
    expect(buttonCancel).not.toBeInTheDocument()
  })

  test('should display camera disconnection alert with an alert dialog', async () => {
    const notification: SystemNotification = {
      code: 'MV-0',
      description: 'Missing Front Left Camera',
      time: '2021-10-13T11:15:57D',
      type: 2,
      id: 1,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.getByTestId('dialog-component')).toBeTruthy()
  })

  test('should display camera disconnection alert when receiving MV-10 notification', async () => {
    const notification: SystemNotification = {
      code: 'MV-10',
      description: 'Missing Front Left Camera',
      time: '2021-10-13T11:15:57D',
      type: 2,
      id: 1,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.getByText(
        t('acquisition.deactivated_camera.title', 'Disconnected') as string
      )
    ).toBeTruthy()
  })

  test('should remove camera disconnection alert when receiving MV-10 notification removal', async () => {
    const notification: SystemNotification = {
      code: 'MV-0',
      description: 'Missing Front Left Camera',
      time: '2021-10-13T11:15:57D',
      type: 2,
      id: 1,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.getByText(
        t('acquisition.deactivated_camera.title', 'Disconnected') as string
      )
    ).toBeTruthy()
    // removal
    await waitFor(
      () => {
        ws.send(JSON.stringify({ ...notification, type: 3 }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        store.dispatch(
          cameraDisplayableNamesActions.success({
            groups: mockStore.cameraService.groups,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByText(
        t('acquisition.deactivated_camera.title', 'Disconnected') as string
      )
    ).not.toBeInTheDocument()
    // should display a custom message when the camera reconnects when not recording
    expect(
      screen.getByText(
        t(
          'acquisition.reactivated_camera.text_resume',
          'Disconnected'
        ) as string
      )
    ).toBeTruthy()
    // should allow to cancel resume recording
    const buttonCancel = screen.getByTestId('alert-cancel-button')
    expect(buttonCancel).toBeTruthy()
  })

  test('should not allow recording when the camera reconnects during alignment', async () => {
    await waitFor(
      () => {
        // set alignment state
        store.dispatch(
          alignmentMessageAction({
            ...mockStore.alignmentService.alignmentState!,
            alignmentPhase: AlignmentPhase.INITIAL,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const notification: SystemNotification = {
      code: 'MV-0',
      description: 'Missing Front Left Camera',
      time: '2021-10-13T11:15:57D',
      type: 2,
      id: 1,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.getByText(
        t('acquisition.deactivated_camera.title', 'Disconnected') as string
      )
    ).toBeTruthy()
    // removal
    await waitFor(
      () => {
        ws.send(JSON.stringify({ ...notification, type: 3 }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        store.dispatch(
          cameraDisplayableNamesActions.success({
            groups: mockStore.cameraService.groups,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.queryByText(
        t('acquisition.deactivated_camera.title', 'Disconnected') as string
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        t(
          'acquisition.reactivated_camera.text_resume',
          'Disconnected'
        ) as string
      )
    ).not.toBeInTheDocument()
    // should not start recording
    const buttonOk = screen.getByText(
      t('acquisition.reactivated_camera.ok_all', 'Wrong') as string
    )
    fireEvent.click(buttonOk!)
    expect(mockDispatchRealStore).not.toHaveBeenCalledWith(
      actionsServiceStartRecordingAction()
    )
  })
})

describe('Acquisition camera disconnection - Recording (Store)', () => {
  let ws: WS
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>
  let store: Store
  let mockDispatchTestStore: jest.SpyInstance<any, [action: any]>
  let mockDispatchRealStore: jest.SpyInstance<any, [action: any]>
  let mockedSystemErrorLogApi: jest.SpyInstance<any, [action: any]>

  beforeEach(async () => {
    store = getTestingStore()
    mockDispatchTestStore = jest.spyOn(store, 'dispatch')
    mockDispatchRealStore = jest.spyOn(realStore, 'dispatch')
    mockedSystemErrorLogApi = mkSystemLog()
    // mock API
    moxios.install(apiClientNode)
    moxios.stubRequest(
      `/addFolder/${mockStore.dataStorageService.currentProject?.name}/${mockStore.dataStorageService.currentJob?.name}`,
      {
        status: 200,
        response: {},
      }
    )
    moxios.install(apiClient)
    // mock socket
    ws = new WS(`${getSocketUrl()}/notification`)
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
    await ws.connected
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
          actionsServiceActivationInfoActions.success({
            action: {
              status: 'done',
              progress: 100,
              description: '',
            },
          })
        )
        // set recording status
        store.dispatch(
          actionsServiceStartRecordingInfoActions.success({
            action: {
              status: 'done',
              progress: 100,
              description: '',
            },
          })
        )
        // initial cameras
        store.dispatch(
          cameraDisplayableNamesActions.success({
            groups: mockStore.cameraService.groups,
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
        store.dispatch(resetStoreAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    WS.clean()
    moxios.uninstall(apiClient)
    moxios.uninstall(apiClientNode)
    jest.useRealTimers()
    mockDispatchTestStore.mockClear()
    mockDispatchRealStore.mockClear()
    mockedSystemErrorLogApi.mockClear()
  })

  test('should display a confirm dialog when the camera disconnects during recording', async () => {
    const notification: SystemNotification = {
      code: 'MV-0',
      description: 'Missing Front Left Camera',
      time: '2021-10-13T11:15:57D',
      type: 2,
      id: 1,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.getByText(
        t(
          'acquisition.deactivated_camera.text_recording',
          'Disconnected'
        ) as string
      )
    ).toBeTruthy()
    // should allow to cancel resume recording
    const buttonCancel = screen.getByTestId('alert-cancel-button')
    expect(buttonCancel).toBeTruthy()
  })

  test('should display a custom message when the camera reconnects during recording', async () => {
    const notification: SystemNotification = {
      code: 'MV-0',
      description: 'Missing Front Left Camera',
      time: '2021-10-13T11:15:57D',
      type: 2,
      id: 1,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        ws.send(JSON.stringify({ ...notification, type: 3 }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // update disconnected cameras
    await waitFor(
      () => {
        // disconnected cameras
        store.dispatch(
          cameraDisplayableNamesActions.success({
            groups: mockStore.cameraService.groups,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.getByText(
        t('acquisition.reactivated_camera.text_all', 'Disconnected') as string
      )
    ).toBeTruthy()
    // should stop recording if the user accepts after camera reconnection
    const buttonOk = screen.getByText(
      t('acquisition.reactivated_camera.ok_all', 'Disconnected') as string
    )
    fireEvent.click(buttonOk!)
    // should not resume recording if the user accepts after camera reconnection
    expect(mockDispatchRealStore).not.toHaveBeenCalledWith(
      actionsServiceStartRecordingAction()
    )
    // should log the user choice when the camera reconnects during recording
    expect(mockedSystemErrorLogApi).toHaveBeenCalledWith({
      code: 'saga',
      message:
        '[CAMERA_RECONNECTION] [USER_ACTION] User knows that a camera has been reconnected',
      type: 'message',
    })
    // should not display a cancel button
    const buttonCancel = screen.queryByTestId('alert-cancel-button')
    expect(buttonCancel).not.toBeInTheDocument()
  })

  test('should display a different message when only one camera reconnects during recording', async () => {
    const notification: SystemNotification = {
      code: 'MV-0',
      description: 'Missing Front Left Camera',
      time: '2021-10-13T11:15:57D',
      type: 2,
      id: 1,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        ws.send(JSON.stringify({ ...notification, type: 3 }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // update disconnected cameras
    const newDisplayableCameras: CameraGroup[] = JSON.parse(
      JSON.stringify(mockStore.cameraService.groups)
    )
    const frontCamera = newDisplayableCameras.find((c) => c.name === 'Front')
    frontCamera!.cameras[0]!.active = false
    await waitFor(
      () => {
        // disconnected cameras
        store.dispatch(
          cameraDisplayableNamesActions.success({
            groups: newDisplayableCameras,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      screen.getByText(
        t('acquisition.reactivated_camera.text_some', 'Disconnected') as string
      )
    ).toBeTruthy()
    // should not display a cancel button
    const buttonCancel = screen.queryByTestId('alert-cancel-button')
    expect(buttonCancel).not.toBeInTheDocument()
  })

  test('should stop recording if the user accepts on the camera disconnection dialog', async () => {
    const notification: SystemNotification = {
      code: 'MV-0',
      description: 'Missing Front Left Camera',
      time: '2021-10-13T11:15:57D',
      type: 2,
      id: 1,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // should display a cancel button
    const buttonCancel = screen.queryByTestId('alert-cancel-button')
    expect(buttonCancel).toBeInTheDocument()
    const buttonOk = screen.getByText(
      t('acquisition.deactivated_camera.ok_recording', 'Disconnected') as string
    )
    fireEvent.click(buttonOk!)
    // should log the user choice when the camera disconnects during recording
    expect(mockedSystemErrorLogApi).toHaveBeenCalledWith({
      code: 'saga',
      message:
        '[CAMERA_DISCONNECTION] [USER_ACTION] User stopped recording with a disconnected camera',
      type: 'message',
    })
  })

  test('should hide camera disconnection error from acquisition notifications on center', async () => {
    const notification: SystemNotification = {
      code: 'MV-0',
      description: 'Missing Front Left Camera',
      time: '2021-10-13T11:15:57D',
      type: SystemNotificationType.ERROR,
      id: 1,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
        ws.send(
          JSON.stringify({
            code: 'Another',
            description: 'Another error',
            time: '2021-10-13T11:15:57D',
            type: SystemNotificationType.ERROR,
            id: 2,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.getByTestId('center-slide')).toBeInTheDocument()
    expect(
      screen.queryByText(
        t(
          `notifications.${notification.code}`,
          notification.description
        ) as string
      )
    ).not.toBeInTheDocument()
    // should show camera disconnection error in acquisition notifications on bottom
    expect(screen.getByTestId('bottom-notifications')).toBeInTheDocument()
  })
})
