/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import { store } from 'store/configureStore'
import { setTokenAction } from 'store/features/auth/slice'
import {
  mkSystemNotifications,
  mkSystemState,
} from 'store/features/system/mockApi'
import { systemStateActions } from 'store/features/system/slice'

describe('System State', () => {
  const mockedSystemStateApi = mkSystemState({
    state: 'Activating',
  })
  const mockedSystemNotificationsAPI = mkSystemNotifications()
  beforeEach(async () => {
    jest.useFakeTimers()
    await waitFor(
      () => {
        store.dispatch(setTokenAction('token'))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
  })

  afterEach(() => {
    mockedSystemStateApi.mockClear()
    mockedSystemNotificationsAPI.mockClear()
    jest.useRealTimers()
  })

  test('shoul retry system state API when it fails', async () => {
    await waitFor(
      () => {
        store.dispatch(systemStateActions.failure())
      },
      { timeout: 4000 }
    )
    jest.advanceTimersByTime(4000)
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    expect(mockedSystemStateApi).toHaveBeenCalledTimes(1)
  })
})
