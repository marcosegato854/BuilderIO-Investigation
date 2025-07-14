/* eslint-disable @typescript-eslint/no-explicit-any */
import { queries, RenderResult, screen, waitFor } from '@testing-library/react'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import { t } from 'i18n/config'
import WS from 'jest-websocket-mock'
import React from 'react'
import { store } from 'store'
import {
  mkDataStorageProjects,
  mkDisks,
} from 'store/features/dataStorage/mockApi'
import { closeAllDialogsAction } from 'store/features/dialogs/slice'
import { mkResponsiveness } from 'store/features/system/mockApi'
import {
  notificationsSubscribeAction,
  notificationsUnsubscribeAction,
} from 'store/features/system/slice'
import { SystemNotification } from 'store/features/system/types'
import { getSocketUrl } from 'store/services/socketClientBackend'
import { renderWithProvider } from 'utils/test'

// Mock XMLHttpRequest to prevent network requests during tests
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
      } as unknown as XMLHttpRequest)
  )
})

describe('DataStorage notifications', () => {
  let ws: WS
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let mockDisksAPI: jest.SpyInstance<any>
  let mockResponsivenessAPI: jest.SpyInstance<any>
  let mockProjectsAPI: jest.SpyInstance<any>
  let component: RenderResult<typeof queries>

  beforeEach(async () => {
    ws = new WS(`${getSocketUrl()}/notification`)
    store.dispatch(notificationsSubscribeAction())
    mockDisksAPI = mkDisks()
    mockResponsivenessAPI = mkResponsiveness()
    mockProjectsAPI = mkDataStorageProjects()
    // render
    component = renderWithProvider(
      <div>
        <DialogManager />
      </div>
    )(store)
    // wait for ws connection
    await ws.connected
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(async () => {
    await waitFor(
      () => {
        store.dispatch(notificationsUnsubscribeAction())
        store.dispatch(closeAllDialogsAction())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    mockDisksAPI.mockClear()
    mockProjectsAPI.mockClear()
    mockResponsivenessAPI.mockClear()
    WS.clean()
    jest.useRealTimers()
  })

  it('should display disk change notification', async () => {
    const notification: SystemNotification = {
      code: 'DS-001',
      description: 'Disk change detected',
      time: '2021-10-13T11:15:57D',
      type: 0,
      id: 1,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const dialog = component.getByTestId('dialog-component')
    expect(dialog).toBeTruthy()
  })

  it('should display the text translation', async () => {
    const notification: SystemNotification = {
      code: 'DS-001',
      description:
        'Disk change detected, please check on the top bar for the disks available',
      time: '2021-10-13T11:15:57D',
      type: 0,
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
      screen.getByText(t('backend_errors.code.DS-001', 'wrong') as string)
    ).toBeTruthy()
  })

  // TODO move this test to a generic one to check translations
  /*  it('should display the payload text if no translation is available', async () => {
    const notification: SystemNotification = {
      code: 'DS-099',
      description: 'Fancy test description',
      time: '2021-10-13T11:15:57D',
      type: 1,
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
          'notifications.dataStorage.DS-099.text',
          notification.description
        ) as string
      )
    ).toBeTruthy()
  }) */

  it('should display the correct notification type', async () => {
    const notification: SystemNotification = {
      code: 'DS-001',
      description: 'Disk change detected',
      time: '2021-10-13T11:15:57D',
      type: 0,
      id: 1,
    }
    await waitFor(
      () => {
        ws.send(JSON.stringify(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // type 0 is a 'message'
    const dialogType = component.getByTestId('alert-dialog-message')
    expect(dialogType).toBeTruthy()
  })
})
