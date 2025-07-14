/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { queries, RenderResult, screen, waitFor } from '@testing-library/react'
import { ErrorManager } from 'components/organisms/ErrorManager/ErrorManager'
import { store } from 'store'
import api from 'store/features/auth/api'
import { loginActions } from 'store/features/auth/slice'
import { SocketNotificationCodes } from 'store/features/system/notifications/notificationCodes'
import { notificationMessageAction } from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
import { renderWithProvider } from 'utils/test'

describe('ErrorManager (realstore)', () => {
  let component: RenderResult<typeof queries>
  let mockedLoginApi: jest.SpyInstance<any>

  beforeEach(() => {
    mockedLoginApi = jest.spyOn(api, 'login').mockRejectedValue({
      response: {
        status: 401,
        statusText: 'error',
        data: {
          error: {
            code: 'TEST-001',
            description: 'Error {p1} {p2} {p3}',
            p1: '1',
            p2: '2',
            p3: '3',
          },
        },
      },
    })
    component = renderWithProvider(<ErrorManager />)(store)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockedLoginApi.mockRestore()
    jest.useRealTimers()
  })

  test('should replace params in the error', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn())
    await waitFor(
      () => {
        store.dispatch(
          loginActions.request({
            username: 'a',
            password: 'b',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.getByText('Error 1 2 3 - 401')).toBeTruthy()
    jest.spyOn(console, 'error').mockRestore()
  })

  test('should not display socket errors', async () => {
    const notification: SystemNotification = {
      code: SocketNotificationCodes.ROUTING_SOCKET_DISCONNECTED,
      description: 'socket error description',
      type: SystemNotificationType.WARNING,
    }
    await waitFor(
      () => {
        store.dispatch(notificationMessageAction(notification))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(screen.queryByText(notification.description)).not.toBeInTheDocument()
  })
})
