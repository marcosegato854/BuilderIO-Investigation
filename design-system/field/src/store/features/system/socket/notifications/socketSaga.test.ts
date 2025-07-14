/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { t } from 'i18n/config'
import WS from 'jest-websocket-mock'
import moxios from 'moxios'
import { Store } from 'redux'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { mkDisplayableCameras } from 'store/features/camera/mockApi'
import {
  cameraDisplayableNamesActions,
  selectDisconnectedCameraGroups,
} from 'store/features/camera/slice'
import { CameraGroup } from 'store/features/camera/types'
import { resetStoreAction } from 'store/features/global/slice'
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
import { getSocketUrl } from 'store/services/socketClientBackend'

describe('Notifications Socket', () => {
  let ws: WS
  let store: Store
  let mockDispatch: jest.SpyInstance<any, [action: any]>
  let mockSupportedCamerasAPI: jest.SpyInstance<any>
  const notification: SystemNotification = {
    code: 'code',
    description: 'description',
    time: 'time',
    type: 1,
  }

  beforeEach(async () => {
    store = getTestingStore()
    mockDispatch = jest.spyOn(store, 'dispatch')
    mockSupportedCamerasAPI = mkDisplayableCameras()
    /** mock API */
    moxios.install(apiClient)
    moxios.stubRequest('/camera/displayablecameranames', {
      status: 200,
      response: {
        groups: mockStore.cameraService.groups,
      },
    })
    /** mock SOCKET */
    ws = new WS(`${getSocketUrl()}/notification`)
    store.dispatch(notificationsSubscribeAction())
    await ws.connected
    jest.useFakeTimers()
  })

  afterEach(() => {
    store.dispatch(notificationsUnsubscribeAction())
    store.dispatch(resetStoreAction())
    mockDispatch.mockClear()
    mockSupportedCamerasAPI.mockClear()
    moxios.uninstall(apiClient)
    WS.clean()
    jest.useRealTimers()
  })

  test('socket message gets saved in the store', async () => {
    const singleNotification = { ...notification, description: 'single' }
    ws.send(JSON.stringify(singleNotification))
    expect(store.getState().system.realTimeNotifications).toEqual([
      singleNotification,
    ])
  })

  test('rapid socket messages get saved in the store', async () => {
    // test rapid messages
    Array(5)
      .fill(-1)
      .forEach((_, index) => {
        ws.send(JSON.stringify({ ...notification, code: `save-code-${index}` }))
      })
    expect(store.getState().system.realTimeNotifications.length).toBe(5)
  })

  test('should replace params in the notificaiton', async () => {
    const testNotification: SystemNotification = {
      code: 'AA-0',
      description: 'Notification {p1} {p2} {p3}',
      time: '2021-10-13T11:15:57D',
      type: SystemNotificationType.ERROR,
      p1: '1',
      p2: '2',
      p3: '3',
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(testNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(store.getState().system.realTimeNotifications[0].description).toBe(
      'Notification 1 2 3'
    )
  })

  test('notification removal message removes the item from the store', async () => {
    // test rapid messages
    Array(5)
      .fill(-1)
      .forEach((_, index) => {
        ws.send(
          JSON.stringify({ ...notification, code: `remove-code-${index}` })
        )
      })
    expect(store.getState().system.realTimeNotifications.length).toBe(5)
    ws.send(
      JSON.stringify({
        ...notification,
        code: 'remove-code-1',
        type: SystemNotificationType.REMOVE,
      })
    )
    expect(store.getState().system.realTimeNotifications.length).toBe(4)
  })

  /** disabled PEF-1202 */
  // test('should update a notification with the same code, not add it', async () => {
  //   // test rapid messages
  //   Array(5)
  //     .fill(-1)
  //     .forEach((_, index) => {
  //       ws.send(
  //         JSON.stringify({ ...notification, code: `remove-code-${index}` })
  //       )
  //     })
  //   const newDescription = 'new description'
  //   ws.send(
  //     JSON.stringify({
  //       ...notification,
  //       code: 'remove-code-0',
  //       description: newDescription,
  //     })
  //   )
  //   expect(store.getState().system.realTimeNotifications.length).toBe(5)
  //   expect(store.getState().system.realTimeNotifications[0].description).toBe(
  //     newDescription
  //   )
  // })

  /** added PEF-1202 */
  test('should add a notification with the same code, not replace it', async () => {
    // test rapid messages
    Array(5)
      .fill(-1)
      .forEach((_, index) => {
        ws.send(
          JSON.stringify({ ...notification, code: `remove-code-${index}` })
        )
      })
    const newDescription = 'new description'
    ws.send(
      JSON.stringify({
        ...notification,
        code: 'remove-code-0',
        description: newDescription,
      })
    )
    expect(store.getState().system.realTimeNotifications.length).toBe(6)
    expect(
      store.getState().system.realTimeNotifications[0].description
    ).not.toBe(newDescription)
    expect(store.getState().system.realTimeNotifications[5].description).toBe(
      newDescription
    )
  })

  /** disabled, they get cleaned at AcquisitionView unmount */
  // test('real time messages get cleaned after deactivating the system', async () => {
  //   // test rapid messages
  //   Array(5)
  //     .fill(-1)
  //     .forEach((_, index) => {
  //       ws.send(
  //         JSON.stringify({ ...notification, code: `clean-code-${index}` })
  //       )
  //     })
  //   expect(store.getState().system.realTimeNotifications.length).toBe(5)
  //   // deactivate the system
  //   await waitFor(
  //     () => {
  //       store.dispatch(actionsServiceDeactivateSystemAction())
  //       ws.send(JSON.stringify({ ...notification, code: 'last' }))
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   expect(store.getState().system.realTimeNotifications.length).toBe(1)
  // })

  test('should dispatch an open dialog action when receiving a camera disconnected message', async () => {
    // test disconnected message
    const disconnectedNotification: SystemNotification = {
      code: 'MV-0',
      description: 'MV-Camera FRONT LEFT unexpected state: camera_state',
      time: 'time',
      type: 2,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(disconnectedNotification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(store.getState().dialogs.dialogs.length).toBe(1)
    expect(
      (store.getState().dialogs.dialogs[0]?.componentProps as IAlertProps).title
    ).toBe(t('acquisition.deactivated_camera.title', 'Wrong') as string)
    // test disconnected removal
    await waitFor(
      () => {
        ws.send(JSON.stringify({ ...disconnectedNotification, type: 3 }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      (store.getState().dialogs.dialogs[0]?.componentProps as IAlertProps).title
    ).toBe(t('acquisition.reactivated_camera.title', 'Wrong') as string)
    expect(store.getState().errors.errors.length).toBe(0)
  })

  test('should call the available cameras API if a camera disconnects', async () => {
    // test disconnected message
    const disconnectedNotification: SystemNotification = {
      code: 'MV-1',
      description: 'MV-Camera FRONT LEFT unexpected state: camera_state',
      time: 'time',
      type: 2,
    }
    ws.send(JSON.stringify(disconnectedNotification))
    expect(mockSupportedCamerasAPI).toHaveBeenCalled()
  })

  test('should call the available cameras API if a camera reconnects', async () => {
    // test disconnected message
    const reconnectedNotification: SystemNotification = {
      code: 'MV-1',
      description: 'MV-Camera FRONT LEFT unexpected state: camera_state',
      time: 'time',
      type: 3,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(reconnectedNotification))
      },
      { timeout: 500 }
    )
    jest.runOnlyPendingTimers()
    expect(mockSupportedCamerasAPI).toHaveBeenCalled()
  })

  test('should save disconnected cameras state', async () => {
    await store.dispatch(
      cameraDisplayableNamesActions.success({
        groups: mockStore.cameraService.groups,
      })
    )
    const newCameras: CameraGroup[] = JSON.parse(
      JSON.stringify(mockStore.cameraService.groups)
    )
    const sphereCamera = newCameras.find((c) => c.name === 'Sphere')
    sphereCamera!.cameras[0]!.active = false
    await store.dispatch(
      cameraDisplayableNamesActions.success({
        groups: newCameras,
      })
    )
    expect(selectDisconnectedCameraGroups(store.getState())[0]).toEqual(
      newCameras[0]
    )
  })

  it('marks the connection as active when it successfully connects to the ws server', () => {
    expect(store.getState().system.notificationsSocketConnected).toBe(true)
  })

  it('marks the connection as inactive after a disconnect', async () => {
    ws.close()
    await ws.closed
    expect(store.getState().system.notificationsSocketConnected).toBe(false)
  })

  it('marks the connection as inactive after a connection error', async () => {
    ws.error()
    await ws.closed
    expect(store.getState().system.notificationsSocketConnected).toBe(false)
  })
})

describe('Notifications Socket (no unsubscribe)', () => {
  let ws: WS
  const store: Store = getTestingStore()
  const mockDispatch = jest.spyOn(store, 'dispatch')
  const mockSupportedCamerasAPI = mkDisplayableCameras()

  beforeEach(async () => {
    // mock API
    moxios.install(apiClient)
    moxios.stubRequest('/camera/displayablecameranames', {
      status: 200,
      response: {
        groups: mockStore.cameraService.groups,
      },
    })
    // mock SOCKET
    WS.clean()
    ws = new WS(`${getSocketUrl()}/notification`)
    store.dispatch(notificationsSubscribeAction())
    await ws.connected
  })

  afterEach(() => {
    mockDispatch.mockClear()
    mockSupportedCamerasAPI.mockClear()
    moxios.uninstall(apiClient)
    WS.clean()
  })

  it("it doesn't reconnect if receives unsubscribe action", async () => {
    store.dispatch(notificationsUnsubscribeAction())
    expect(mockDispatch).toHaveBeenLastCalledWith(
      notificationsUnsubscribeAction()
    )
  })

  it('reconnects after losing the ws connection', async () => {
    ws.error()
    await ws.closed
    expect(store.getState().system.notificationsSocketConnected).toBe(false)

    WS.clean()
    ws = new WS(`${getSocketUrl()}/notification`)
    await ws.connected // reconnected!

    expect(store.getState().system.notificationsSocketConnected).toBe(true)
  })
})
