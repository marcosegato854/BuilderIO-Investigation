import React from 'react'
import { RenderResult, queries, waitFor } from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import { store } from 'store'
import { rtkServiceTestServerActions } from 'store/features/rtk/slice'
import { resetStoreAction } from 'store/features/global/slice'
import moxios from 'moxios'
import apiClient from 'store/services/apiClientBackend'

import { RTKConnectionInfo } from './RTKConnectionInfo'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('RTKConnectionInfo', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(<RTKConnectionInfo />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})

describe('RTKConnectionInfo (real store)', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    // mock API
    moxios.install(apiClient)
    moxios.stubRequest('/position/ntrip/actiontest', {
      status: 200,
      response: {
        action: {
          status: 'accepted',
          progress: -1,
          description: 'Testing NTRIP',
        },
      },
    })
    //
    component = renderWithProvider(<RTKConnectionInfo />)(store)
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(() => {
    moxios.uninstall(apiClient)
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test("Should display the server test information when it's available", async () => {
    await waitFor(
      () => {
        store.dispatch(
          rtkServiceTestServerActions.success({
            action: {
              status: 'done',
              description: 'info loaded',
              progress: 100,
            },
            result: mockStore.rtkService.testInfo!,
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByTestId('test-info')).toBeTruthy()
  })
})
