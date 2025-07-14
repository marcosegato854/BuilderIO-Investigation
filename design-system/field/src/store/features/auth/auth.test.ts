/* eslint-disable @typescript-eslint/no-explicit-any */
import { waitFor } from '@testing-library/react'
import moxios from 'moxios'
import { store } from 'store'
import { mkUserInfo } from 'store/features/auth/mockApi'
import {
  getUserInfoActions,
  loginActions,
  selectIsAdmin,
} from 'store/features/auth/slice'
import apiClient from 'store/services/apiClientBackend'
import { mkGetSettings } from 'store/features/settings/mockApi'

const mockCalls = () => {
  moxios.install(apiClient)
  moxios.stubRequest('/user/settings', {
    status: 200,
    response: {},
  })
}

describe('Auth (standard)', () => {
  let mockGetUserInfoAPI: jest.SpyInstance<any>
  let mockedUserSettingsApi: jest.SpyInstance<any>

  beforeEach(async () => {
    mockedUserSettingsApi = mkGetSettings()
    mockGetUserInfoAPI = mkUserInfo()
    mockCalls()
    jest.useFakeTimers()
  })

  afterEach(async () => {
    mockedUserSettingsApi.mockClear()
    mockGetUserInfoAPI.mockClear()
    jest.useRealTimers()
  })

  it('should call the userInfo API when an action is dispatched', async () => {
    await waitFor(
      () => {
        store.dispatch(getUserInfoActions.request())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    expect(mockGetUserInfoAPI).toHaveBeenCalled()
  })

  it('should get user info after login', async () => {
    await waitFor(
      () => {
        store.dispatch(
          loginActions.success({
            authorization: 'bearer D98LCBI8H',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    expect(mockGetUserInfoAPI).toHaveBeenCalled()
  })

  it('should set the user as standard', async () => {
    await waitFor(
      () => {
        store.dispatch(
          loginActions.success({
            authorization: 'bearer D98LCBI8H',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    const state = await store.getState()
    const isAdmin = await selectIsAdmin(state)
    expect(isAdmin).not.toBeTruthy()
  })
})

describe('Auth (admin)', () => {
  let mockGetUserInfoAPI: jest.SpyInstance<any>
  let mockSaveSettingsAPI: jest.SpyInstance<any>

  beforeEach(() => {
    mockSaveSettingsAPI = mkGetSettings()
    mockGetUserInfoAPI = mkUserInfo({
      usertype: 'service',
    })
    mockCalls()
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockSaveSettingsAPI.mockClear()
    mockGetUserInfoAPI.mockClear()
    moxios.uninstall(apiClient)
    jest.useRealTimers()
  })

  it('should set the user as admin', async () => {
    await waitFor(
      () => {
        store.dispatch(
          loginActions.success({
            authorization: 'bearer D98LCBI8H',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    //
    const state = await store.getState()
    const isAdmin = await selectIsAdmin(state)
    expect(isAdmin).toBeTruthy()
  })
})
