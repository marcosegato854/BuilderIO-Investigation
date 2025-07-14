import React from 'react'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { LoadingScreen } from 'components/organisms/LoadingScreen/LoadingScreen'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('LoadingScreen (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<LoadingScreen />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
