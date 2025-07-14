/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import WS from 'jest-websocket-mock'
import { Store } from 'redux'
// import { store } from 'store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { mkJobDetail } from 'store/features/dataStorage/mockApi'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { pointCloudUnsubscribeAction } from 'store/features/pointcloud/slice'
import {
  autocaptureStatusActions,
  routingStatusActions,
  routingUnsubscribeAction,
} from 'store/features/routing/slice'
import {
  modulesActions,
  notificationsSubscribeAction,
  notificationsUnsubscribeAction,
  stateUnsubscribeAction,
} from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
import { mockStore } from 'store/mock/mockStoreTests'
import { getSocketUrl } from 'store/services/socketClientBackend'

describe('System Socket', () => {
  let store: Store
  let wsNorification: WS
  const mockGetJobAPI = mkJobDetail()

  beforeEach(async () => {
    store = getTestingStore()
    store.dispatch(
      modulesActions.success({ modules: mockStore.system.modules })
    )
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
    store.dispatch(
      dataStorageProjectDetailActions.success(
        mockStore.dataStorageService.currentProject!
      )
    )
    store.dispatch(
      dataStorageJobDetailActions.success({
        job: mockStore.dataStorageService.currentJob!,
      })
    )
    wsNorification = new WS(`${getSocketUrl()}/notification`)
    store.dispatch(notificationsSubscribeAction())
    await wsNorification.connected
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockGetJobAPI.mockClear()
    store.dispatch(resetStoreAction())
    store.dispatch(stateUnsubscribeAction())
    store.dispatch(routingUnsubscribeAction())
    store.dispatch(pointCloudUnsubscribeAction())
    store.dispatch(notificationsUnsubscribeAction())
    WS.clean()
    jest.useRealTimers()
  })

  test('should call the get job API when receiving a specific notification', async () => {
    const automaticCameraOrientationNotification: SystemNotification = {
      id: 22,
      code: 'CAM-082',
      description: 'Automatic camera orientation',
      type: SystemNotificationType.INTERNAL,
    }
    await waitFor(
      () => {
        wsNorification.send(
          JSON.stringify(automaticCameraOrientationNotification)
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockGetJobAPI).toHaveBeenCalled()
  })
})
